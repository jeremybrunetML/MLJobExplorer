<template>
  <q-page padding>
    <q-btn
      class="float-right"
      v-go-back=" '/' "
      color="primary"
      label="Return"
    />
    <div class="q-pa-md">

      <div class="row">
        <div class="col">
          <b>Job Id:</b> {{job.jobId}}
        </div>
        <div class="col">
          <b>Flow Type:</b> {{job.flowType}}
        </div>
        <div class="col">
          <b>Flow Name:</b> {{job.flow}}
        </div>
      </div>

      <div class="row">
        <div class="col">
          <b>Status:</b> {{job.jobStatus}}
        </div>
        <div class="col">
          <b>Start:</b> {{job.start}}
        </div>
        <div class="col">
          <b>End:</b> {{job.end}}
        </div>
      </div>

    </div>

    <div class="q-pa-md">
      <q-table
        :data="job.steps"
        :columns="columnsSteps"
        row-key="stepName"
        :rows-per-page-options="[0]"
        :pagination.sync="paginationSteps"
        v-if="this.$router.currentRoute.query.jobType === '1'"
        hide-bottom
      />
    </div>

    <div
      class="q-pa-md"
      v-if="this.$router.currentRoute.query.jobType === '1'"
    >
      <q-table
        title="Batchs"
        :data="batchsList"
        :columns="columnsBatchs"
        row-key="batchId"
        :pagination.sync="paginationBatchs"
        :loading="loadingBatchs"
        :filter="filterBatches"
        @request="getAllBatchs"
        binary-state-sort
      >
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filterBatches"
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th auto-width />
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn
                size="sm"
                class="text-teal"
                round
                dense
                @click="props.expand = !props.expand"
                :icon="props.expand ? 'remove' : 'add'"
              />

            </q-td>
            <q-td auto-width>
              <q-icon
                size="sm"
                v-if="props.row.errorStack  || props.row.error"
                class="text-red"
                name="warning"
              />
            </q-td>
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.value }}
            </q-td>
          </q-tr>
          <q-tr
            v-show="props.expand"
            :props="props"
          >
            <q-td colspan="100%">

              <div class="q-pa-md">

                <div
                  class="row"
                  v-if="props.row.errorStack"
                >
                  <q-list
                    bordered
                    separator
                    class="text-red"
                  >
                    <q-item>
                      <q-item-section avatar>
                        <q-icon
                          class="text-red"
                          name="warning"
                        />
                      </q-item-section>

                      <q-item-section><span>{{props.row.errorStack}}</span></q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div class="row">
                  <div class="q-pa-md wrap">
                    <div class="row">
                      <div
                        v-for="uri in props.row.uris"
                        :key="uri"
                      >
                        <div style="padding:5px">{{uri}}</div>

                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>

      </q-table>
    </div>

    <div
      class="q-pa-md"
      v-if="this.$router.currentRoute.query.jobType === '2'"
    >
      <q-table
        title="Traces"
        :data="tracesList"
        :columns="columnsTraces"
        row-key="batchId"
        :pagination.sync="paginationTraces"
        :loading="loadingTraces"
        :filter="filterTraces"
        @request="getAllTraces"
        binary-state-sort
      >
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filterTraces"
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th auto-width />
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn
                size="sm"
                class="text-teal"
                round
                dense
                @click="props.expand = !props.expand"
                :icon="props.expand ? 'remove' : 'add'"
              />

            </q-td>
            <q-td auto-width>
              <q-icon
                size="sm"
                class="text-red"
                name="warning"
              />
            </q-td>
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.value }}
            </q-td>
          </q-tr>
          <q-tr
            v-show="props.expand"
            :props="props"
          >
            <q-td colspan="100%">

              <div class="q-pa-md">

                <div
                  class="row"
                  v-if="props.row.steps"
                >

                  <q-table
                    title="Steps"
                    row-key="label"
                    :data="props.row.steps"
                    :columns="columnsTrace"
                    binary-state-sort
                  >

                    <template v-slot:header="props">
                      <q-tr :props="props">
                        <q-th auto-width />
                        <q-th
                          v-for="col in props.cols"
                          :key="col.name"
                          :props="props"
                        >
                          {{ col.label }}
                        </q-th>
                        <q-th auto-width />
                      </q-tr>
                    </template>

                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td auto-width>
                          <q-btn
                            size="sm"
                            class="text-teal"
                            round
                            dense
                            @click="props.expand = !props.expand"
                            :icon="props.expand ? 'remove' : 'add'"
                          />

                        </q-td>
                        <q-td
                          v-for="col in props.cols"
                          :key="col.name"
                          :props="props"
                        >
                          {{ col.value }}
                        </q-td>
                        <q-td>
                          <q-btn size="sm" v-if="props.row.input" push color="brown-5" round icon="cloud_download"
                            @click="downloadJson(props.row.input,'input')"
                          > <q-tooltip>
                              Download json
                            </q-tooltip>
                          </q-btn>
                        </q-td>
                      </q-tr>
                      <q-tr
                        v-show="props.expand"
                        :props="props"
                      >
                        <q-td colspan="100%">

                          <div class="q-pa-md">

                            <div
                                class="row"
                                v-if="props.row.error"
                              >
                                <q-list
                                  bordered
                                  separator

                                >
                                  <q-item>
                                    <q-item-section avatar>
                                      <q-icon
                                        class="text-red"
                                        name="warning"
                                      />
                                    </q-item-section>

                                    <q-item-section v-if="!props.row.error.formatString" class="text-red"><span>{{props.row.error.message}}</span></q-item-section>
                                    <q-item-section v-if="props.row.error.formatString" class="text-red"><span>{{props.row.error.formatString}}</span></q-item-section>
                                    <q-item-section v-if="props.row.error.stack"><span>{{props.row.error.stack}}</span></q-item-section>
                                    <q-item-section v-if="props.row.error.data"><span>{{props.row.error.data}}</span></q-item-section>
                                    <q-item-section v-if="props.row.error.stacks">

                                    <div class="row" >
                                      <div class="q-pa-md wrap">
                                        <div class="row">
                                          <div
                                            v-for="stack in props.row.error.stacks"
                                            :key="stack"
                                          >
                                            <div>{{stack}}</div>

                                          </div>
                                        </div>

                                      </div>
                                    </div>

                                    </q-item-section>

                                  </q-item>
                                </q-list>
                              </div>

                          </div>
                        </q-td>
                      </q-tr>
                    </template>

                  </q-table>

                </div>

              </div>
            </q-td>
          </q-tr>
        </template>

      </q-table>
    </div>

  </q-page>
