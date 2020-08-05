 <template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title>
          Marklogic Datahub Job explorer
          <div slot="subtitle">Running on MarkLogic</div>
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="stats"
          @click="showStatsMsg"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="200"
      :breakpoint="500"
      bordered
      content-class="bg-grey-3"
    >
      <q-scroll-area class="fit">
        <q-list
        >

          <q-item to="/" exact
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="search" />
            </q-item-section>
            <q-item-section> Explore </q-item-section>
          </q-item>

           <q-item to="launch" exact v-if="false"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-icon class="fas fa-rocket" />
            </q-item-section>
            <q-item-section> Launch Job </q-item-section>
          </q-item>

          <q-separator  />

           <q-item to="manage" exact
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Manage Jobs</q-item-section>
          </q-item>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: true
    }
  },
  methods: {
    openURL,

    showStatsMsg () {
      this.$root.$emit('show_stats')
    }

  }
}
</script>

<style lang="sass" scoped>
.my-custom-toggle
  border: 1px solid #027be3
</style>
