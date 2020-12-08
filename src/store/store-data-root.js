// vuex module for js8path data

import modulePskreporter from '@/store/store-data-pskreporter.js'

export default {
  namespaced: true,
  modules: {
    pskreporter: modulePskreporter
  },
  state: {
    reportsLoading: false,
    testDataLoaded: false
  },
  getters: {
  },
  mutations: {
    setReportsLoading (state, newValue = false) {
      state.reportsLoading =  newValue
    },
    setTestDataLoaded (state, newValue = false) {
      state.testDataLoaded =  newValue
    }
  },
  actions: {
    initializeAppData (context) {
      return context.dispatch(
        'pskreporter/initializeAppData'
      ).then(() => {
        return Promise.resolve(!!context)
      })
    }
  }
}
