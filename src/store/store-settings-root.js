// vuex module for js8path settings

import moduleData from '@/store/store-settings-data.js'
import moduleGeneral from '@/store/store-settings-general.js'
import moduleMapping from '@/store/store-settings-mapping.js'
import modulePskreporter from '@/store/store-settings-pskreporter.js'

export default {
  namespaced: true,
  modules: {
    data: moduleData,
    general: moduleGeneral,
    mapping: moduleMapping,
    pskreporter: modulePskreporter
  },
  state: {
    _version: '0.1.1'
  },
  getters: {
    settingsToStore (state, getters) {
      return {
        _version: state._version,
        data: getters['data/settingsToStore'],
        general: getters['general/settingsToStore'],
        mapping: getters['mapping/settingsToStore'],
        pskreporter: getters['pskreporter/settingsToStore']
      }
    }
  },
  mutations: {
  },
  actions: {
    storeSettings (context) {
      let isStored = false
      let settingsToStore = context.getters.settingsToStore
      // console.log('settingsToStore: '  + JSON.stringify(settingsToStore))
      if (localStorage) {
        localStorage.setItem(
          'js8pathSettings',
          JSON.stringify(settingsToStore)
        )
        isStored = true
      }
      return Promise.resolve(isStored)
    },
    setAllSettings (context, loadedSettings) {
      let p = Promise.resolve(false)
      if (loadedSettings && loadedSettings._version === context.state._version) {
        p = Promise.all([
          context.dispatch('data/setAllSettings', loadedSettings.data),
          context.dispatch('general/setAllSettings', loadedSettings.general),
          context.dispatch('mapping/setAllSettings', loadedSettings.mapping),
          context.dispatch('pskreporter/setAllSettings', loadedSettings.pskreporter)
        ]).then(() => {
          return Promise.resolve(true)
        })
      }
      return p
    },
    loadStoredSettings (context) {
      let loadedSettings = {}
      if (localStorage) {
        let loadedSettingsJson = localStorage.getItem('js8pathSettings')
        if (loadedSettingsJson) {
          try {
            loadedSettings = JSON.parse(loadedSettingsJson)
          }
          catch {
            loadedSettings = {}
          }
        }
      }
      return context.dispatch(
        'setAllSettings',
        loadedSettings
      )
    },
    initializeAppData (context) {
      return Promise.all([
        context.dispatch('data/initializeAppData'),
        context.dispatch('general/initializeAppData'),
        context.dispatch('mapping/initializeAppData'),
        context.dispatch('pskreporter/initializeAppData')
      ]).then(() => {
        return context.dispatch('loadStoredSettings')
      })
    }
  }
}
