<template>
  <v-form v-model="formValid"
          lazy-validation
  >
    <v-container fluid grid-list-md>
      <v-row>
        <v-col md="3">
          <v-text-field dense hide-details
                      v-model="myCall"
                      label="My Call"
          ></v-text-field>
        </v-col>
        <v-col md="3">
          <v-text-field dense hide-details
                   v-model="myGrid"
                   label="My Grid"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col md="12">
          <SettingsFormSubmit
              :originalValues="[appMyCall, appMyGrid]"
              :currentValues="[myCall, myGrid]"
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
      myCall: '',
      myGrid: ''
    }
  },
  computed: {
    ...mapState({
      appMyCall: state => state.settings.general.myCall,
      appMyGrid: state => state.settings.general.myGrid
    })
  },
  watch: {
  },
  methods: {
    ...mapMutations({
      setMyCall: 'settings/general/setMyCall',
      setMyGrid: 'settings/general/setMyGrid'
    }),
    resetFormData () {
      let thisVue = this
      thisVue.myCall = thisVue.appMyCall
      thisVue.myGrid = thisVue.appMyGrid
    },
    submitFormData () {
      let thisVue = this
      thisVue.setMyCall(thisVue.myCall)
      thisVue.setMyGrid(thisVue.myGrid)
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
