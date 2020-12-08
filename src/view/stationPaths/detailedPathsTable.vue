<template>
  <v-data-table
      item-key="key"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :search="searchString"
      :headers="headers"
      :items="tableItems"
      :items-per-page="itemsPerPage"
      :expanded.sync="expanded"
      show-expand
      singleExpand
      dense
      class="elevation-1"
  >
    <template v-slot:item.actions="{ item: tableItem }">
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <v-icon size="small"
                  v-on="on"
                  @click="buildPath(tableItem.detailedPath.simplePath)"
          >mdi-wrench</v-icon>
        </template>
        <span>Open in Path Builder</span>
      </v-tooltip>
    </template>
    <template v-slot:item.detailedPath.totalDistance="{ item: tableItem }">
      {{Math.round(tableItem.detailedPath.totalDistance)}}
    </template>
    <template v-slot:item.pathCalls="{ item: tableItem }">
      <span v-for="(linkedStation, stationIndex) in tableItem.linkedStations"
            v-bind:key="stationIndex">
        <span v-if="stationIndex > 0">
          -
        </span>
        {{linkedStation.call}}
      </span>
    </template>
    <template v-slot:expanded-item="{ item: tableItem }">
      <td colspan="8">
        <PathStationCards
            :pathStations="tableItem.detailedPath.simplePath"
            :selectedStationIndex="null"
            :showPathActions="false"
            :showSetRootStation="false"
            :canUnlinkCards="false"
        />
      </td>
    </template>
  </v-data-table>
</template>

<script>
  import PathStationCards from '@/view/PathStationCards.vue'
  import _isNaN  from 'lodash/isNaN'
  import _join from 'lodash/join'
  import _last from 'lodash/last'
  import _map from 'lodash/map'
  import js8pathRoute from '@js8path/js8path-route'

  export default {
    name: 'DetailedPathsTable',
    components: {
      PathStationCards: PathStationCards
    },
    props: {
      detailedPaths: {
        type: Array,
        default: function () {
          return []
        }
      },
      itemsPerPage: {
        type: Number,
        default: function () {
          return 10
        }
      },
      searchString: {
        type: String,
        default: function () {
          return ''
        }
      }
    },
    data () {
      return {
        sortBy: ['endStation.call'],
        sortDesc: [true],
        expanded: [],
        headers: [
          {
            text: 'Actions',
            value: 'actions',
            sortable: false,
            filterable: false,
            width: "1%"
          },
          {
            text: 'End Station',
            value: 'endStation.call',
            filterable: true,
            width: "1%"
          },
          {
            text: 'Bearing',
            value: 'bearing',
            filterable: true,
            width: "1%"
          },
          {
            text: 'Distance (km)',
            value: 'distance',
            filterable: true,
            width: "1%"
          },
          {
            text: '# Stations',
            value: 'detailedPath.stationCount',
            filterable: false,
            width: "1%"
          },
          {
            text: 'Path Length (km)',
            value: 'detailedPath.totalDistance',
            filterable: false,
            width: "1%"
          },
          {
            text: 'Path',
            value: 'pathCalls',
            filterable: true,
            sortable: false
          }
        ]
      }
    },
    computed: {
      tableItems () {
        let thisVue = this
        return _map(thisVue.detailedPaths, (detailedPath) => {
          let simpleStartStation =detailedPath.linkedStations[0].station
          let simpleEndStation = _last(detailedPath.linkedStations).station
          let endToEndStartStation = new js8pathRoute.LinkedStation(simpleStartStation, null, simpleEndStation)
          return {
            key: detailedPath.key,
            detailedPath: detailedPath,
            endStation: _last(detailedPath.linkedStations),
            bearing: _isNaN(endToEndStartStation.bearingToNext) ? 0 : endToEndStartStation.bearingToNext,
            distance: Math.round(endToEndStartStation.distanceToNext),
            linkedStations: detailedPath.linkedStations,
            pathCalls: _join(_map(detailedPath.linkedStations, 'call'), ' ')
          }
        })
      }
    },
    watch: {
    },
    methods: {
      buildPath (selectedPath) {
        let thisVue = this
        thisVue.$emit('build-path', selectedPath)
      }
    },
    created () {
    }
  }
</script>

<style>
</style>