</template>

<script>

import Downloader from '../components/downloader.js'

export default {
  mixins: [
    Downloader
  ],
  name: 'JobPage',
  data: () => ({
    loadingBatchs: false,
    loadingTraces: false,
    job: {},
    paginationSteps: {
      page: 1,
      rowsPerPage: 0 // 0 means all rows
    },
    paginationUris: {
      page: 1,
      rowsPerPage: 0 // 0 means all rows
    },
    columnsSteps: [
      { name: 'stepName', align: 'center', label: 'stepName', field: 'stepName', style: 'min-width: 180px;max-width: 180px' },
      { name: 'type', align: 'center', label: 'type', field: 'type', style: 'min-width: 90px;max-width: 90px' },
      { name: 'status', align: 'center', label: 'status', field: 'status', style: 'min-width: 150px;max-width: 150px' },
      { name: 'totalEvents', align: 'center', label: 'totalEvents', field: 'totalEvents', style: 'min-width: 80px;max-width: 80px' },
      { name: 'successfulEvents', align: 'center', label: 'successfulEvents', field: 'successfulEvents', style: 'min-width: 80px;max-width: 80px' },
      { name: 'failedEvents', align: 'center', label: 'failedEvents', field: 'failedEvents', style: 'min-width: 80px;max-width: 80px' },
      { name: 'successfulBatches', align: 'center', label: 'successfulBatches', field: 'successfulBatches', style: 'min-width: 80px;max-width: 80px' },
      { name: 'success', align: 'center', label: 'success', field: 'success', style: 'min-width: 80px;max-width: 80px' }
    ],
    batchsList: [],
    tracesList: [],
    paginationBatchs: {
      page: 1,
      rowsNumber: 10 // specifying this determines pagination is server-side
    },
    paginationTraces: {
      page: 1,
      rowsNumber: 10 // specifying this determines pagination is server-side
    },
    pagination: {
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    },
    columnsBatchs: [
      { name: 'desc', required: true, label: 'batchId', align: 'left', field: row => row.batchId, format: val => `${val}`, sortable: true, style: 'min-width: 300px;max-width:  300px' },
      { name: 'stepNumber', align: 'center', label: 'stepNumber', field: 'stepNumber', sortable: true, style: 'min-width: 80px;max-width: 80px' },
      { name: 'batchStatus', label: 'batchStatus', field: 'batchStatus', sortable: true, style: 'min-width: 100px;max-width: 100px' },
      { name: 'hostName', label: 'hostName', field: 'hostName', sortable: true, style: 'min-width: 250px;max-width: 250px' },
      { name: 'timeStarted', label: 'timeStarted', field: 'timeStarted', sortable: true, style: 'min-width: 150px;max-width: 150px' },
      { name: 'timeEnded', label: 'timeEnded', field: 'timeEnded', sortable: true, style: 'min-width: 150px;max-width: 150px' }
    ],
    columnsTrace: [
      { name: 'flow', label: 'flow', align: 'left', field: 'flow', style: 'min-width: 300px;max-width:  300px' },
      { name: 'entity', label: 'entity', field: 'entity', style: 'min-width: 80px;max-width: 80px' },
      { name: 'label', label: 'label', field: 'label', style: 'min-width: 150px;max-width: 150px' }
    ],
    columnsTraces: [
      { name: 'desc', required: true, label: 'batchId', align: 'left', field: row => row.batchId, format: val => `${val}`, sortable: true, style: 'min-width: 300px;max-width:  300px' },
      { name: 'batchStatus', label: 'batchStatus', field: 'batchStatus', sortable: true, style: 'min-width: 150px;max-width: 150px' }
    ],
    loading: false,
    filterBatches: null,
    filterTraces: null
  }),
  methods: {
    getJob () {
      const body = {
        service: 'jobs',
        page: 1,
        page_size: 1,
        filter: this.$router.currentRoute.query.jobId,
        type: this.$router.currentRoute.query.jobType
      }

      this.$axios
        .post('/v1/resources/jobService', body)
        .then(({ data }) => {
          this.job = data.jobs[0]
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loading = false
        })
    },
    getAllBatchs ({ pagination, filter }) {
      this.loadingBatchs = true
      const body = {
        service: 'batchs',
        page: pagination.page,
        page_size: pagination.rowsPerPage,
        jobId: this.$router.currentRoute.query.jobId,
        type: this.$router.currentRoute.query.jobType,
        filter: filter
      }

      this.$axios
        .post('/v1/resources/jobService', body)
        .then(({ data }) => {
          // updating pagination to reflect in the UI
          this.paginationBatchs = pagination

          // we also set (or update) rowsNumber
          this.paginationBatchs.rowsNumber = data.total

          this.batchsList = data.batchs
          this.loadingBatchs = false
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loadingBatchs = false
        })
    },
    getAllTraces ({ pagination, filter }) {
      this.loadingTraces = true
      const body = {
        service: 'batchs',
        page: pagination.page,
        page_size: pagination.rowsPerPage,
        jobId: this.$router.currentRoute.query.jobId,
        type: this.$router.currentRoute.query.jobType,
        filter: filter
      }

      this.$axios
        .post('/v1/resources/jobService', body)
        .then(({ data }) => {
          // updating pagination to reflect in the UI
          this.paginationTraces = pagination

          // we also set (or update) rowsNumber
          this.paginationTraces.rowsNumber = data.total

          this.tracesList = data.batchs
          this.loadingTraces = false
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loadingTraces = false
        })
    }
  },
  mounted () {
    // get initial data from server (1st page)
    this.getJob()
    if (this.$router.currentRoute.query.jobType === '1') {
      this.getAllBatchs({
        pagination: this.pagination,
        filter: undefined
      })
    }
    if (this.$router.currentRoute.query.jobType === '2') {
      this.getAllTraces({
        pagination: this.pagination,
        filter: undefined
      })
    }
  },
  framework: {
    // NOT needed if using auto-import feature:
    directives: [
      'GoBack'
    ]
  }
  // components: { /* Network, */IEcharts },

}
</script>
<style>
.q-td {
  /* don't shorten cell contents */
  white-space: normal !important;
  word-wrap: break-word;
}
</style>
