// vuex module for js8path data settings
import _clone from 'lodash/clone'
import _cloneDeep from 'lodash/cloneDeep'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _has from 'lodash/has'

const bandSelectionsDefault = {
  '1': true,
  '3': true,
  '7': true,
  '10': true,
  '14': true,
  '18': true,
  '21': true,
  '28': true,
  '50': true,
  '144': true,
  '440': true
}

const oneBandSettingDefault = {
  visible: true,
  color: 'gray'
}

const bandSettingsDefault = {
  '1': {
    visible: true,
    color: '#7cfc00'
  },
  '3': {
    visible: true,
    color: '#e550e5'
  },
  '5': {
    visible: true,
    color: '#00008b'
  },
  '7': {
    visible: true,
    color: '#5959ff'
  },
  '10': {
    visible: true,
    color: '#62d962'
  },
  '14': {
    visible: true,
    color: 'orange' // pskreporter: '#f2c40c'
  },
  '18': {
    visible: true,
    color: '#f2f261'
  },
  '21': {
    visible: true,
    color: '#cca166'
  },
  '24': {
    visible: true,
    color: '#b22222'
  },
  '28': {
    visible: true,
    color: '#ff69b4'
  },
  '50': {
    visible: true,
    color: '#ff69b4'
  },
  '144': {
    visible: true,
    color: '#ff1493'
  },
  '440':  _clone(oneBandSettingDefault)
}

export default {
  namespaced: true,
  modules: {
  },
  state: {
    _version: '0.1.1',
    bandSelections: bandSelectionsDefault,
    bandSettings: bandSettingsDefault
  },
  getters: {
    settingsToStore (state) {
      return {
        _version: state._version,
        bandSettings: state.bandSettings
      }
    }
  },
  mutations: {
    setBandSelections (state, newValue) {
      state.bandSelections =  _cloneDeep(newValue)
    },
    setBandSettings (state, newValue) {
      state.bandSettings =  _cloneDeep(newValue)
    }
  },
  actions: {
    findNonStandardBands (context, allReceptionReports) {
      let bandSelections = _clone(context.state.bandSelections)
      let bandSettings = _cloneDeep(context.state.bandSettings)
      _forEach(allReceptionReports, (receptionReport) => {
        if (!_has(bandSelections, receptionReport.band)) {
          bandSelections[receptionReport.band] = true
        }
        if (!_has(bandSettings, receptionReport.band)) {
          bandSettings[receptionReport.band] = _clone(oneBandSettingDefault)
        }
      })
      context.commit('setBandSelections', bandSelections)
      context.commit('setBandSettings', bandSettings)
      return Promise.resolve(true)
    },
    setAllSettings (context, loadedSettings) {
      let p = Promise.resolve(false)
      if (loadedSettings && loadedSettings._version === context.state._version) {
        context.commit('setBandSettings', _get(loadedSettings, 'bandSettings', context.state.bandSettings))
        p = Promise.resolve(true)
      }
      return p
    },
    initializeAppData (context) {
      context.commit('setBandSelections', bandSelectionsDefault)
      context.commit('setBandSettings', bandSettingsDefault)
      return Promise.resolve(true)
    }
  }
}
