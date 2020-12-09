// vuex module for js8path pskreporter data
import _get from 'lodash/get'
import _isNull from 'lodash/isNull'
import _forEach from 'lodash/forEach'
import moment from 'moment'
import js8pathPskreporter from '@js8path/js8path-pskreporter'

export default {
  namespaced: true,
  modules: {
  },
  state: {
    reportsLoading: false,
    loadedReports: [],
    lastLoadedMoment: null,
    // FixMe: move the values below to settings
    maxLoadAgeSecondsDefault: 1200, // Don't request earlier than this. 1200 = 20 minutes ago
    reportLoadOverlapSeconds: 15 // request reports this many seconds before latest report
  },
  getters: {
    initialFlowStartSeconds (state, getters, rootState) {
      return -_get(rootState, ['settings', 'pskreporter', 'maxLoadAgeSeconds'], state.maxLoadAgeSecondsDefault)
    }
  },
  mutations: {
    setReportsLoading (state, newReportsLoading) {
      state.reportsLoading =  newReportsLoading
    },
    setLoadedReports (state, newValue = []) {
      state.loadedReports =  newValue
    },
    setLastLoadedMoment (state, newValue = null) {
      state.lastLoadedMoment =  newValue
    }
  },
  actions: {
    initializeAppData () { // context) {
      return Promise.resolve(true)
    },
    computeLastLoadedReport (context) {
      let lastReport = null
      _forEach(context.state.loadedReports, (report) => {
        if (_isNull(lastReport) || lastReport.timestamp < report.timestamp) {
          lastReport = report
        }
      })
      return Promise.resolve(lastReport)
    },
    loadReports (context) {
      context.commit('setReportsLoading', true)
      return context.dispatch(
        'computeLastLoadedReport'
      ).then((lastLoadedReport) => {
        let flowStartSeconds = context.getters.initialFlowStartSeconds // system minimum value
        // console.log('initialFlowStartSeconds ' + flowStartSeconds)
        if (!_isNull(lastLoadedReport)) {
          let latestReportMoment = moment(lastLoadedReport.timestamp)
          latestReportMoment.subtract(context.state.reportLoadOverlapSeconds, 'seconds') // move it back a little, just to make sure everything is retrieved
          let latestReportFlowStartSeconds = Math.floor((latestReportMoment - moment()) / 1000)
          flowStartSeconds =  Math.max(latestReportFlowStartSeconds, flowStartSeconds)
        }
        console.log('begin query from net. flowStartSeconds: ' + flowStartSeconds)
        console.time('js8pathPskreporter.net.queryJs8pathData()')
        return js8pathPskreporter.net.queryJs8pathData(
          {
            flowStartSeconds: flowStartSeconds
          },
          false,
          {
            // '/api/pskreporter' or 'https://retrieve.pskreporter.info/query'
            url: process.env.VUE_APP_API_URL_PSKREPORTER
          }
        )
      }).then(function (receptionReports) {
        console.timeEnd('js8pathPskreporter.net.queryJs8pathData()')
        console.log(receptionReports.length + ' reports retrieved from net. ')
        context.commit('setLoadedReports', receptionReports)
        context.commit('setReportsLoading', false)
        return receptionReports
      }).catch(function (err) {
        console.timeEnd('js8pathPskreporter.net.queryJs8pathData()')
        context.commit('setLoadedReports', [])
        context.commit('setReportsLoading', false)
        throw err
      })
    }
  }
}
