const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function createStandardQueryAfterUpdateOptions () {
    return {
        "update": "false",
        "isolation": "different-transaction",
        "preventDeadlocks": true,
        "timestamp": 0
    };
}

function mlExecuteQueryAfterUpdateOnStaging (functionImpl) {
    const options = createStandardQueryAfterUpdateOptions();
    options.database = xdmp.database(datahub.config.STAGINGDATABASE)
    return xdmp.invokeFunction(functionImpl, options);
}

function runLegacyFlow (entity, flowName, options = {}) {
    const flow = flowLib.getFlow(entity, flowName, "harmonize")
    let ids = mlExecuteQueryAfterUpdateOnStaging(function () {
        return flowLib.runCollector(flow, sem.uuidString(), options)
    });
}

function getFlowsList () {



    let result = {
        legacyFlows: [],
        dhfFlows: []
    }
    xdmp.invokeFunction(() => {
        let legacyFlowDocs = cts.uriMatch("/entities/*.xml")
        let i = 1
        for (let legacyFlowUri of legacyFlowDocs.toArray()) {
            let legacyFlowDoc = cts.doc(legacyFlowUri)
            result.legacyFlows.push({
                flowId: i,
                flowName: legacyFlowDoc.root.xpath("name/text()"),
                entity: legacyFlowDoc.root.xpath("entity/text()"),
                type: legacyFlowDoc.root.xpath("type/text()"),
                format: legacyFlowDoc.root.xpath("data-format/text()"),
                code: legacyFlowDoc.root.xpath("code-format/text()"),
                collector: legacyFlowDoc.root.xpath("collector/@module"),
                main: legacyFlowDoc.root.xpath("main/@module")
            })
            i++
        }
    }, { database: xdmp.database(datahub.config.MODULESDATABASE) })


    result.dhfFlows = fn.head(xdmp.invokeFunction(() => {
        return cts.search(
            cts.andNotQuery(cts.collectionQuery("http://marklogic.com/data-hub/flow"), cts.orQuery([
                cts.documentQuery(["/flows/default-ingestion.flow.json"
                    , "/flows/default-map-and-master.flow.json"
                    , "/flows/default-mapping.flow.json"
                    , "/flows/default-mastering.flow.json"
                    , "/flows/manual-merge-mastering.flow.json"
                    , "/flows/unmerge-mastering.flow.json"])
            ])
            )).toArray()


    }, { database: xdmp.database(datahub.config.STAGINGDATABASE) }))


    result.dhfEntities = fn.head(xdmp.invokeFunction(() => {
        return cts.search(
            cts.andNotQuery(cts.collectionQuery("http://marklogic.com/entity-services/models"), cts.orQuery([
                cts.documentQuery(["/step-definitions/mapping/marklogic/entity-services-mapping.step.json"])
            ])
            )).toArray()


    }, { database: xdmp.database(datahub.config.STAGINGDATABASE) }))



    result


    return result

}

function getKpis () {
    let result =
        fn.head(xdmp.invokeFunction(() => {
            return {
                Job: cts.estimate(cts.collectionQuery("Job")),
                Batch: cts.estimate(cts.collectionQuery("Batch")),
                job: cts.estimate(cts.collectionQuery("job")),
                trace: cts.estimate(cts.collectionQuery("trace")),
                provenance: cts.estimate(cts.collectionQuery("http://marklogic.com/provenance-services/record")),
                dhf: {},
                legacy: {}
            }
        }, { database: xdmp.database(datahub.config.JOBDATABASE) }))

    fn.head(xdmp.invokeFunction(() => {
        let dhfJobs = cts.search(cts.collectionQuery("Job"))
        for (let dhfJob of dhfJobs) {
            if (result.dhf.hasOwnProperty(dhfJob.root.job.jobStatus)) {
                result.dhf[dhfJob.root.job.jobStatus] = result.dhf[dhfJob.root.job.jobStatus] + 1
            } else {
                result.dhf[dhfJob.root.job.jobStatus] = 1
            }
        }

        let legacyJobs = cts.search(cts.collectionQuery("job"))
        for (let legacyJob of legacyJobs) {
            if (result.legacy.hasOwnProperty(legacyJob.root.status)) {
                result.legacy[legacyJob.root.status] = result.legacy[legacyJob.root.status] + 1
            } else {
                result.legacy[legacyJob.root.status] = 1
            }
        }
    }, { database: xdmp.database(datahub.config.JOBDATABASE) }))


    return result
}

function get (context, params) {

    switch (params.mode) {
        case 'kpi':
            return getKpis();
        case 'collections':
            return fn.head(xdmp.invokeFunction(() => { return cts.collections("*").toArray() }, { database: xdmp.database(datahub.config.JOBDATABASE) }))
        case 'flowsDefinition':
            return getFlowsList()
        default:
            return "incompatible mode"
    }

}

