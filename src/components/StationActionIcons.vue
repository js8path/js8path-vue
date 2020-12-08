<template>
  <div class="station-action-icons">
    <v-tooltip bottom v-if="showCenterStationAzimuthal">
      <template v-slot:activator="{ on }">
        <v-icon small
                v-on="on"
                @click="$emit('center-station-azimuthal', station)"
        >mdi-crosshairs-gps</v-icon>
      </template>
      <span>Center map here</span>
    </v-tooltip>
    <v-tooltip bottom v-if="showLinkStation">
      <template v-slot:activator="{ on }">
        <v-icon small
                v-on="on"
                @click="$emit('add-station-to-path', station)"
        >mdi-plus-network</v-icon>
      </template>
      <span>Add to path</span>
    </v-tooltip>
    <v-tooltip bottom v-if="showUnlinkStation">
      <template v-slot:activator="{ on }">
        <v-icon small
                v-on="on"
                @click="$emit('unlink-station', station)"
        >mdi-bookmark-remove</v-icon>
      </template>
      <span>Remove from path</span>
    </v-tooltip>
    <v-tooltip bottom v-if="showSetRootStation">
      <template v-slot:activator="{ on }">
        <v-icon small
                v-on="on"
                @click="$emit('set-root-station', station)"
        >mdi-home-floor-1</v-icon>
      </template>
      <span>Start path here</span>
    </v-tooltip>
  </div>
</template>

<script>
import _concat from 'lodash/concat'
import _includes from 'lodash/includes'
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'

  export default {
  name: 'StationActionIcons',
  components: {
  },
  props: {
    station: {
      type: Object
    },
    showCenterStationAzimuthal: {
      type: Boolean,
      default: function () {
        return true
      }
    },
    showLinkStation: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    showUnlinkStation: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    showSetRootStation: {
      type: Boolean,
      default: function () {
        return true
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      myCall: state => state.settings.general.myCall,
      myGrid: state => state.settings.general.myGrid,
      savedSearches: state => state.settings.general.recentSearches
    }),
    ...mapGetters({
    }),
    canSaveSearchString () {
      let thisVue = this
      return thisVue.localSearchString && !_includes(thisVue.savedSearches, thisVue.localSearchString)
    },
    canShowSavedSearches () {
      let thisVue = this
      return !thisVue.selectSavedSearch && thisVue.savedSearches.length > 0
    },
    showSavedSearches () {
      let thisVue = this
      return thisVue.selectSavedSearch && thisVue.savedSearches.length > 0
    }
  },
  watch: {
    localSearchString (newValue, oldValue) {
      let thisVue = this
      if (newValue !== oldValue) {
        thisVue.$emit('search-string-changed', newValue)
      }
    },
    searchString (newValue, oldValue) {
      let thisVue = this
      if (newValue !== oldValue) {
        thisVue.localSearchString = thisVue.searchString
      }
    }
  },
  methods: {
    ...mapActions({
      storeSettings: 'settings/storeSettings'
    }),
    ...mapMutations({
      setSavedSearches: 'settings/general/setRecentSearches'
    }),
    saveSearchString () {
      let thisVue = this
      if (thisVue.canSaveSearchString) {
        let newSavedSearches = _concat(thisVue.savedSearches, thisVue.localSearchString)
        if (newSavedSearches.length > thisVue.savedSearchesMax) {
          newSavedSearches.pop()
        }
        thisVue.setSavedSearches(newSavedSearches)
        return thisVue.storeSettings()
      }
    }
  },
  created () {
    let thisVue = this
    thisVue.localSearchString = thisVue.searchString
  }
}
</script>

<style>
  div.station-action-icons {
    white-space: nowrap;
  }
</style>
