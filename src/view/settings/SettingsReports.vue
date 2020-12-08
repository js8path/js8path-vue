<template>
  <v-container fluid grid-list-md>
    <v-row>
      <v-col md="3" class="subtitle-1">
        JS8Path Reports
      </v-col>
    </v-row>
    <v-row dense v-if="!reportsLoading">
      <v-col md="2">
        <v-dialog v-model="dialog1" persistent max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn small
                v-bind="attrs"
                v-on="on"
            >
              Clear All
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">Clear All Reports?</v-card-title>
            <v-card-text>This will clear all reports currently loaded into JS8Path. New reports will need to be downloaded.</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn small @click="resetAllReports()">Clear All</v-btn>
              <v-btn small @click="dialog1 = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
      <v-col md="2">
        <v-dialog v-model="dialog2" persistent max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn small
                v-bind="attrs"
                v-on="on"
                :disabled="testDataLoaded"
            >
              Load Test Data
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">Load Test Data?</v-card-title>
            <v-card-text>This will clear all reports currently loaded into JS8Path, and load test data reports.</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn small @click="loadTestReports()">Load Test</v-btn>
              <v-btn small @click="dialog2 = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'

export default {
  name: 'SettingsReports',
  mixins: [
  ],
  components: {
  },
  props: {
  },
  data () {
    return {
      dialog1: false,
      dialog2: false
    }
  },
  computed: {
    ...mapState({
      reportsLoading: state => state.data.reportsLoading,
      testDataLoaded: state => state.data.testDataLoaded
    }),
    ...mapGetters({
      filteredRootStations: 'filteredRootStations',
      rootStationsByBand: 'rootStationsByBand'
    })
  },
  watch: {
  },
  methods: {
    ...mapMutations({
      setPskreporterLastLoadedMoment: 'data/pskreporter/setLastLoadedMoment',
      setPskreporterLoadedReports: 'data/pskreporter/setLoadedReports',
      setTestDataLoaded: 'data/setTestDataLoaded'
    }),
    ...mapActions({
      loadTestReceptionReports: 'loadTestReceptionReports',
      resetStationRouter: 'resetStationRouter',
      updatePathBuilderStations: 'updatePathBuilderStations'
    }),
    _resetAllReports () {
      let thisVue = this
      thisVue.setPskreporterLastLoadedMoment(null)
      thisVue.setPskreporterLoadedReports([])
      thisVue.setTestDataLoaded(false)
      return thisVue.updatePathBuilderStations([])
    },
    resetAllReports () {
      let thisVue = this
      thisVue.dialog1 = false
      thisVue.resetStationRouter().then(function () {
        return thisVue._resetAllReports()
      })
    },
    loadTestReports () {
      let thisVue = this
      thisVue.dialog2 = false
      if (!thisVue.testDataLoaded) {
        return thisVue._resetAllReports().then(function () {
          // FixMe: reloads immediately, because test data is too old
          return thisVue.loadTestReceptionReports()
        }).then(function () {
          thisVue.setTestDataLoaded(true)
        })
      }
    }
  },
  created () {
  },
  destroyed () {
  }
}
</script>

<style>
</style>
