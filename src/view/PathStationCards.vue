<template>
  <v-container dense fluid grid-list-md class="path-station-cards">
    <v-row v-if="pathStations.length === 0">
      <v-col cols="4">
        no path stations
      </v-col>
    </v-row>
    <v-row dense v-if="pathStations.length > 0">
      <div class="path-actions" v-if="showPathActions">
        <v-tooltip right v-if="canUnlinkCards">
          <template v-slot:activator="{ on }">
            <v-icon small
                    v-on="on"
                    @click="$emit('clear-path')"
            >mdi-close</v-icon>
          </template>
          <span>Clear current path</span>
        </v-tooltip>
        <br/>
        <v-tooltip right v-if="pathStations.length > 1">
          <template v-slot:activator="{ on }">
            <v-icon small
                    v-on="on"
                    @click="$emit('reverse-path')"
            >mdi-swap-horizontal</v-icon>
          </template>
          <span>Reverse current path</span>
        </v-tooltip>
      </div>
      <v-col xs="6" sm="3" md="2"
             v-for="(linkedStation, linkedStationIx) in linkedStations"
             v-bind:key="'card' + linkedStation.key"
      >
        <LinkedStationCard
            :linkedStation="linkedStation"
            :stationSelected="selectedStation && linkedStation.sameStationAs(selectedStation)"
            :showSetRootStation="showSetRootStation && linkedStationIx > 0"
            :canUnlinkCard="canUnlinkCards"
            @center-station-azimuthal="centerStationAzimuthal(linkedStation)"
            @link-stations="linkStations"
            @unlink-station="unlinkStation"
            @set-root-station="$emit('set-root-station', linkedStation)"
            @select-station="selectStation"
        >
        </LinkedStationCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import _map  from 'lodash/map'
  import js8pathRoute from '@js8path/js8path-route'

  import LinkedStationCard from '@/view/linkedStationCard.vue'

  export default {
    name: 'PathStationCards',
    components: {
      LinkedStationCard: LinkedStationCard
    },
    props: {
      pathStations: {
        type: Array,
        default: function () { return [] }
      },
      selectedStation: {
        type: Object,
        default: function () { return null }
      },
      canUnlinkCards: {
        type: Boolean,
        default: function () { return true }
      },
      showSetRootStation: {
        type: Boolean,
        default: function () { return true }
      },
      showPathActions: {
        type: Boolean,
        default: function () { return true }
      }
    },
    data () {
      return {
      }
    },
    computed: {
      linkedStations () {
        let thisVue = this
        return _map(thisVue.pathStations, function (station, ix, pathStations) {
          return new js8pathRoute.LinkedStation(
            station,
            (ix > 0) ? pathStations[ix-1] : null,
            (ix +1 < pathStations.length) ? pathStations[ix+1] : null
          )
        })
      }
    },
    watch: {
    },
    methods: {
      centerStationAzimuthal (selectedStation) {
        let thisVue = this
        thisVue.$emit('center-station-azimuthal', selectedStation)
      },
      linkStations (station1, station2) {
        let thisVue = this
        thisVue.$emit('link-stations', station1, station2)
      },
      unlinkStation (selectedStation) {
        let thisVue = this
        thisVue.$emit('unlink-station', selectedStation)
      },
      selectStation (selectedStation) {
        let thisVue = this
        thisVue.$emit('select-station', selectedStation)
      }
    },
    created () {
    },
    destroyed () {
    }
  }
</script>

<style>
  .container.path-station-cards {
    border: 1px solid gray;
    padding: 2px 4px;
  }

</style>
