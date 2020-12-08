<template>
  <v-card>
    <v-card-title>
      <div class="accent">
        {{rootStation.call}}
        <span class="mx-2">({{rootStation.band}})</span>
        {{rootStation.grid}}
      </div>
      <v-spacer />
      <StationSearchWidget
          :searchString="searchString"
          @search-string-changed="searchStringChanged"
      ></StationSearchWidget>
    </v-card-title>
    <v-data-table
      item-key="key"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :search="searchString"
      :headers="headers"
      :items="stationRows"
      :items-per-page="10"
      :loading="loading"
      :hide-default-header="false"
      :expanded.sync="expanded"
      show-expand
      dense
      class="elevation-1"
    >
      <template v-slot:header>
        <thead class="v-data-table-header">
          <tr>
            <th colspan="7"></th>
            <th class="text-center rx-by-root" colspan="3">{{rootStation.call}} Rx Station</th>
            <th class="text-center rx-root" colspan="3">Station Rx {{rootStation.call}}</th>
          </tr>
        </thead>
      </template>
      <template v-slot:header.txToCount>
        #
      </template>
      <template v-slot:header.txToLatestSNr>
        SNr
      </template>
      <template v-slot:header.txToLatestTime>
        Age
      </template>
      <template v-slot:header.rxFromCount>
        #
      </template>
      <template v-slot:header.rxFromLatestSNr>
        SNr
      </template>
      <template v-slot:header.rxFromLatestTime>
        Age
      </template>
      <template v-slot:item.actions="{ item: stationItem }">
        <StationActionIcons
            :station="stationItem.linkedStation.station"
            :showSetRootStation="false"
            :showLinkStation="true"
            :showUnlinkStation="false"
            @center-station-azimuthal="$emit('center-station-azimuthal', stationItem.linkedStation.station)"
            @add-station-to-path="selectStation(stationItem.linkedStation.station)"
        ></StationActionIcons>
      </template>
      <template v-slot:item.linkedStation.call="{ item: stationItem }">
        <StationCallWidget
            :station="stationItem.linkedStation.station"
            :showRxTx="true"
        ></StationCallWidget>
      </template>
      <template v-slot:item.txToCount="{ item: stationItem }">
        {{stationItem.txToCount}}
      </template>
      <template v-slot:item.txToLatestSNr="{ item: stationItem }">
        <ReceptionReport v-if="stationItem.txToCount > 0"
                         :receptionReport="stationItem.txToReports[0]"
                         :showAge="false"
                         />
      </template>
      <template v-slot:item.txToLatestTime="{ item: stationItem }">
        <ReceptionReport v-if="stationItem.txToCount > 0"
                         :receptionReport="stationItem.txToReports[0]"
                         :showSNr="false"
        />
      </template>
      <template v-slot:item.rxFromCount="{ item: stationItem }">
        {{stationItem.rxFromCount}}
      </template>
      <template v-slot:item.rxFromLatestSNr="{ item: stationItem }">
        <ReceptionReport v-if="stationItem.rxFromCount > 0"
                         :receptionReport="stationItem.rxFromReports[0]"
                         :showAge="false"
                         />
      </template>
      <template v-slot:item.rxFromLatestTime="{ item: stationItem }">
        <ReceptionReport v-if="stationItem.rxFromCount > 0"
                         :receptionReport="stationItem.rxFromReports[0]"
                         :showSNr="false"
        />
      </template>
      <template v-slot:expanded-item="{ item: stationItem }">
        <td :colspan="7"></td>
        <td :colspan="3">
          <div v-for="(report, index) in stationItem.rxFromReports"
                    :key="index">
            <ReceptionReport :receptionReport="report" />
          </div>
        </td>
        <td :colspan="3">
          <div v-for="(report, index) in stationItem.txToReports"
               :key="index">
            <ReceptionReport :receptionReport="report" />
          </div>
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _has from 'lodash/has'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _remove from 'lodash/remove'
import _reverse from 'lodash/reverse'
import _sortBy from 'lodash/sortBy'

import js8pathRoute from '@js8path/js8path-route'
import ReceptionReport from '@/components/ReceptionReport.vue'
import StationActionIcons from '@/components/StationActionIcons.vue'
import StationCallWidget from '@/components/StationCallWidget.vue'
import StationSearchWidget from '@/components/StationSearchWidget.vue'

