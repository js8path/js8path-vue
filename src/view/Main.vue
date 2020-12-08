<template>
  <v-container fluid grid-list-md>
    <v-row dense>
      <PathStationCards
          :pathStations="pathBuilderStations"
          :selectedStation="pathBuilderSelectedStation"
          :showPathActions="true"
          @clear-path="clearPath"
          @reverse-path="reversePath"
          @link-stations="linkStations"
          @unlink-station="unlinkStation"
          @set-root-station="setRootStation"
          @select-station="selectStation"
          @center-station-azimuthal="centerStationAzimuthal"
      />
    </v-row>
    <v-row dense>
      <v-tabs v-model="mainTabCurrentKey">
        <v-tab v-for="tabInfo in mainTabsInfo"
               :key="tabInfo.tabDef.key"
               :href="'#mainTab-' + tabInfo.tabDef.key"
               :disabled="tabInfo.disabled"
        >
          {{tabInfo.tabDef.label}}
        </v-tab>
      </v-tabs>
    </v-row>
    <v-row>
      <v-col md="12">
        <v-tabs-items v-model="mainTabCurrentKey">
          <v-tab-item :value="'mainTab-computed'">
            <StationPathsMain
                v-if="pathBuilderStations.length > 0"
                :rootStation="pathBuilderStations[0]"
                :loading="reportsLoading"
                @build-path="buildPath"
            />
          </v-tab-item>
          <v-tab-item :value="'mainTab-all'">
            <RootStationsTable
                :loading="reportsLoading"
                :stationList="filteredRootStations"
                :pathStations="pathBuilderStations"
                @set-root-station="setRootStation"
                @center-station-azimuthal="centerStationAzimuthal"
                @add-station-to-path="addStationToPath"
                @unlink-station="unlinkStation"
            />
          </v-tab-item>
          <v-tab-item :value="'mainTab-builder'">
            <PathBuilder :allStations="rootStationList"
                         :loading="reportsLoading"
                         @center-station-azimuthal="centerStationAzimuthal"
            />
          </v-tab-item>
          <v-tab-item :value="'mainTab-map'">
            <!-- map content is below tabs items -->
          </v-tab-item>
          <v-tab-item :value="'mainTab-settings'">
            <SettingsMain />
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
    <v-row :class="{'d-none': showMapInTab && mainTabCurrentKey !== 'mainTab-map'}">
      <v-col md="12" class="caption">
        <div v-if="showMapMainMultiProjectionTest"> <!-- for multi-projection demo -->
          <MapMainMultiProjectionTest :loading="reportsLoading"
                   :stationList="filteredRootStations"
                   :pathStations="pathBuilderStations"
                   :selectedPathStation="pathBuilderSelectedStation"
          />
        </div>
        <div v-else>
          <MapMain v-if="displayMap"
                   :loading="reportsLoading"
                   :showMapInTab="showMapInTab"
                   :displayGrayLine="displayGrayLine"
                   :momentNow="momentNow"
                   :alwaysShowAllStations="alwaysShowAllStations"
                   :alwaysShowAllContacts="alwaysShowAllContacts"
                   :useAzimuthalProjection="useAzimuthalProjection"
                   :azimuthalCenterStation="azimuthalCenterStation"
                   :bandSettings="bandSettings"
                   :stationList="rootStationList"
                   :pathStations="pathBuilderStations"
                   :selectedPathStation="pathBuilderSelectedStation"
                   @mapEvent="handleMapEvent"
                   @center-station-azimuthal="centerStationAzimuthal"
                   @set-use-azimuthal-projection="setUseAzimuthalProjection"
          />
        </div>
      </v-col>
    </v-row>
    <v-row v-if="showAzimuthalToggle && (!showMapInTab || mainTabCurrentKey === 'mainTab-map')">
      <v-col md="4">
        <v-switch dense hide-details class="pa-0 ma-0 caption"
                  v-model="azimuthalCheckboxValue"
                  label="Azimuthal"
        ></v-switch>
      </v-col>
    </v-row>
    <v-row v-if="showToggleMapMainMultiProjectionTest">
      <v-col md="4">
        <v-switch dense hide-details class="pa-0 ma-0 caption"
                  v-model="showMapMainMultiProjectionTest"
                  label="Multi-Projection Demo"
        ></v-switch>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _forEach from 'lodash/findIndex'
import _slice from 'lodash/slice'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

import PathBuilderMixin from '@/view/PathBuilderMixin.js'
import PskreporterMixin from '@/view/PskreporterMixin.js'

import MapMain from '@/view/mapping/MapMain.vue'
import MapMainMultiProjectionTest from '@/view/mapping/MapMainMultiProjectionTest.vue' // for multi-projection demo
import PathBuilder from '@/view/PathBuilder.vue'
import PathStationCards from '@/view/PathStationCards.vue'
import RootStationsTable from '@/view/rootStationsTable.vue'
import SettingsMain from '@/view/settings/SettingsMain.vue'
import StationPathsMain from '@/view/stationPaths/stationPathsMain.vue'

