<template>
  <q-page class>

    <div class="q-pa-md">
      <div
        class="q-gutter-y-md"
        style="max-width: 600px"
      >
        <q-card>

          <q-tabs
            v-model="tabModel"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab
              name="LEGACY"
              label="Legacy"
            />
            <q-tab
              name="DHF5"
              label="DHF 5"
            />
          </q-tabs>

          <q-separator />

          <q-tab-panels
            v-model="tabModel"
            animated
            swipeable
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <q-tab-panel name="LEGACY">
              <div
                class="q-pa-md"
                style="max-width: 300px"
              >
                <div class="q-gutter-md">

                  <q-select
                    filled
                    option-value="flowId"
                    option-label="flowId"
                    v-model="modelLegacyFlow"
                    :options="flows.legacyFlows"
                    color="teal"
                    clearable
                    options-selected-class="text-deep-orange"
                  >

                    <template v-slot:selected>

                      <q-item v-if="modelLegacyFlow">
                        <q-item-section avatar>
                          <q-icon
                            v-if="modelLegacyFlow.type === 'harmonize'"
                            name="crop_rotate"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label v-html="modelLegacyFlow.flowName" />
                          <q-item-label caption>{{ modelLegacyFlow.type + " - " +modelLegacyFlow.entity }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-badge v-else>*none*</q-badge>
                    </template>

                    <template v-slot:option="scope">
                      <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                      >
                        <q-item-section avatar>
                          <q-icon
                            v-if="scope.opt.type === 'harmonize'"
                            name="crop_rotate"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label v-html="scope.opt.flowName" />
                          <q-item-label caption>{{ scope.opt.type + " - " +scope.opt.entity }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                   <q-btn
                style="height:55px;margin-left:5px"
                color="primary"
                icon="garbage"
                label="Launch"
                @click="launchFlow()"
              />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="DHF5">
              <div class="text-h4 q-mb-md">Alarms</div>
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</p>
            </q-tab-panel>

          </q-tab-panels>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<style>
</style>

<script>
// import {/* Network, */ DataSet } from 'vue2vis'

export default {
  name: 'PageLaunch',
  data: () => ({
    flows: null,
    modelLegacyFlow: null,
    tabModel: 'DHF5',
    splitterModel: 20
  }),
  components: {},

  methods: {
    getAllFlows () {
      this.$axios
        .get(
          '/v1/resources/jobService?rs:mode=flowsDefinition')
        .then(response => {
          this.flows = response.data
        })
    },
    notify (color, icon, message) {
      this.$q.notify({
        color: color,
        position: 'top',
        message: message,
        icon: icon
      })
    },
    launchFlow () {
      this.$axios
        .post(
          'v1/resources/mlSjsFlow?rs:entity-name=' + this.modelLegacyFlow.entity + '&rs:flow-name=' + this.modelLegacyFlow.flowName + '&rs:source-database=data-hub-STAGING&rs:target-database=data-hub-FINAL&rs:flow-type=harmonize&rs:job-id=harmonizeTest')
        .then(response => {
          console.log('job launched')
        })
    }
  },
  mounted () {
    this.getAllFlows()
  },
  // components: { /* Network, */IEcharts },
  created () { }
}
</script>
<style lang="sass" scoped>
</style>