function post (context, params, input) {
    input = input.toObject();

    //params.service = jobs
    //params.service = batchs



    if (input.service == "jobs") {

        let collectionName = "Job" // job
        let indexName = "timeStarted" // startTime
        if (input.type == 2) {
            collectionName = "job"
            indexName = "startTime"
        }

        let andQuery = [cts.collectionQuery(collectionName)]
        if (input.filter)
            andQuery.push(cts.wordQuery("*" + input.filter + "*", "wildcarded"))

        let total = fn.head(xdmp.invokeFunction(() => { return fn.count(cts.search(cts.andQuery(andQuery))) }, { database: xdmp.database(datahub.config.JOBDATABASE) }))
        let jobs = fn.head(xdmp.invokeFunction(() => { return fn.subsequence(cts.search(cts.andQuery(andQuery), cts.indexOrder(cts.jsonPropertyReference(indexName), "descending")), ((input.page - 1) * input.page_size) + 1, input.page_size).toArray() }, { database: xdmp.database(datahub.config.JOBDATABASE) }))

        let results = {
            total: total,
            jobs: []
        }

        if (input.type == 1) {
            for (let job of jobs) {
                let jobType = "dhf"

                let steps = []

                for (let step of Object.keys(job.root.job.stepResponses)) {
                    steps.push({
                        stepName: job.root.job.toObject().stepResponses[step].stepName,
                        type: job.root.job.toObject().stepResponses[step].stepDefinitionType,
                        status: job.root.job.toObject().stepResponses[step].status,
                        totalEvents: job.root.job.toObject().stepResponses[step].totalEvents,
                        successfulEvents: job.root.job.toObject().stepResponses[step].successfulEvents,
                        failedEvents: job.root.job.toObject().stepResponses[step].failedEvents,
                        successfulBatches: job.root.job.toObject().stepResponses[step].successfulBatches,
                        success: job.root.job.toObject().stepResponses[step].success

                    })
                }

                results.jobs.push({
                    jobId: job.root.job.jobId,
                    flowType: jobType,
                    flow: job.root.job.flow,
                    user: job.root.job.user,
                    jobStatus: job.root.job.jobStatus,
                    start: job.root.job.timeStarted,
                    end: job.root.job.timeEnded,
                    steps: steps
                })
            }
        } else {


            for (let job of jobs) {
                let jobType = "legacy"
                let steps = []
                if (Array.isArray(job.root.jobOutput.toObject())) {
                    for (let step of job.root.jobOutput.toObject()) {
                        if (step != "{}") {
                            steps.push(step)
                        }

                    }
                }

                results.jobs.push({
                    jobId: job.root.jobId,
                    flowType: jobType,
                    entityName: job.root.entityName,
                    flow: job.root.flowName,
                    jobStatus: job.root.status,
                    start: job.root.startTime,
                    end: job.root.endTime,
                    steps: steps
                })
            }

        }

        return results

    }

    if (input.service == "batchs") {
        let jobId = input.jobId

        if (input.type == 1) {

            let total = fn.head(xdmp.invokeFunction(() => {
                return fn.count(cts.search(cts.andQuery([
                    cts.collectionQuery("Batch")
                    , cts.jsonPropertyValueQuery("jobId", jobId)])
                ))
            }, { database: xdmp.database(datahub.config.JOBDATABASE) }))

            let batchs = fn.head(xdmp.invokeFunction(() => {
                return fn.subsequence(cts.search(

                    cts.andQuery([
                        cts.collectionQuery("Batch")
                        , cts.jsonPropertyValueQuery("jobId", jobId)
                        , cts.orQuery([
                            cts.trueQuery()
                            , cts.notQuery(cts.jsonPropertyValueQuery("errorStack", null, null, 10))
                            , cts.jsonPropertyValueQuery("errorStack", null, null, 5)
                        ])])
                    , [cts.indexOrder(cts.jsonPropertyReference("timeStarted"), "descending"), cts.scoreOrder("descending")]), ((input.page - 1) * input.page_size) + 1, input.page_size).toArray()
            }, { database: xdmp.database(datahub.config.JOBDATABASE) }))


            batchs

            let results = {
                total: total,
                batchs: []
            }
            for (let batch of batchs) {
                results.batchs.push({
                    batchId: batch.root.batch.batchId,
                    stepNumber: batch.root.batch.stepNumber,
                    batchStatus: batch.root.batch.batchStatus,
                    hostName: batch.root.batch.hostName,
                    uris: batch.root.batch.uris,
                    error: batch.root.batch.error,
                    errorStack: batch.root.batch.errorStack,
                    timeStarted: batch.root.batch.timeStarted,
                    timeEnded: batch.root.batch.timeEnded
                })
            }
            return results
        } else {
            let batchCollection = "trace"

            let total = fn.head(xdmp.invokeFunction(() => {
                return fn.count(cts.search(cts.andQuery([
                    cts.collectionQuery(batchCollection)
                    , cts.jsonPropertyValueQuery("jobId", jobId)])
                ))
            }, { database: xdmp.database(datahub.config.JOBDATABASE) }))

            let batchs = fn.head(xdmp.invokeFunction(() => {
                return fn.subsequence(cts.search(cts.andQuery([
                    cts.collectionQuery(batchCollection)
                    , cts.jsonPropertyValueQuery("jobId", jobId)
                    , cts.orQuery([
                        cts.trueQuery()
                        , cts.jsonPropertyValueQuery("hasError", null, null, 10)
                    ])])
                    , [cts.scoreOrder("descending")]), ((input.page - 1) * input.page_size) + 1, input.page_size).toArray()
            }, { database: xdmp.database(datahub.config.JOBDATABASE) }))



            let results = {
                total: total,
                batchs: []
            }
            for (let batch of batchs) {

                let steps = []
                for (let step of batch.root.trace.steps.toObject()) {
                    steps.push({
                        entity: step.options.entity,
                        flow: step.options.flow,
                        flowtype: step.options.flowtype,
                        input: step.input,
                        label: step.label,
                        error: step.error
                    })
                }

                results.batchs.push({
                    batchId: batch.root.trace.traceId,
                    batchStatus: batch.root.trace.hasError ? "HAS_ERROR" : "NO_ERROR",
                    steps: steps,

                })
            }
            return results
        }
    }

    return ""
}

function del (context, params, input) {
}

function put (context, params, input) {

}


exports.GET = get;
exports.PUT = put;
exports.POST = post;
exports.DELETE = del;
