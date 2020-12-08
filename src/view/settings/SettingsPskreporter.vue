<template>
  <v-form v-model="formValid"
          lazy-validation
  >
    <v-container fluid grid-list-md>
      <v-row>
        <v-col md="3" class="subtitle-1">
          PSKReporter Settings
        </v-col>
      </v-row>
      <v-row>
        <v-col md="3">
          <v-checkbox dense hide-details
                      v-model="autoLoadEnabled"
                      label="Auto-Load Enabled"
          ></v-checkbox>
        </v-col>
        <v-col md="3">
          <v-text-field dense
                        v-model="autoLoadIntervalSeconds"
                        :rules="autoloadIntervalRules"
                        label="Auto-Load Interval (seconds)"
          ></v-text-field>
        </v-col>
        <v-col md="3">
          <v-text-field dense
                        v-model="minLoadIntervalSeconds"
                        :rules="minloadIntervalRules"
                        label="Minimum Load Interval (seconds)"
          ></v-text-field>
        </v-col>
        <v-col md="3">
          <v-text-field dense
                        v-model="maxLoadAgeSeconds"
                        :rules="maxLoadAgeRules"
                        label="Maximum Requested Report Age (seconds)"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col md="12">
          <SettingsFormSubmit
              :originalValues="[appAutoLoadEnabled, appAutoLoadIntervalSecondsString, appMinLoadIntervalSecondsString, appMaxLoadAgeSecondsString]"
              :currentValues="[autoLoadEnabled, autoLoadIntervalSeconds, minLoadIntervalSeconds, maxLoadAgeSeconds]"
              :formValid="formValid"
              @reset-form-data="resetFormData"
              @submit-form-data="submitFormData"
           ></SettingsFormSubmit>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
// import _isNaN from 'lodash/isNaN'
import _isInteger from 'lodash/isInteger'
import _toInteger from 'lodash/toInteger'
import _toNumber from 'lodash/toNumber'
import _toString from 'lodash/toString'
import {mapMutations, mapState} from 'vuex'
import SettingsFormSubmit from '@/view/settings/SettingsFormSubmit.vue'

export default {
  name: 'SettingsPskreporter',
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
      autoLoadEnabled: false,
      autoLoadIntervalSeconds: '',
      minLoadIntervalSeconds: '',
      maxLoadAgeSeconds: '',
      autoloadIntervalRules: [
        v => _isInteger(_toNumber(v)) || 'value must be positive integer',
        v => _toInteger(v) >= 600 || 'value must be 600 or greater'
      ],
      minloadIntervalRules: [
        v => _isInteger(_toNumber(v)) || 'value must be positive integer',
        v => _toInteger(v) >= 240 || 'value must be 240 or greater'
      ],
      maxLoadAgeRules: [
        v => _isInteger(_toNumber(v)) || 'value must be positive integer',
        v => _toInteger(v) >= 600 || 'value must be 600 or greater',
        v => _toInteger(v) < 5400 || 'value must be 5400 or less'
      ]
    }
  },
  computed: {
    ...mapState({
      appAutoLoadEnabled: state => state.settings.pskreporter.autoLoadEnabled,
      appAutoLoadIntervalSecondsNumber: state => state.settings.pskreporter.autoLoadIntervalSeconds,
      appMinLoadIntervalSecondsNumber: state => state.settings.pskreporter.minLoadIntervalSeconds,
      appMaxLoadAgeSecondsNumber: state => state.settings.pskreporter.maxLoadAgeSeconds
    }),
    appAutoLoadIntervalSecondsString () {
      let thisVue = this
      return _toString(thisVue.appAutoLoadIntervalSecondsNumber)
    },
    appMinLoadIntervalSecondsString () {
      let thisVue = this
      return _toString(thisVue.appMinLoadIntervalSecondsNumber)
    },
    appMaxLoadAgeSecondsString () {
      let thisVue = this
      return _toString(thisVue.appMaxLoadAgeSecondsNumber)
    }
  },
  watch: {
  },
  methods: {
    ...mapMutations({
      setAutoLoadEnabled: 'settings/pskreporter/setAutoLoadEnabled',
      setAutoLoadIntervalSecondsNumber: 'settings/pskreporter/setAutoLoadIntervalSeconds',
      setMinLoadIntervalSecondsNumber: 'settings/pskreporter/setMinLoadIntervalSeconds',
      setMaxLoadAgeSecondsNumber: 'settings/pskreporter/setMaxLoadAgeSeconds'
    }),
    resetFormData () {
      let thisVue = this
      thisVue.autoLoadEnabled = thisVue.appAutoLoadEnabled
      thisVue.autoLoadIntervalSeconds = thisVue.appAutoLoadIntervalSecondsString
      thisVue.minLoadIntervalSeconds = thisVue.appMinLoadIntervalSecondsString
      thisVue.maxLoadAgeSeconds = thisVue.appMaxLoadAgeSecondsString
    },
    submitFormData () {
      let thisVue = this
      thisVue.setAutoLoadEnabled(thisVue.autoLoadEnabled)
      thisVue.setAutoLoadIntervalSecondsNumber(_toInteger(thisVue.autoLoadIntervalSeconds))
      thisVue.setMinLoadIntervalSecondsNumber(_toInteger(thisVue.minLoadIntervalSeconds))
      thisVue.setMaxLoadAgeSecondsNumber(_toInteger(thisVue.maxLoadAgeSeconds))
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