export default {
  name: 'LinkedStationsTable',
  components: {
    ReceptionReport: ReceptionReport,
    StationActionIcons: StationActionIcons,
    StationCallWidget: StationCallWidget,
    StationSearchWidget: StationSearchWidget
  },
  props: {
    allStations: {
      type: Array,
      default: function () {
        return []
      }
    },
    linkedStations: {
      type: Array,
      default: function () {
        return []
      }
    },
    loading: {
      type: Boolean,
      default: function () {
        return false
      }
    }
  },
  data () {
    return {
      searchString: '',
      sortBy: ['rxtxCount'],
      sortDesc: [true],
      expanded: [],
      headers: [
        {
          text: 'Actions',
          value: 'actions',
          filterable: false,
          sortable: false,
          width: "1%"
        },
        {
          text: 'Call',
          value: 'linkedStation.call',
          filterable: true,
          width: "1%"
        },
        {
          text: 'Grid',
          value: 'linkedStation.grid',
          filterable: true,
          width: "1%"
        },
        {
          text: 'Bearing',
          value: 'linkedStation.bearingFromPrev',
          filterable: false,
          width: "1%"
        },
        {
          text: 'Distance (km)',
          value: 'distance',
          filterable: false,
          width: "1%"
        },
        {
          text: 'Band',
          value: 'linkedStation.band',
          filterable: false
        },
        {
          text: '# Rx by Root',
          value: 'rxFromCount',
          class: "rx-by-root",
          filterable: false
        },
        {
          text: 'Latest Rx SNr by Root',
          value: 'rxFromLatestSNr',
          class: "rx-by-root",
          filterable: false
        },
        {
          text: 'Latest Rx Time by Root',
          value: 'rxFromLatestTime',
          class: "rx-by-root",
          filterable: false
        },
        {
          text: '# Rx Root',
          value: 'txToCount',
          class: "rx-root",
          filterable: false
        },
        {
          text: 'Latest Rx SNr Root',
          value: 'txToLatestSNr',
          class: "rx-root",
          filterable: false
        },
        {
          text: 'Latest Rx Time Root',
          value: 'txToLatestTime',
          class: "rx-root",
          filterable: false
        }
      ]
    }
  },
  computed: {
    rootStation () {
      let thisVue = this
      return _last(thisVue.linkedStations)
    },
    stationRows () {
      let thisVue = this
      let rootStation = thisVue.rootStation
      let stationsToLink = _filter(thisVue.allStations, function (station) {
        return _has(rootStation.txTo, station.key) ||
                _has(rootStation.rxFrom, station.key)
      })
      _remove(stationsToLink, function (station) {
        return _find(thisVue.linkedStations, function (linkedStation) {
          return linkedStation.key === station.key
        })
      })
      _remove(stationsToLink, function (station) {
        return _find(thisVue.stationsToLink, function (linkedStation) {
          return linkedStation.key === station.key
        })
      })
      return _map(stationsToLink, function (station) {
        let reportStats = station.getReportStats()
        let isTwoWay = reportStats.twoWayStationCount > 0
        let linkedStation = new js8pathRoute.LinkedStation(station, rootStation)
        let rxFromReports = _reverse(_sortBy(linkedStation.reportsToPrev, ['timestamp']))
        let txToReports = _reverse(_sortBy(linkedStation.reportsFromPrev, ['timestamp']))
        return {
          key: station.key,
          actions: null,
          isTwoWay: isTwoWay,
          linkedStation: linkedStation,
          distance: Math.round(linkedStation.distanceToPrev),
          rxFromReports: rxFromReports,
          rxFromCount: rxFromReports.length,
          rxFromLatestSNr: (rxFromReports.length === 0) ? -100 : rxFromReports[0].sNR,
          rxFromLatestTime: (rxFromReports.length === 0) ? '' : rxFromReports[0].timestamp,
          txToReports: txToReports,
          txToCount: txToReports.length,
          txToLatestSNr: (txToReports.length === 0) ? -100 : txToReports[0].sNR,
          txToLatestTime: (txToReports.length === 0) ? '' : txToReports[0].timestamp
        }
      })
    }
  },
  methods: {
    searchStringChanged (newSearchString) {
      let thisVue = this
      thisVue.searchString = newSearchString
    },
    selectStation (selectedStation) {
      let thisVue = this
      thisVue.$emit('add-linked-station', selectedStation)
    }
  }
}
</script>

<style>
  .rx-root {
    background-color: lightcyan;
  }
  .rx-by-root {
    background-color: lightyellow;
  }
</style>
