<template>
  <v-app-bar
      app
      color="primary"
      dark
  >
    <div class="d-inline-block title">
      JS8Path
    </div>
    <v-spacer/>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
      <div v-on="on" class="d-inline-block caption">
        <div>Stations: {{filteredRootStations.length}} / {{rootStationList.length}}</div>
        <div>Reports: {{filteredReports.length}} / {{allReports.length}}</div>
      </div>
      </template>
      <span>"filtered / total"</span>
    </v-tooltip>
    <v-spacer/>
    <div class="d-inline-block caption">
      <div v-if="latestReportMoment">
        Latest Report:
        <LiveClockDifference :diffMoment="latestReportMoment"
                             :futurePositive="false"
                             :showHours="false"
                             :showSeconds="true"
        ></LiveClockDifference>
      </div>
      <div v-if="oldestReportMoment">
        Oldest Report:
        <LiveClockDifference :diffMoment="oldestReportMoment"
                             :futurePositive="false"
                             :showHours="false"
                             :showSeconds="true"
        ></LiveClockDifference>
      </div>
    </div>
    <v-spacer/>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div v-on="on" class="d-inline-block caption">
          <div v-if="pskreporterLastLoadMoment !== null">
            Last Load:
            <LiveClockDifference :diffMoment="pskreporterLastLoadMoment"
                                 :futurePositive="false"
                                 :showHours="false"
                                 :showSeconds="true"
            ></LiveClockDifference>
          </div>
          <div v-if="pskreporterAutoLoadEnabled && pskreporterNextLoadMoment !== null">
            Next Load:
            <LiveClockDifference :diffMoment="pskreporterNextLoadMoment"
                                 :futurePositive="true"
                                 :showHours="false"
                                 :showSeconds="true"
            ></LiveClockDifference>
          </div>
          <v-btn v-on="on" x-small
                 v-if="canLoadPskreporter"
                 @click="loadPskReporter">
            Load Now
          </v-btn>
        </div>
      </template>
      <span>Load PSKReporter Data from Web</span>
    </v-tooltip>
    <v-spacer/>
    <div class="d-inline-block">
      <LiveClock>
        <template v-slot:default="slotProps">
          {{slotProps.momentNowUTC.format('HH:mm:ss')}}
        </template>
      </LiveClock>
    </div>
  </v-app-bar>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex'

import LiveClock from '@/components/LiveClock.vue'
import LiveClockDifference from '@/components/LiveClockDifference.vue'
import moment from 'moment'

import PathBuilderMixin from '@/view/PathBuilderMixin.js'
import PskreporterMixin from '@/view/PskreporterMixin.js'

export default {
  name: 'MainAppBar',
  mixins: [
    PathBuilderMixin,
    PskreporterMixin
  ],
  components: {
    LiveClock: LiveClock,
    LiveClockDifference: LiveClockDifference
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      allReports: state => state.allReports,
      rootStationList: state => state.rootStationList,
      stationRouter: state => state.stationRouter
    }),
    ...mapGetters({
      filteredRootStations: 'filteredRootStations',
      filteredReports: 'filteredReports'
    }),
    latestReportMoment () {
      let thisVue = this
      let latestReportMoment = null
      if (thisVue.stationRouter.latestReport) {
        latestReportMoment = moment(thisVue.stationRouter.latestReport.timestamp)
      }
      return latestReportMoment
    },
    oldestReportMoment () {
      let thisVue = this
      let oldestReportMoment = null
      if (thisVue.stationRouter.oldestReport) {
        oldestReportMoment = moment(thisVue.stationRouter.oldestReport.timestamp)
      }
      return oldestReportMoment
    }
  },
  watch: {
  },
  methods: {
    ...mapActions({
    })
  },
  created () {
  }
}
</script>

<style>
</style>
