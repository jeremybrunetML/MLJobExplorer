<template>
  <q-page class>

    <div class="q-pa-md ">
      <div class="row">
        <div class="col">

          <div class="row">
            <div
              class="q-pa-md"
              v-if="kpi"
            >
              <H6>Number of documents in the JOB database:</H6>
              <div class="row">
                <div class="col">
                  <b>Job (DHF5):</b> {{kpi.Job}}
                </div>
                <div class="col">
                  <b>job (Legacy):</b> {{kpi.job}}
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <b>Batch:</b> {{kpi.Batch}}
                </div>
                <div class="col">
                  <b>Trace:</b> {{kpi.trace}}
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <b>Provenance :</b> {{kpi.provenance}}
                </div>
              </div>
            </div>
          </div>
          <q-separator />
          <H6>Purge collection in JOB database:</H6>
          <div class="row" >
            <div class="col" >
              <q-select
                style="width:300px;"
                filled
                v-model="selectedCollection"
                fill-input
                :options="optionsCollections"
                input-debounce="0"
                @filter="suggestCollections"
                hint="Select collection to purge"
              >

              </q-select>
            </div>
            <div class="col" >
              <q-btn
                style="height:55px;margin-left:5px"
                color="primary"
                icon="garbage"
                label="Purge"
                @click="purgeCollections()"
              />
            </div>

          </div>
        </div>
        <div class="col-7">
          <v-chart
            :options="pieGlobal"
            ref="pie"
          />
        </div>
      </div>

    </div>
  </q-page>
</template>

<style>
</style>

<script>
// import {/* Network, */ DataSet } from 'vue2vis'
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/pie'
export default {
  name: 'PageManage',
  data: () => ({
    pieGlobal: null,
    kpi: null,
    optionsCollections: [],
    selectedCollection: null
  }),
  components: { 'v-chart': ECharts },

  methods: {
    loadKPI () {
      this.$axios
        .get('/v1/resources/jobService?rs:mode=kpi')
        .then((response) => {
          this.kpi = response.data
          const statusData = []
          for (const dhfstatus of Object.keys(response.data.dhf)) {
            statusData.push({ name: dhfstatus, value: response.data.dhf[dhfstatus] })
          }

          for (const dhfstatus of Object.keys(response.data.legacy)) {
            statusData.push({ name: dhfstatus, value: response.data.legacy[dhfstatus] })
          }

          const option = {
            title: {
              text: 'Flow launched',
              subtext: '',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              data: ['DHF 5', 'LEGACY']
            },
            series: [
              {
                name: 'Match DMA',
                type: 'pie',
                radius: ['0%', '35%'],

                data: [
                  { value: response.data.Job, name: 'DHF_5' },
                  { value: response.data.job, name: 'LEGACY' }

                ],
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              },
              {
                name: 'status',
                type: 'pie',
                radius: ['50%', '60%'],
                label: {
                  formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                  backgroundColor: '#eee',
                  borderColor: '#aaa',
                  borderWidth: 1,
                  borderRadius: 4,
                  // shadowBlur:3,
                  // shadowOffsetX: 2,
                  // shadowOffsetY: 2,
                  // shadowColor: '#999',
                  // padding: [0, 7],
                  rich: {
                    a: {
                      color: '#999',
                      lineHeight: 22,
                      align: 'center'
                    },
                    // abg: {
                    //     backgroundColor: '#333',
                    //     width: '100%',
                    //     align: 'right',
                    //     height: 22,
                    //     borderRadius: [4, 4, 0, 0]
                    // },
                    hr: {
                      borderColor: '#aaa',
                      width: '100%',
                      borderWidth: 0.5,
                      height: 0
                    },
                    b: {
                      fontSize: 14,
                      lineHeight: 33
                    },
                    per: {
                      color: '#eee',
                      backgroundColor: '#334455',
                      padding: [2, 4],
                      borderRadius: 2
                    }
                  }
                },
                data: statusData
              }
            ]
          }

          this.pieGlobal = option
          this.$refs.pie.hideLoading()
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loadingBatchs = false
        })
    },
    suggestCollections (terms, update) {
      update(() => {
        this.$axios
          .get(
            '/v1/resources/jobService?rs:mode=collections')
          .then(response => {
            this.optionsCollections = response.data
          })
      })
    },
    purgeCollections () {
      this.$axios
        .post(
          '/v1/resources/jobManagement?rs:collectionName=' + this.selectedCollection)
        .then(response => {
          this.notify('positive', 'information', 'The task server has been filled with purge orders successfully')
        })
    },
    notify (color, icon, message) {
      this.$q.notify({
        color: color,
        position: 'top',
        message: message,
        icon: icon
      })
    }
  },
  mounted () {
    this.loadKPI()
  },
  // components: { /* Network, */IEcharts },
  created () { }
}
</script>
<style lang="sass" scoped>

</style>
