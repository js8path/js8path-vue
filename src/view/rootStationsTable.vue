<template>
  <v-card>
    <v-card-title>
      All Stations
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
      dense
      class="elevation-1"
    >
      <template v-slot:header>
        <thead class="v-data-table-header">
          <tr>
            <th colspan="4"></th>
            <th class="text-center station-count-columns" colspan="3">Station Count</th>
            <th class="text-center latest-report-columns" colspan="3">Latest Report</th>
          </tr>
      </thead>
      </template>
      <template v-slot:item.actions="{ item: stationItem }">
        <StationActionIcons
            :station="stationItem.station"
            :showLinkStation="canAddStation(stationItem.station)"
            :showUnlinkStation="stationIsInPath(stationItem.station)"
            @center-station-azimuthal="$emit('center-station-azimuthal', stationItem.station)"
            @add-station-to-path="$emit('add-station-to-path', stationItem.station)"
            @unlink-station="$emit('unlink-station', stationItem.station)"
            @set-root-station="$emit('set-root-station', stationItem.station)"
        ></StationActionIcons>
      </template>
      <template v-slot:item.call="{ item: stationItem }">
        <StationCallWidget
            :station="stationItem.station"
            :callBold="stationIsInPath(stationItem.station)"
            :showRxTx="true"
        ></StationCallWidget>
      </template>
      <template v-slot:item.rxTxLatestMoment="{ item: stationItem }">
        <LiveClockDifference :diffMoment="stationItem.rxTxLatestMoment"
                             :futurePositive="false"
                             :showHours="false"
                             :showSeconds="false"
        ></LiveClockDifference>
      </template>
      <template v-slot:item.rxTxLatestMoment="{ item: stationItem }">
        <LiveClockDifference :diffMoment="stationItem.rxTxLatestMoment"
                             :futurePositive="false"
                             :showHours="false"
                             :showSeconds="false"
        ></LiveClockDifference>
      </template>
      <template v-slot:item.rxFromLatestMoment="{ item: stationItem }">
        <LiveClockDifference :diffMoment="stationItem.rxFromLatestMoment"
                             :futurePositive="false"
                             :showHours="false"
                             :showSeconds="false"
        ></LiveClockDifference>
      </template>
      <template v-slot:item.txToLatestMoment="{ item: stationItem }">
        <LiveClockDifference :diffMoment="stationItem.txToLatestMoment"
                             :futurePositive="false"
                             :showHours="false"
                             :showSeconds="false"
        ></LiveClockDifference>
      </template>
    </v-data-table>
    <!--
    <v-row class="ml-4 caption">
      <v-switch dense
                v-model="showCSV"
                label=" Show CSV"
      ></v-switch>
    </v-row>
    -->
    <v-row class="ml-4"
           v-if="showCSV"
    >
      <div class="caption">
        <div>
          "Call",
          "Grid",
          "Band",
          "Two-Way Reports",
          "Outgoing Reports",
          "Incoming Reports"
        </div>
        <div v-for="stationRow in stationRows"
             v-bind:key="stationRow.key">
          "{{stationRow.call}}",
          "{{stationRow.grid}}",
          {{stationRow.band}},
          {{stationRow.twoWayStationCount}},
          {{stationRow.txToStationCount}},
          {{stationRow.rxFromStationCount}}
        </div>
      </div>
    </v-row>
  </v-card>
</template>

<script>
import _find  from 'lodash/find'
import _map from 'lodash/map'
import moment from 'moment'
import {mapGetters, mapState} from 'vuex'

import LiveClockDifference from '@/components/LiveClockDifference.vue'
import StationActionIcons from '@/components/StationActionIcons.vue'
import StationCallWidget from '@/components/StationCallWidget.vue'
import StationSearchWidget from '@/components/StationSearchWidget.vue'
import _has from 'lodash/has'

export default {
  name: 'RootStationsTable',
  components: {
    LiveClockDifference: LiveClockDifference,
    StationActionIcons: StationActionIcons,
    StationCallWidget: StationCallWidget,
    StationSearchWidget: StationSearchWidget
  },
  props: {
    loading: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    stationList: {
      type: Array,
      default: function () {
        return []
      }
    },
    pathStations: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    return {
      showCSV: false,
      searchString: '',
      sortBy: ['twoWayStationCount'],
      sortDesc: [true],
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
          value: 'call',
          filterable: true,
          width: "1%"
        },
        {
          text: 'Grid',
          value: 'grid',
          filterable: true,
          width: "1%"
        },
        {
          text: 'Band',
          value: 'band',
          filterable: false
        },
        {
          text: 'two-way',
          value: 'twoWayStationCount',
          filterable: false
        },
        {
          text: 'tx to',
          value: 'txToStationCount',
          filterable: false
        },
        {
          text: 'rx from',
          value: 'rxFromStationCount',
          filterable: false
        },
        {
          text: 'any',
          value: 'rxTxLatestMoment',
          filterable: false
        },
        {
          text: 'tx to',
          value: 'txToLatestMoment',
          filterable: false
        },
        {
          text: 'rx from',
          value: 'rxFromLatestMoment',
          filterable: false
        }
        /* ,
        {
          text: '',
          value: 'spacer',
          filterable: false
        }
         */
      ]
    }
  },
  computed: {
    ...mapState({
    }),
    ...mapGetters({
      filteredRootStations: 'filteredRootStations',
      rootStationsByBand: 'rootStationsByBand'
    }),
    stationRows () {
      let thisVue = this
      return _map(thisVue.stationList, function (station) {
        let reportStats = station.getReportStats()
        return {
          key: station.key,
          actions: null,
          call: station.call,
          grid: station.grid,
          band: station.band,
          station: station,
          txToStationCount: reportStats.txToStationCount,
          rxFromStationCount: reportStats.rxFromStationCount,
          twoWayStationCount: reportStats.twoWayStationCount,
          rxTxLatestReport: reportStats.rxTxLatestReport,
          rxTxLatestMoment: reportStats.rxTxLatestReport ? moment(reportStats.rxTxLatestReport.timestamp) : null,
          rxFromLatestReport: reportStats.rxFromLatestReport,
          rxFromLatestMoment: reportStats.rxFromLatestReport ? moment(reportStats.rxFromLatestReport.timestamp) : null,
          txToLatestReport: reportStats.txToLatestReport,
          txToLatestMoment: reportStats.txToLatestReport ? moment(reportStats.txToLatestReport.timestamp) : null,
          spacer: ''
        }
      })
    }
  },
  watch: {
  },
  methods: {
    searchStringChanged (newSearchString) {
      let thisVue = this
      thisVue.searchString = newSearchString
    },
    stationIsInPath(station) {
      let thisVue = this
      return !!_find(
        thisVue.pathStations,
        station,
        (pathStation) => {pathStation.sameStationAs(station)}
      )
    },
    canAddStation(station) {
      let thisVue = this
      let canAdd = false
      if ((thisVue.pathStations.length > 0) && !thisVue.stationIsInPath(station)) {
        let lastPathStation = thisVue.pathStations[thisVue.pathStations.length - 1]
        if (_has(lastPathStation.txTo, station.key)) {
          canAdd = true
        } else if (_has(lastPathStation.rxFrom, station.key)) {
          canAdd = true
        }
      }
      return canAdd
    }
  }
}
</script>

<style>
  .station-count-columns {
    background-color: lightcyan;
  }
  .latest-report-columns {
    background-color: lightyellow;
  }
</style>
