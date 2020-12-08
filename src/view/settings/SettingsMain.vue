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
          <v-tab-item :value="'tab-general'">
            <SettingsGeneral
                @settings-updated="settingsUpdated"
            ></SettingsGeneral>
          </v-tab-item>
          <v-tab-item :value="'tab-bands'">
            <SettingsBands
                @settings-updated="settingsUpdated"
            ></SettingsBands>
          </v-tab-item>
          <v-tab-item :value="'tab-mapping'">
            <SettingsMapping
                @settings-updated="settingsUpdated"
            ></SettingsMapping>
          </v-tab-item>
          <v-tab-item :value="'tab-data'">
            <SettingsData
                @settings-updated="settingsUpdated"
            ></SettingsData>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapActions} from 'vuex'

import SettingsBands from '@/view/settings/SettingsBands.vue'
import SettingsGeneral from '@/view/settings/SettingsGeneral.vue'
import SettingsMapping from '@/view/settings/SettingsMapping.vue'
import SettingsData from '@/view/settings/SettingsData.vue'

export default {
  name: 'SettingsMain',
  mixins: [
  ],
  components: {
    SettingsBands,
    SettingsGeneral,
    SettingsMapping,
    SettingsData
  },
  props: {
  },
  data () {
    return {
      currentTabKey: null,
      tabDefs: [
        { key: 'general', label: 'General'},
        { key: 'bands', label: 'Bands'},
        { key: 'mapping', label: 'Mapping'},
        { key: 'data', label: 'Data'}
      ]
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    ...mapActions({
      storeSettings: 'settings/storeSettings'
    }),
    settingsUpdated () {
      let thisVue = this
      return thisVue.storeSettings().then((success) => {
        console.log('settings updated')
        return Promise.resolve(success)
      })
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
