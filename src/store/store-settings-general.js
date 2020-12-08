// vuex module for js8path mapping settings
import _get from 'lodash/get'

export default {
  namespaced: true,
  modules: {
  },
  state: {
    _version: '0.1.1',
    myGrid: '',
    myCall: '',
    recentSearches: []
  },
  getters: {
    settingsToStore (state) {
      return {
        _version: state._version,
        myGrid: state.myGrid,
        myCall: state.myCall,
        recentSearches: state.recentSearches
      }
    }
  },
  mutations: {
    setMyGrid (state, newValue = '') {
      state.myGrid =  newValue
    },
    setMyCall (state, newValue = '') {
      state.myCall =  newValue
    },
    setRecentSearches (state, newValue = []) {
      state.recentSearches =  newValue
    }
  },
  actions: {
    setAllSettings (context, loadedSettings) {
      let p = Promise.resolve(false)
      if (loadedSettings && loadedSettings._version === context.state._version) {
        context.commit('setMyGrid', _get(loadedSettings, 'myGrid', context.state.myGrid))
        context.commit('setMyCall', _get(loadedSettings, 'myCall', context.state.myCall))
        context.commit('setRecentSearches', _get(loadedSettings, 'recentSearches', context.state.recentSearches))
        p = Promise.resolve(true)
      }
      return p
    },
    initializeAppData () { // context) {
      return Promise.resolve(true)
    }
  }
}
