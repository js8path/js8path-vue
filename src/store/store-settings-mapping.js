// vuex module for js8path mapping settings
import _get from 'lodash/get'

export default {
  namespaced: true,
  modules: {
  },
  state: {
    _version: '0.1.1',
    displayMap: true,
    displayGrayLine: true,
    showMapInTab: false,
    alwaysShowAllStations: true,
    alwaysShowAllContacts: false,
    useAzimuthalProjection: false
  },
  getters: {
    settingsToStore (state) {
      return {
        _version: state._version,
        displayMap: state.displayMap,
        displayGrayLine: state.displayGrayLine,
        showMapInTab: state.showMapInTab,
        alwaysShowAllStations: state.alwaysShowAllStations,
        alwaysShowAllContacts: state.alwaysShowAllContacts,
        useAzimuthalProjection: state.useAzimuthalProjection
      }
    }
  },
  mutations: {
    setDisplayMap (state, newValue = true) {
      state.displayMap =  newValue
    },
    setDisplayGrayLine (state, newValue = true) {
      state.displayGrayLine =  newValue
    },
    setShowMapInTab (state, newValue = true) {
      state.showMapInTab =  newValue
    },
    setAlwaysShowAllStations (state, newValue = true) {
      state.alwaysShowAllStations =  newValue
    },
    setAlwaysShowAllContacts (state, newValue = true) {
      state.alwaysShowAllContacts =  newValue
    },
    setUseAzimuthalProjection (state, newValue = true) {
      state.useAzimuthalProjection =  newValue
    },
  },
  actions: {
    setAllSettings (context, loadedSettings) {
      let p = Promise.resolve(false)
      if (loadedSettings && loadedSettings._version === context.state._version) {
        context.commit('setDisplayMap', _get(loadedSettings, 'displayMap', context.state.displayMap))
        context.commit('setDisplayGrayLine', _get(loadedSettings, 'displayGrayLine', context.state.displayGrayLine))
        context.commit('setShowMapInTab', _get(loadedSettings, 'showMapInTab', context.state.showMapInTab))
        context.commit('setAlwaysShowAllStations', _get(loadedSettings, 'alwaysShowAllStations', context.state.alwaysShowAllStations))
        context.commit('setAlwaysShowAllContacts', _get(loadedSettings, 'alwaysShowAllContacts', context.state.alwaysShowAllContacts))
        context.commit('setUseAzimuthalProjection', _get(loadedSettings, 'bandSettings', context.state.useAzimuthalProjection))
        p = Promise.resolve(true)
      }
      return p
    },
    initializeAppData () { // context) {
      return Promise.resolve(true)
    }
  }
}
