<template>
  <!-- experimental substitute for linkedStationCard (not good enough yet) -->
  <div class="linked-station">
    <v-row dense>
      <v-col cols="4">
        <br/>
        <div class="text-left ml-1"
             v-if="linkedStation.prevStation">
          <div class="caption font-italic font-weight-light">
            {{linkedStation.bearingToPrev}}&deg;
            {{Math.round(linkedStation.distanceToPrev)}} km
          </div>
          <span class="subtitle-2">{{linkedStation.prevStation.call}}</span>
          <div class="caption"
               v-for="(report, index) in sortReportsEarliestFirst(linkedStation.reportsFromPrev)"
               v-bind:key="index">
            <ReceptionReport :receptionReport="report" />
          </div>
        </div>
      </v-col>
      <v-col cols="4" class="text-center">
        <div :class="{ 'accent': stationSelected }"
             @click="selectStation(station)"
        >
          {{linkedStation.call}}
        </div>
        <div class="overline">{{linkedStation.grid}}</div>
        <div class="caption mx-2">({{linkedStation.band}})</div>
      </v-col>
      <v-col cols="4">
        <div class="text-right mr-1">
          <StationActionIcons
                  :station="station"
                  :showSetRootStation="false"
                  :showLinkStation="false"
                  :showUnlinkStation="canUnlinkCard"
                  @center-station-azimuthal="$emit('center-station-azimuthal', station)"
                  @unlink-station="$emit('unlink-station', station)"
          ></StationActionIcons>
        </div>
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
    stationSelected: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    canUnlinkCard: {
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