export default {
  name: 'js8pathMain',
  mixins: [
    PathBuilderMixin,
    PskreporterMixin
  ],
  components: {
    MapMain: MapMain,
    MapMainMultiProjectionTest: MapMainMultiProjectionTest, // for multi-projection demo
    PathBuilder: PathBuilder,
    PathStationCards: PathStationCards,
    RootStationsTable: RootStationsTable,
    SettingsMain: SettingsMain,
    StationPathsMain: StationPathsMain
  },
  data () {
    return {
      azimuthalCenterStation: null,
      showAzimuthalToggle: false, // true to show azimuthal toggle
      showToggleMapMainMultiProjectionTest: false, // true to show multi-projection demo switch
      showMapMainMultiProjectionTest: false, // true to show multi-projection demo
      selectedStationIndex: -1,
      mainTabs: [
        { key: 'map', label: 'Map'},
        { key: 'all', label: 'All Stations'},
        { key: 'builder', label: 'Path Builder'},
        { key: 'computed', label: 'Relay Paths'},
        { key: 'settings', label: 'Settings'}
      ],
      mainTabCurrentKey: null
    }
  },
  computed: {
    ...mapState({
      momentNow: state => state.momentNow,
      bandSettings: state => state.settings.data.bandSettings,
      displayMap: state => state.settings.mapping.displayMap,
      displayGrayLine: state => state.settings.mapping.displayGrayLine,
      showMapInTab: state => state.settings.mapping.showMapInTab,
      alwaysShowAllStations: state => state.settings.mapping.alwaysShowAllStations,
      alwaysShowAllContacts: state => state.settings.mapping.alwaysShowAllContacts,
      useAzimuthalProjection: state => state.settings.mapping.useAzimuthalProjection,
      reportsLoading: state => state.data.reportsLoading,
      stationRouter: state => state.stationRouter,
      rootStationList: state => state.rootStationList,
      allReports: state => state.allReports
    }),
    ...mapGetters({
      filteredRootStations: 'filteredRootStations',
      rootStationsByBand: 'rootStationsByBand'
    }),
    azimuthalCheckboxValue: {
      get: function () {
        return this.useAzimuthalProjection
      },
      // setter
      set: function (newValue) {
        this.setUseAzimuthalProjection(newValue)
      }
    },
    mainTabsInfo () {
      let thisVue = this
      let mainTabsInfo = []
      _forEach(thisVue.mainTabs, (tabDef) => {
        let tabInfo = {
          tabDef: tabDef,
          disabled: true,
        }
        let includeTab = true
        if (tabDef.key === 'all') {
          tabInfo.disabled = false
        } else if (tabDef.key === 'map') {
          includeTab = thisVue.showMapInTab
          tabInfo.disabled = false
        } else if (tabDef.key === 'settings') {
          tabInfo.disabled = false
        } else if (thisVue.pathBuilderStations.length > 0) {
          tabInfo.disabled = false
        }
        if (includeTab) {
          mainTabsInfo.push(tabInfo)
        }
      })
      return mainTabsInfo
    },
    selectedPathStations () {
      let thisVue = this
      let selectedPathStations = []
      if (thisVue.selectedStationIndex >= 0) {
        selectedPathStations = _slice(thisVue.pathBuilderStations, 0, thisVue.selectedStationIndex + 1)
      }
      return selectedPathStations
    }
  },
  watch: {
    pathBuilderStations (newPathStations, oldPathStations) {
      let thisVue = this
      if (newPathStations && newPathStations.length > 0) {
        thisVue.selectedStationIndex = newPathStations.length - 1
        if (oldPathStations.length === 0) {
          thisVue.setMainTabByName('builder')
        } else if (newPathStations[0].key !== oldPathStations[0].key) {
          thisVue.setMainTabByName('builder')
        }
      } else {
        thisVue.selectedStationIndex = -1
        thisVue.setMainTabByName('all')
      }
    }
  },
  methods: {
    ...mapMutations({
      setUseAzimuthalProjection: 'settings/mapping/setUseAzimuthalProjection'
    }),
    ...mapActions({
      resetAppData: 'resetAppData'
    }),
    centerStationAzimuthal (azimuthalCenterStation = null) {
      let thisVue = this
      thisVue.azimuthalCenterStation = azimuthalCenterStation
      /* old version - also set azimuthal projection
      if (_isNull(azimuthalCenterStation) && thisVue.useAzimuthalProjection) {
        thisVue.setUseAzimuthalProjection(false)
      } else {
        thisVue.azimuthalCenterStation = azimuthalCenterStation
        thisVue.setUseAzimuthalProjection(true)
      }
      */
    },
    buildPath (newPathBuilderStations) {
      let thisVue = this
      thisVue.updatePathBuilderStations(newPathBuilderStations).then(() => {
        thisVue.setMainTabByName('builder')
      })
    },
    setMainTabByName (tabName) {
      let thisVue = this
      thisVue.mainTabCurrentKey = tabName
    },
    handleMapEvent (eventData) {
      console.log('mapEvent: ', eventData)
    }
  },
  created () {
  },
  destroyed () {
  }
}
</script>

<style>
</style>
