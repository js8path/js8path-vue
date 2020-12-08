<template>
  <v-container fluid grid-list-md>
    <v-row>
      <v-col md="12">
        <v-tabs v-model="currentTabKey">
          <v-tab v-for="tabDef in tabDefs"
                 :key="tabDef.key"
                 :href="'#tab-' + tabDef.key"
          >
            {{tabDef.label}}
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="12">
        <v-tabs-items v-model="currentTabKey">
          <v-tab-item :value="'tab-pskreporter'">
            <SettingsPskreporter
                @settings-updated="settingsUpdated"
            ></SettingsPskreporter>
          </v-tab-item>
          <v-tab-item :value="'tab-reports'">
            <SettingsReports
                @settings-updated="settingsUpdated"
            ></SettingsReports>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapActions} from 'vuex'

import SettingsPskreporter from '@/view/settings/SettingsPskreporter.vue'
import SettingsReports from '@/view/settings/SettingsReports.vue'

export default {
  name: 'SettingsData',
  mixins: [
  ],
  components: {
    SettingsPskreporter,
    SettingsReports
  },
  props: {
  },
  data () {
    return {
      currentTabKey: null,
      tabDefs: [
        { key: 'pskreporter', label: 'PSKReporter'},
        { key: 'reports', label: 'Reports'}
      ]
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    ...mapActions({
    }),
    settingsUpdated () {
      let thisVue = this
      thisVue.$emit('settings-updated')
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
