<template>
  <v-card>
    <v-card-title>
      <div class="accent">
        {{rootStation.call}}
        <span class="mx-2">({{rootStation.band}})</span>
        {{rootStation.grid}}
      </div>
    </v-card-title>
    <v-tabs v-model="selectedPathCategoryTab">
      <v-tab v-for="tab in allPathCategoryTabs"
             :key="tab.key">
        {{tab.label}}
      </v-tab>
      <v-tab-item v-for="pathCategoryTab in allPathCategoryTabs"
                  :key="pathCategoryTab.key">
        <StationCategoryPaths :rootStation="rootStation"
                             :pathsByEndStation="rootPaths[pathCategoryTab.key]"
                              @build-path="buildPath"
        />
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep'

let rootPathsDefault = {
  outgoing: [],
  incoming: [],
  all: [],
  twoway: [],
}

import StationCategoryPaths from '@/view/stationPaths/stationCategoryPaths.vue'

export default {
  name: 'StationPathsMain',
  components: {
    StationCategoryPaths: StationCategoryPaths
  },
  props: {
    rootStation: {
      type: Object,
      default: function () {
        return null
      }
    }
  },
  data () {
    return {
      maxPathLength: 4,
      rootPaths: _cloneDeep(rootPathsDefault),
      selectedPathCategory: '',
      selectedEndStationKey: '',
      allPathCategoryTabs: [
        { key: 'twoway', label: 'Two-way'},
        { key: 'outgoing', label: 'Outgoing'},
        { key: 'incoming', label: 'Incoming'},
        { key: 'all', label: 'All'}
      ],
      selectedPathCategoryTab: null
    }
  },
  computed: {
  },
  watch: {
    rootStation () {
      let thisVue = this
      thisVue.computeStationPaths()
    }
  },
  methods: {
    resetStationPaths () {
      let thisVue = this
      thisVue.rootPaths = _cloneDeep(rootPathsDefault)
    },
    computeStationPaths () {
      let thisVue = this
      thisVue.resetStationPaths()
      if (thisVue.rootStation) {
        // FixMe: paths computation is fast enough now, but may need to be wrapped in a promise and have a spinner
        thisVue.rootPaths =  thisVue.rootStation.getAllSimplePathsByStation(thisVue.maxPathLength)
      }
    },
    buildPath (selectedPath) {
      let thisVue = this
      thisVue.$emit('build-path', selectedPath)
    }
  },
  created () {
    let thisVue = this
    thisVue.computeStationPaths()
  }
}
</script>

<style>
</style>
