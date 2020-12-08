<template>
  <v-container fluid grid-list-md>
    <v-row>
      <LinkedStationsTable
          v-if="selectedPathStations.length > 0"
          :linkedStations="selectedPathStations"
          :loading="loading"
          :allStations="allStations"
          @center-station-azimuthal="centerStationAzimuthal"
          @add-linked-station="addLinkedStation" />
    </v-row>
  </v-container>
</template>

<script>
import PathBuilderMixin from '@/view/PathBuilderMixin.js'

import LinkedStationsTable from '@/view/linkedStationsTable.vue'
export default {
  name: 'PathBuilder',
  mixins: [
    PathBuilderMixin
  ],
  components: {
    LinkedStationsTable: LinkedStationsTable
  },
  props: {
    allStations: {
      type: Array,
      default: function () { return [] }
    },
    loading: {
      type: Boolean,
      default: function () {
        return false
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    centerStationAzimuthal (station) {
      let thisVue = this
      thisVue.$emit('center-station-azimuthal', station)
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
