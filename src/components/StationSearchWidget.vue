<template>
  <div>
    <v-tooltip bottom v-if="myCall">
      <template v-slot:activator="{ on }">
        <v-icon size="medium" v-on="on"
            @click="localSearchString = myCall"
        >mdi-face-agent</v-icon>
      </template>
      <span>My call</span>
    </v-tooltip>
    <v-tooltip bottom v-if="myGrid">
      <template v-slot:activator="{ on }">
        <v-icon size="medium" v-on="on"
            @click="localSearchString = myGrid"
        >mdi-home-circle</v-icon>
      </template>
      <span>My grid</span>
    </v-tooltip>
    <v-tooltip bottom v-if="canSaveSearchString">
      <template v-slot:activator="{ on }">
        <v-icon size="medium" v-on="on"
                @click="saveSearchString"
        >mdi-content-save-outline</v-icon>
      </template>
      <span>Save search string</span>
    </v-tooltip>
    <v-tooltip bottom v-if="showSavedSearches">
      <template v-slot:activator="{ on }">
        <v-icon size="medium" v-on="on"
                @click="selectSavedSearch = false"
        >mdi-cursor-text</v-icon>
      </template>
      <span>Enter search string</span>
    </v-tooltip>
    <v-tooltip bottom v-if="canShowSavedSearches">
      <template v-slot:activator="{ on }">
        <v-icon size="medium" v-on="on"
                @click="selectSavedSearch = true"
        >mdi-select-place</v-icon>
        <!-- FixMe: update mdi and use mdi-select-form -->
      </template>
      <span>Select saved search</span>
    </v-tooltip>
    <v-tooltip bottom v-if="localSearchString">
      <template v-slot:activator="{ on }">
        <v-icon size="medium" v-on="on"
            @click="localSearchString = ''"
        >mdi-close-circle-outline</v-icon>
      </template>
      <span>Clear search string</span>
    </v-tooltip>
    <v-text-field
        class="d-inline-block ml-2"
        v-if="!showSavedSearches"
        v-model="localSearchString"
        append-icon="search"
        label="Search"
        single-line
        hide-details
    />
    <v-select
        class="d-inline-block ml-2"
        v-if="showSavedSearches"
        v-model="localSearchString"
        :items="savedSearches"
        dense
        label="Saved Searches"
    />
  </div>
</template>

<script>
import _concat from 'lodash/concat'
import _includes from 'lodash/includes'
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'

  export default {
  name: 'StationSearchWidget',
  components: {
  },
  props: {
    searchString: {
      type: String,
      default: function () {
        return ''
      }
    }
  },
  data () {
    return {
      localSearchString: '',
      selectSavedSearch: false,
      savedSearchesMax: 10
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
</style>
