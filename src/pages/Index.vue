<template>
  <q-page class>

    <div class="row items-start">

      <div class="q-pa-md">
        <q-table
          title="Jobs"
          :data="jobList"
          :columns="columnsJobs"
          row-key="jobId"
          :pagination.sync="paginationJobs"
          :loading="loadingJobs"
          :filter="filter"
          @request="getAllJobs"
          binary-state-sort
        >
          <template v-slot:top-right>
            <div class="q-pa-md">
              <div class="q-gutter-md row">
                <q-input
                  filled
                  v-model="filter"
                  label="Search For a Job"
                  debounce="500"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <q-btn-toggle
                  v-model="toggleModel"
                  class="my-custom-toggle"
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  color="white"
                  text-color="primary"
                  @click="getAllJobs({
                          pagination: paginationJobs,
                          filter: filter
                        })"
                  :options="[
                    {label: 'datahub 5', value: '1'},
                    {label: 'Legacy', value: '2'}
                  ]"
                />

              </div>
            </div>
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
                  v-if="props.row.steps.length>0"
                  @click="props.expand = !props.expand"
                  :icon="props.expand ? 'remove' : 'add'"
                />

              </q-td>

              <q-td auto-width>
                <div    v-for="col in props.cols"
                :key="col.name"
                :props="props">
                        <q-icon v-if="col.value==='finished_with_errors' || col.value==='FAILED'" size="sm"  class="text-red" name="warning" />
                </div >

              </q-td>

              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                  {{ col.value }}
              </q-td>
            <q-td>
            <router-link :to="{ name: 'Job', query: { jobId: props.row.jobId, jobType: toggleModel} }">
                 <q-btn dense round flat color="grey"  icon="search"></q-btn>
            </router-link>

            </q-td>
            </q-tr>
            <q-tr
              v-show="props.expand"
              :props="props"
            >
              <q-td colspan="100%">

                <div class="q-pa-md">
                  <q-table
                    v-if="toggleModel==1"
                    :data="props.row.steps"
                    :columns="columnsSteps"
                    row-key="stepName"
                    :rows-per-page-options="[0]"
                    :pagination.sync="paginationSteps"
                    hide-bottom
                    style="white-space: normal;"
                  />
                  <div class="q-pa-md " style="white-space: normal;" v-if="toggleModel==2" >
                    <div class="row" >
                      <div
                        v-for="step in props.row.steps"
                        :key="step"
                      >

                        <div style="padding:5px;" >{{step}}</div>

                      </div>
                    </div>

                  </div>

                </div>
              </q-td>
            </q-tr>
          </template>

        </q-table>

      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
// import {/* Network, */ DataSet } from 'vue2vis'
export default {
  name: 'PageIndex',
  data: () => ({
    loadingJobs: false,
    filterJobs: '',
    toggleModel: '1',
    jobList: [],
    test: 't',
    paginationJobs: {
      page: 1,
      rowsNumber: 10 // specifying this determines pagination is server-side
    },
    paginationSteps: {
      page: 1,
      rowsPerPage: 0 // 0 means all rows
    },
    pagination: {
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 3,
      rowsNumber: 10
    },
    statsOpened: false,
    terms: '',
    columnsSteps: [
      { name: 'stepName', align: 'center', label: 'stepName', field: 'stepName', style: 'min-width: 250px;max-width: 250px;' },
      { name: 'type', align: 'center', label: 'type', field: 'type', style: 'min-width: 90px;max-width: 90px' },
      { name: 'status', align: 'center', label: 'status', field: 'status', style: 'min-width: 200px;max-width: 200px' },
      { name: 'totalEvents', align: 'center', label: 'totalEvents', field: 'totalEvents', style: 'min-width: 80px;max-width: 80px' },
      { name: 'successfulEvents', align: 'center', label: 'successfulEvents', field: 'successfulEvents', style: 'min-width: 80px;max-width: 80px' },
      { name: 'failedEvents', align: 'center', label: 'failedEvents', field: 'failedEvents', style: 'min-width: 80px;max-width: 80px' },
      { name: 'successfulBatches', align: 'center', label: 'successfulBatches', field: 'successfulBatches', style: 'min-width: 80px;max-width: 80px' },
      { name: 'success', align: 'center', label: 'success', field: 'success', style: 'min-width: 80px;max-width: 80px' }
    ],
    columnsJobs: [
      {
        name: 'desc',
        required: true,
        label: 'JobId',
        align: 'left',
        field: row => row.jobId,
        format: val => `${val}`,
        sortable: true,
        style: 'min-width: 300px;max-width: 300px'
      },
      {
        name: 'flow',
        align: 'center',
        label: 'flow',
        field: 'flow',
        sortable: true,
        style: 'min-width: 90px;max-width: 90px'
      },
      {
        name: 'jobStatus',
        label: 'jobStatus',
        field: 'jobStatus',
        sortable: true,
        style: 'min-width: 150px;max-width: 150px'
      },
      {
        name: 'start',
        label: 'start',
        field: 'start',
        sortable: true,
        style: 'min-width: 250px;max-width: 250px'
      },
      {
        name: 'end',
        label: 'end',
        field: 'end',
        sortable: true,
        style: 'min-width: 250px;max-width: 250px'
      }
    ],
    loading: false,
    filter: null
  }),
  mounted () {
    // get initial data from server (1st page)
    this.getAllJobs({
      pagination: this.paginationJobs,
      filter: undefined
    })
  },
  methods: {

    getAllJobs ({ pagination, filter }) {
      const body = {
        service: 'jobs',
        page: pagination.page,
        page_size: pagination.rowsPerPage,
        filter: filter,
        type: this.toggleModel
      }

      this.$axios
        .post('/v1/resources/jobService', body)
        .then(({ data }) => {
          // updating pagination to reflect in the UI
          this.paginationJobs = pagination

          // we also set (or update) rowsNumber
          this.paginationJobs.rowsNumber = data.total

          this.jobList = data.jobs
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loading = false
        })
    }
  },
  // components: { /* Network, */IEcharts },
  created () { }
}
</script>
<style>
.network {
  height: 100%;
  width: 100%;
  border: 1px solid #ccc;
  margin: 5px 0;
}

.echarts {
  width: 400px;
  height: 100%;
}

.q-td {
  /* don't shorten cell contents */
  white-space: normal !important;
  word-wrap: break-word;
}
</style>
