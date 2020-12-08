// Mixin for Pskreporter Data
// Vue objects using this must also use PathBuilderMixin

import {mapActions, mapMutations, mapState} from 'vuex'
import moment from 'moment'

export default {
  data () {
    return {
      testDataLoaded: false,
    }
  },
  computed: {
    ...mapState({
      momentNow: state => state.momentNow,
      stationRouter: state => state.stationRouter,
      pskreporterAutoLoadEnabled: state => state.settings.pskreporter.autoLoadEnabled,
      pskreporterLastLoadedMoment: state => state.data.pskreporter.lastLoadedMoment,
      pskreporterAutoLoadIntervalSeconds: state => state.settings.pskreporter.autoLoadIntervalSeconds,
      pskreporterMinLoadIntervalSeconds: state => state.settings.pskreporter.minLoadIntervalSeconds
    }),
    pskreporterLastLoadMoment () {
      let thisVue = this
      let lastLoadMoment = null
      if (thisVue.pskreporterLastLoadedMoment) {
        // use actual last loaded moment, if it is set
        lastLoadMoment = thisVue.pskreporterLastLoadedMoment
      } else if  (thisVue.stationRouter.latestReport) {
        // else, use use actual last report moment, if it is set
        lastLoadMoment = moment(thisVue.stationRouter.latestReport.timestamp)
      }
      return lastLoadMoment
    },
    canLoadPskreporter () {
      let thisVue = this
      let canLoadPskreporter = true
      if (thisVue.pskreporterLastLoadMoment) {
        let earliestLoadMoment = thisVue.pskreporterLastLoadMoment.clone().add(thisVue.pskreporterMinLoadIntervalSeconds, 'seconds')
        canLoadPskreporter = thisVue.momentNow.isAfter(earliestLoadMoment)
      }
      return canLoadPskreporter
    },
    pskreporterNextLoadMoment () {
      let thisVue = this
      let nextLoadMoment = null
      if (thisVue.pskreporterLastLoadMoment) {
        nextLoadMoment = thisVue.pskreporterLastLoadMoment.clone().add(thisVue.pskreporterAutoLoadIntervalSeconds, 'seconds')
      }
      return nextLoadMoment
    }
  },
  watch: {
    momentNow () {
      let thisVue = this
      if (thisVue.pskreporterAutoLoadEnabled && thisVue.pskreporterNextLoadMoment !== null) {
        if (thisVue.pskreporterNextLoadMoment.diff(thisVue.momentNow) <= 0) {
          thisVue.loadPskReporter()
        }
      }
    }
  },
  methods: {
    ...mapMutations({
      setPskreporterLastLoadedMoment: 'data/pskreporter/setLastLoadedMoment'
    }),
    ...mapActions({
      loadPskReporterReceptionReports: 'loadPskReporterReceptionReports'
    }),
    loadPskReporter () {
      let thisVue = this
      function doit () {
        //console.time('loadPskReporterReceptionReports')
        return thisVue.loadPskReporterReceptionReports().then(function () {
          //console.timeEnd('loadPskReporterReceptionReports')
          thisVue.updateLinkedStations()
          thisVue.setPskreporterLastLoadedMoment(moment())
        })
      }
      setTimeout(doit, 1)
    }
  }
}
