<template>
  <v-form v-model="formValid"
  >
    <v-container fluid grid-list-md>
      <v-row>
        <v-col md="3">
          <v-checkbox dense hide-details
                      v-model="alwaysShowAllStations"
                      label="Always show all stations"
          ></v-checkbox>
        </v-col>
        <v-col md="3">
          <v-checkbox dense hide-details
                      v-model="alwaysShowAllContacts"
                      label="Always show all contacts"
          ></v-checkbox>
        </v-col>
      </v-row>
      <v-row>
        <v-col md="3">
          <v-checkbox dense hide-details
                      v-model="displayMap"
                      label="Display map"
          ></v-checkbox>
        </v-col>
        <v-col md="3">
          <v-checkbox dense hide-details
                      v-model="showMapInTab"
              label="Show map in tab"
          ></v-checkbox>
        </v-col>
      </v-row>
      <v-row>
        <v-col md="3">
          <v-checkbox dense hide-details
                      v-model="useAzimuthalProjection"
                      label="Use azimuthal projection"
          ></v-checkbox>
        </v-col>
        <v-col md="3">
          <v-checkbox dense hide-details
                      v-model="displayGrayLine"
                      label="Display GrayLine"
          ></v-checkbox>
        </v-col>
      </v-row>
      <v-row>
        <v-col md="12">
          <SettingsFormSubmit
              :originalValues="originalValues"
              :currentValues="currentValues"
              @reset-form-data="resetFormData"
              @submit-form-data="submitFormData"
           ></SettingsFormSubmit>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import {mapMutations, mapState} from 'vuex'
import SettingsFormSubmit from '@/view/settings/SettingsFormSubmit.vue'

export default {
  name: 'SettingsGeneral',
  mixins: [
  ],
  components: {
    SettingsFormSubmit
  },
  props: {
  },
  data () {
    return {
      formValid: true,
      displayMap: true,
      displayGrayLine: true,
      showMapInTab: false,
      alwaysShowAllStations: false,
      alwaysShowAllContacts: false,
      useAzimuthalProjection: false
    }
  },
  computed: {
    ...mapState({
      appDisplayMap: state => state.settings.mapping.displayMap,
      appDisplayGrayLine: state => state.settings.mapping.displayGrayLine,
      appShowMapInTab: state => state.settings.mapping.showMapInTab,
      appAlwaysShowAllStations: state => state.settings.mapping.alwaysShowAllStations,
      appAlwaysShowAllContacts: state => state.settings.mapping.alwaysShowAllContacts,
      appUseAzimuthalProjection: state => state.settings.mapping.useAzimuthalProjection
    }),
    originalValues () {
      let thisVue = this
      return [
        thisVue.appDisplayMap, thisVue.appShowMapInTab,
        thisVue.appAlwaysShowAllStations, thisVue.appAlwaysShowAllContacts,
        thisVue.appUseAzimuthalProjection, thisVue.appDisplayGrayLine
      ]
    },
    currentValues () {
      let thisVue = this
      return [
        thisVue.displayMap, thisVue.showMapInTab,
        thisVue.alwaysShowAllStations, thisVue.alwaysShowAllContacts,
        thisVue.useAzimuthalProjection, thisVue.displayGrayLine
      ]
    }

  },
  watch: {
  },
  methods: {
    ...mapMutations({
      setDisplayMap: 'settings/mapping/setDisplayMap',
      setDisplayGrayLine: 'settings/mapping/setDisplayGrayLine',
      setShowMapInTab: 'settings/mapping/setShowMapInTab',
      setAlwaysShowAllStations: 'settings/mapping/setAlwaysShowAllStations',
      setAlwaysShowAllContacts: 'settings/mapping/setAlwaysShowAllContacts',
      setUseAzimuthalProjection: 'settings/mapping/setUseAzimuthalProjection'
    }),
    resetFormData () {
      let thisVue = this
      thisVue.displayMap = thisVue.appDisplayMap
      thisVue.displayGrayLine = thisVue.appDisplayGrayLine
      thisVue.showMapInTab = thisVue.appShowMapInTab
      thisVue.alwaysShowAllStations = thisVue.appAlwaysShowAllStations
      thisVue.alwaysShowAllContacts = thisVue.appAlwaysShowAllContacts
      thisVue.useAzimuthalProjection = thisVue.appUseAzimuthalProjection
    },
    submitFormData () {
      let thisVue = this
      thisVue.setDisplayMap(thisVue.displayMap)
      thisVue.setDisplayGrayLine(thisVue.displayGrayLine)
      thisVue.setShowMapInTab(thisVue.showMapInTab)
      thisVue.setAlwaysShowAllStations(thisVue.alwaysShowAllStations)
      thisVue.setAlwaysShowAllContacts(thisVue.alwaysShowAllContacts)
      thisVue.setUseAzimuthalProjection(thisVue.useAzimuthalProjection)
      thisVue.$emit('settings-updated')
    }
  },
  created () {
    let thisVue = this
    thisVue.resetFormData()
  },
  destroyed () {
  }
}
</script>

<style>
</style>
