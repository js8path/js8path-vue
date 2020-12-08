<template>
  <v-form v-model="formValid"
  >
    <v-container fluid grid-list-md>
      <v-row>
        <v-col md="12">
          <BandSelector :bandSelections="bandSelections"
                        @update-band-selections="updateBandSelections"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col md="12">
          <SettingsFormSubmit
              :originalValues="[appBandSettings]"
              :currentValues="[bandSettings]"
              @reset-form-data="resetFormData"
              @submit-form-data="submitFormData"
          ></SettingsFormSubmit>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep'
import _forEach from 'lodash/forEach'
import {mapMutations, mapState} from 'vuex'

import BandSelector from '@/view/settings/BandSelector.vue'
import SettingsFormSubmit from '@/view/settings/SettingsFormSubmit.vue'

export default {
  name: 'SettingsBands',
  mixins: [
  ],
  components: {
    BandSelector,
    SettingsFormSubmit
  },
  props: {
  },
  data () {
    return {
      formValid: true,
      bandSelections: {}
    }
  },
  computed: {
    ...mapState({
      appBandSelections: state => state.settings.data.bandSelections,
      // FixMe: use only bandSettings, deprecate bandSelections
      appBandSettings: state => state.settings.data.bandSettings
    }),
    bandSettings () {
      let thisVue = this
      let bandSettings = _cloneDeep(thisVue.appBandSettings)
      _forEach(thisVue.bandSelections, (isVisible, bandKey) => {
        bandSettings[bandKey].visible = isVisible
      })
      return bandSettings
    },
  },
  watch: {
  },
  methods: {
    ...mapMutations({
      setBandSelections: 'settings/data/setBandSelections',
      setBandSettings: 'settings/data/setBandSettings'
    }),
    updateBandSelections (newBandSelections) {
      let thisVue = this
      thisVue.bandSelections = newBandSelections
    },
    resetFormData () {
      let thisVue = this
      thisVue.bandSelections = thisVue.appBandSelections
    },
    submitFormData () {
      let thisVue = this
      thisVue.setBandSelections(thisVue.bandSelections)
      thisVue.setBandSettings(thisVue.bandSettings)
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
