// vuex root store for js8path

import _cloneDeep from 'lodash/cloneDeep'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _isNull from 'lodash/isNull'
import _values from 'lodash/values'
import moment from 'moment'

import Vue from 'vue'
import Vuex from 'vuex'

import testData from '@js8path/js8path-test-data'
import js8pathRoute from '@js8path/js8path-route'
import _has from 'lodash/has'

Vue.use(Vuex)

import moduleData from '@/store/store-data-root.js'
import moduleSettings from '@/store/store-settings-root.js'

export default new Vuex.Store({
  namespaced: true,
  modules: {
    data: moduleData,
    settings: moduleSettings
  },
  state: {
    momentNow: moment(),
    allReports: [],
    stationRouter: new js8pathRoute.Router(),
    rootStationList: [],
    pathBuilderStations: [],
    pathBuilderSelectedStation: null,
    // FixMe: move the values below to settings
    maxReportAgeSeconds: 3600 // !!3600 = 60 minutes
  },
  getters: {
    filteredRootStations (state) {
      let bandSelections = state.settings.data.bandSelections
      return _filter(state.rootStationList, (rootStation) => {
        return bandSelections[rootStation.band]
      })
    },
    filteredReports (state, getters) {
      let filteredStations = getters['filteredRootStations']
      let filteredReportsMapping = {}
      _forEach(filteredStations, (filteredStation) => {
        _forEach(filteredStation.getAllReports(), (report) => {
          filteredReportsMapping[report._key] = report
        })
      })
      return _values(filteredReportsMapping)
    },
    rootStationsByBand (state) {
      /* returns:
          {
            <bandId>: {
              stations: [],
              settings: <bandSettings>
            }
          }
       */
      let rootStationsByBand = {}
      _forEach(state.rootStationList, (rootStation) => {
        if (!rootStationsByBand[rootStation.band]) {
          rootStationsByBand[rootStation.band] = {
            stations: [],
            settings: state.settings.data.bandSettings[rootStation.band]
          }
        }
        rootStationsByBand[rootStation.band].stations.push(rootStation)
      })
      return rootStationsByBand
    }
  },
  mutations: {
    setMomentNow (state, aMoment) {
      state.momentNow =  aMoment
    },
    setStationRouter (state, newStationRouter) {
      state.stationRouter =  newStationRouter
    },
    setRootStationList (state, newRootStationList) {
      state.rootStationList =  newRootStationList
    },
    setPathBuilderStations (state, pathBuilderStationList) {
      state.pathBuilderStations  = pathBuilderStationList
    },
    setPathBuilderSelectedStation (state, pathBuilderSelectedStation) {
      state.pathBuilderSelectedStation  = pathBuilderSelectedStation
    },
    _setAllReports (state, newAllReports) {
      state.allReports =  newAllReports
    }
  },
  actions: {
    updatePathBuilderStations (context, newStations = []) {
      context.commit('setPathBuilderStations', newStations)
      let selectedStation = newStations.length === 0 ? null : newStations[newStations.length - 1]
      return context.dispatch('updatePathBuilderSelectedStation', selectedStation)
    },
    updatePathBuilderSelectedStation (context, newStation = null) {
      if (newStation) {
        newStation = _find(this.state.pathBuilderStations, {key: newStation.key}) || null
      }
      context.commit('setPathBuilderSelectedStation', newStation)
      return Promise.resolve(newStation)
    },
    replaceStationRouter (context, newRouter = null) {
      // FixMe: needs tests
      if (_isNull(newRouter)) {
        newRouter =  new js8pathRoute.Router()
      }
      let newRootStationList = newRouter.stationList()
      let newPathBuilderStations = []
      let newPathComplete = false
      _forEach(context.state.pathBuilderStations, (oldPathStation) => {
        if (!newPathComplete) {
          if (_has(newRouter.stations, oldPathStation.key)) {
            let newPathStation = newRouter.stations[oldPathStation.key]
            if (newPathBuilderStations.length === 0) {
              newPathBuilderStations.push(newPathStation)
            } else {
              let prevPathStation = newPathBuilderStations[newPathBuilderStations.length - 1]
              if (_has(newPathStation.txTo, prevPathStation.key)) {
                newPathBuilderStations.push(newPathStation)
              } else if (_has(newPathStation.rxFrom, prevPathStation.key)) {
                newPathBuilderStations.push(newPathStation)
              } else {
                newPathComplete = true
              }
            }
          } else {
            newPathComplete = true
          }
        }
      })
      context.commit('setStationRouter', newRouter)
      context.commit('setRootStationList', newRootStationList)
      context.commit('setPathBuilderStations', newPathBuilderStations)
      return Promise.resolve(newRouter)
    },
    resetStationRouter (context) {
      return context.dispatch(
        'replaceStationRouter',
        null
      ).then(function () {
        return context.dispatch('storeAllReports', context.state.stationRouter.getAllReports())
      })
    },
    resetAppData (context) {
      return context.dispatch('resetStationRouter')
    },
    loadRawReceptionReports (context, payload = {}) {
      context.commit('data/setReportsLoading', true)
      let newRawReports = payload.rawReports || []
      let expiryMoment = payload.expiryMoment || null
      let newReportsIndex = {}
      console.time('process existing reports')
      _forEach(context.state.allReports, (rr) => {
        if (!expiryMoment || moment(rr.timestamp) >= expiryMoment) {
          newReportsIndex[rr._key] = rr
        }
      })
      console.timeEnd('process existing reports')
      console.time('process new reports')
      _forEach(newRawReports, (rr) => {
        let rrp = js8pathRoute.Router.processReport(rr)
        if (rrp) {
          newReportsIndex[rrp._key] = rrp
        }
      })
      console.timeEnd('process new reports')
      let newReportsList = _values(newReportsIndex)
      let newRouter = new js8pathRoute.Router()
      console.time('load reports into new router')
      return newRouter.loadReports(
        newReportsList
      ).then(function () {
        console.timeEnd('load reports into new router')
        console.time('replace station router')
        return context.dispatch('replaceStationRouter', newRouter)
      }).then(function () {
        console.timeEnd('replace station router')
        console.time('store all reports')
        return context.dispatch('storeAllReports', newReportsList)
      }).then(function () {
        console.timeEnd('store all reports')
        context.commit('data/setReportsLoading', false)
      }).catch(function (err) {
        console.timeEnd('load reports into new router')
        console.timeEnd('replace station router')
        console.timeEnd('store all reports')
        context.commit('data/setReportsLoading', false)
        throw err
      })
    },
    loadTestReceptionReports (context) {
      return context.dispatch('loadRawReceptionReports', {
        rawReports: _cloneDeep(testData.js8pathData),
          expiryMoment: null
      })
    },
    loadPskReporterReceptionReports (context) {
      context.commit('data/setReportsLoading', true)
      context.dispatch(
        'data/pskreporter/loadReports'
      ).then(function (receptionReports) {
        let expiryMoment = moment().subtract(context.state.maxReportAgeSeconds, 'seconds')
        return context.dispatch('loadRawReceptionReports', {
          rawReports: receptionReports,
          expiryMoment: expiryMoment
        })
      }).then(function () {
        context.commit('data/setReportsLoading', false)
      }).catch(function (err) {
        context.commit('data/setReportsLoading', false)
        throw err
      })
    },
    setAllReports (context, allReceptionReports = []) {
      context.commit('_setAllReports', allReceptionReports)
      return context.dispatch(
        'settings/data/findNonStandardBands',
        allReceptionReports
      ).then(() => {
        return Promise.resolve(allReceptionReports.length)
      })
    },
    storeAllReports (context, allReceptionReports = []) {
      let isStored = false
      if (localStorage) {
        localStorage.setItem(
          'allReceptionReports',
          JSON.stringify(allReceptionReports)
        )
        isStored = true
      }
      return context.dispatch(
        'setAllReports',
        allReceptionReports
      ).then((reportCount) => {
        console.log('storeAllReports() ' + reportCount + ' ' + isStored)
        return Promise.resolve(isStored)
      })
    },
    getStoredAllReports (context) {
      let allReceptionReports = []
      if (localStorage) {
        let allReceptionReportsJson = localStorage.getItem('allReceptionReports')
        if (allReceptionReportsJson) {
          try {
            allReceptionReports = JSON.parse(allReceptionReportsJson)
          }
          catch {
            allReceptionReports = []
          }
        }
      }
      return context.dispatch(
        'setAllReports',
        allReceptionReports
      ).then((reportCount) => {
        console.log('getStoredAllReports() ' + reportCount)
        return Promise.resolve(allReceptionReports)
      })
    },
    loadStoredAllReports (context) {
      context.commit('data/setReportsLoading', true)
      return context.dispatch(
        'getStoredAllReports'
      ).then(function (allReceptionReports) {
        return context.state.stationRouter.loadReports(allReceptionReports)
      }).then(function () {
        context.commit('setRootStationList', context.state.stationRouter.stationList())
        context.commit('data/setReportsLoading', false)
      }).catch(function (err) {
        context.commit('setRootStationList', context.state.stationRouter.stationList())
        context.commit('data/setReportsLoading', false)
        throw err
      })
    },
    initializeAppData (context) {
      function updateMomentNow () {
        context.commit('setMomentNow', moment())
      }
      setInterval(updateMomentNow, 1000)
      return context.dispatch(
        'data/initializeAppData'
      ).then(() => {
        return context.dispatch('settings/initializeAppData')
      }).then(() => {
        return context.dispatch('loadStoredAllReports')
      })
    }
  }
})
