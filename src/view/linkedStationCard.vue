<template>
  <div class="linked-station">
    <div class="header-float-right">
      <StationActionIcons
          :station="station"
          :showSetRootStation="showSetRootStation"
          :showLinkStation="false"
          :showUnlinkStation="canUnlinkCard"
          @center-station-azimuthal="$emit('center-station-azimuthal', station)"
          @unlink-station="$emit('unlink-station', station)"
          @set-root-station="$emit('set-root-station', station)"
      ></StationActionIcons>
    </div>
    <div class="station-info">
      <div :class="{ 'accent': stationSelected }"
           @click="selectStation(station)"
      >
        <span class="subtitle-2">{{linkedStation.call}}</span>
        <span class="caption mx-2">({{linkedStation.band}})</span>
        <span class="overline">{{linkedStation.grid}}</span>
      </div>
    </div>
    <v-row dense>
      <v-col md="6">
        <div class="text-left ml-1"
             v-if="linkedStation.prevStation">
          <div class="caption font-italic font-weight-light">
            <span class="text-no-wrap">{{linkedStation.bearingToPrev}}&deg;</span>
            &nbsp;
            <span class="text-no-wrap">{{Math.round(linkedStation.distanceToPrev)}} km</span>
          </div>
          <span class="subtitle-2">{{linkedStation.prevStation.call}}</span>
          <div class="caption"
                v-for="(report, index) in sortReportsEarliestFirst(linkedStation.reportsFromPrev)"
               v-bind:key="index">
            <ReceptionReport :receptionReport="report" />
          </div>
        </div>
      </v-col>
      <v-col md="6">
        <div class="text-right mr-1"
             v-if="linkedStation.nextStation">
          <div class="caption font-italic font-weight-light">
            {{linkedStation.bearingToNext}}&deg;
            {{Math.round(linkedStation.distanceToNext)}} km
          </div>
          <span class="subtitle-2">{{linkedStation.nextStation.call}}</span>
          <div class="caption"
               v-for="(report, index) in sortReportsEarliestFirst(linkedStation.reportsFromNext)"
               v-bind:key="index">
            <ReceptionReport :receptionReport="report" :reverse="true"/>
          </div>
        </div>
      </v-col>
    </v-row>

    <div v-if="showStationsLists">
      <v-expansion-panels
          :accordion="false"
          :multiple="true"
      >
        <v-expansion-panel v-if="station.txTo">
          <v-expansion-panel-header>TX to</v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="tx-to">
              <div
                  v-for="(txTo, key) in station.txTo"
                  v-bind:key="key"
              >
                <a @click="linkToStation(txTo.station)">
                  <b>{{txTo.station.call}}</b>
                </a>
                ({{txTo.station.grid}})
              </div>
            </div>
           </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="station.txTo">
          <v-expansion-panel-header>RX by</v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="rx-from">
              <div
                  v-for="(rxFrom, key) in station.rxFrom"
                  v-bind:key="key"
              >
                &lt; <b>{{rxFrom.station.call}}</b> ({{rxFrom.station.grid}})
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import _map from 'lodash/map'
import _reverse from 'lodash/reverse'
import _sortBy from 'lodash/sortBy'
import _values from 'lodash/values'
import js8pathRoute from '@js8path/js8path-route'
import ReceptionReport from '@/components/ReceptionReport.vue'
import StationActionIcons from '@/components/StationActionIcons.vue'

export default {
  name: 'LinkedStationCard',
  components: {
    ReceptionReport: ReceptionReport,
    StationActionIcons: StationActionIcons
  },
  props: {
    linkedStation: {
      type: Object,
      default: function () {
        return new js8pathRoute.LinkedStation(new js8pathRoute.Station())
      }
    },
    showStationsLists: {
      type: Boolean,
      default: function () { return false }
    },
    stationSelected: {
      type: Boolean,
      default: function () { return false }
    },
    canUnlinkCard: {
      type: Boolean,
      default: function () { return false }
    },
    showSetRootStation: {
      type: Boolean,
      default: function () { return false }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    station () {
      let thisVue = this
      return thisVue.linkedStation.station
    },
    txToItems () {
      let thisVue = this
      return _map(_values(thisVue.station.txTo), function (txTo) {
        return {
          text: txTo.station.call
        }
      })
    },
    txToStations () {
      let thisVue = this
      let txToStations = []
      if (thisVue.station && thisVue.station.txTo) {
        txToStations = _values(thisVue.station.txTo)
      }
      return txToStations
    }
  },
  methods: {
    linkToStation (selectedStation) {
      let thisVue = this
      thisVue.$emit('link-stations', thisVue.station, selectedStation)
    },
    unlinkStation (selectedStation) {
      let thisVue = this
      thisVue.$emit('unlink-station', selectedStation)
    },
    selectStation (selectedStation) {
      let thisVue = this
      thisVue.$emit('select-station', selectedStation)
    },
    sortReportsEarliestFirst (stationReceptionReports) {
      return _reverse(_sortBy(stationReceptionReports, ['timestamp']))
    }
  }
}
</script>

<style>
div.linked-station {
  display: block;
  border: 4px solid gray;
  padding: 0.1em;
  margin: 0.1em;
}
div.header-float-right {
  display: block;
  float: right;
  padding: 0.1em;
  margin: 0.1em;
}
div.station-info {
  border: 2px solid darkgray;
  padding: 0.1em;
  margin: 0.1em;
}
div.tx-to {
  border: 2px solid gray;
  padding: 0.1em;
  margin: 0.1em;
}
div.rx-from {
  border: 2px solid gray;
  padding: 0.1em;
  margin: 0.1em;
}
</style>
