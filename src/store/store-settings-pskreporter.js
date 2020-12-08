// vuex module for js8path mapping settings
import _get from 'lodash/get'

export default {
  namespaced: true,
  modules: {
  },
  state: {
    _version: '0.1.1',
    autoLoadEnabled: false,
    autoLoadIntervalSeconds: 601,
    minLoadIntervalSeconds: 240, // 240 = 4 minutes
    maxLoadAgeSeconds: 1200 // 1200 = 20 minutes
  },
  getters: {
    settingsToStore (state) {
      return {
        _version: state._version,
        autoLoadEnabled: state.autoLoadEnabled,
        autoLoadIntervalSeconds: state.autoLoadIntervalSeconds,
        minLoadIntervalSeconds: state.minLoadIntervalSeconds,
        maxLoadAgeSeconds: state.maxLoadAgeSeconds
      }
    }
  },
  mutations: {
    setAutoLoadEnabled (state, newValue = false) {
      state.autoLoadEnabled =  newValue
    },
    setAutoLoadIntervalSeconds (state, newValue = 600) {
      state.autoLoadIntervalSeconds =  newValue
    },
    setMinLoadIntervalSeconds (state, newValue = 240) {
      state.minLoadIntervalSeconds =  newValue
    },
    setMaxLoadAgeSeconds (state, newValue = 1200) {
      state.maxLoadAgeSeconds =  newValue
    }
  },
  actions: {
    setAllSettings (context, loadedSettings) {
      let p = Promise.resolve(false)
      if (loadedSettings && loadedSettings._version === context.state._version) {
        context.commit(
          'setAutoLoadEnabled',
          _get(loadedSettings, 'autoLoadEnabled', context.state.autoLoadEnabled)
        )
        context.commit(
          'setAutoLoadIntervalSeconds',
          _get(loadedSettings, 'autoLoadIntervalSeconds', context.state.autoLoadIntervalSeconds)
        )
        context.commit(
          'setMinLoadIntervalSeconds',
          _get(loadedSettings, 'minLoadIntervalSeconds', context.state.minLoadIntervalSeconds)
        )
        context.commit(
          'setMaxLoadAgeSeconds',
          _get(loadedSettings, 'maxLoadAgeSeconds', context.state.maxLoadAgeSeconds)
        )
        p = Promise.resolve(true)
      }
      return p
    },
    initializeAppData () { // context) {
      return Promise.resolve(true)
    }
  }
}
