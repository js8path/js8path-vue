<template>
  <div>
    <v-row>
      <v-col xs="12" md="3">
        <v-checkbox dense hide-details
                    class="pl-1"
                    v-model="groupByEndStation"
                    label="Group by end station"
        ></v-checkbox>
      </v-col>
      <v-col xs="12" md="19">
        <StationSearchWidget
            :searchString="searchString"
            @search-string-changed="searchStringChanged"
        ></StationSearchWidget>
      </v-col>
    </v-row>
    <DetailedPathsTable
        v-if="!groupByEndStation"
        :detailedPaths="makeAllDetailedPaths()"
        :searchString="searchString"
        :itemsPerPage="10"
        @build-path="buildPath"
    />
    <v-data-table
        v-if="groupByEndStation"
        item-key="key"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :search="searchString"
        :headers="headers"
        :items="tableItems"
        :items-per-page="10"
        :expanded.sync="expanded"
        show-expand
        singleExpand
        dense
        class="elevation-1"
    >
      <template v-slot:header>
        <thead class="v-data-table-header">
        <tr>
          <th colspan="1"></th>
          <th class="text-center rx-by-root" colspan="2">End Station</th>
          <th colspan="1"></th>
          <th class="text-center rx-by-root" colspan="2">From Start</th>
          <th colspan="1"></th>
        </tr>
        </thead>
      </template>
      <template v-slot:expanded-item="{ item: endStationItem }">
        <td :colspan="7">
          <DetailedPathsTable
              :detailedPaths="makeDetailedPaths(endStationItem.simplePaths)"
              :itemsPerPage="5"
              @build-path="buildPath"
          />
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import _concat  from 'lodash/concat'
  import _forEach  from 'lodash/forEach'
  import _isNaN  from 'lodash/isNaN'
  import _map  from 'lodash/map'
  import js8pathRoute from '@js8path/js8path-route'

  import DetailedPathsTable from '@/view/stationPaths/detailedPathsTable.vue'
  import StationSearchWidget from '@/components/StationSearchWidget.vue'

  export default {
    name: 'StationCategoryPaths',
    components: {
      DetailedPathsTable: DetailedPathsTable,
      StationSearchWidget: StationSearchWidget
    },
    props: {
      rootStation: {
        type: Object,
        default: function () {
          return null
        }
      },
      pathsByEndStation: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    data () {
      return {
        groupByEndStation: true,
        searchString: '',
        selectedEndStationKey: null,
        sortBy: ['endStation.call'],
        sortDesc: [true],
        expanded: [],
        headers: [
          {
            text: 'Call',
            value: 'endStation.call',
            filterable: true,
            width: "1%"
          },
          {
            text: 'Grid',
            value: 'endStation.grid',
            filterable: true,
            width: "1%"
          },
          {
            text: '# Paths',
            value: 'pathCount',
            filterable: false,
            width: "1%"
          },
          {
            text: 'Bearing',
            value: 'bearing',
            filterable: false,
            width: "1%"
          },
          {
            text: 'Distance (km)',
            value: 'distance',
            filterable: false,
            width: "1%"
          },
          {
            text: '',
            value: 'spacer',
            filterable: false
          }
        ]
      }
    },
    computed: {
      tableItems () {
        let thisVue = this
        return _map(thisVue.pathsByEndStation, (simplePaths) => {
          let simpleStartStation = simplePaths[0][0]
          let simpleEndStation = simplePaths[0][simplePaths[0].length-1]
          let startStation = new js8pathRoute.LinkedStation(simpleStartStation, null, simpleEndStation)
          let endStation = new js8pathRoute.LinkedStation(simpleEndStation, simpleStartStation, null)
          return {
            key: endStation.key,
            startStation: startStation,
            endStation: endStation,
            bearing: _isNaN(startStation.bearingToNext) ? 0 : startStation.bearingToNext,
            distance: Math.round(startStation.distanceToNext),
            simplePaths: simplePaths,
            pathCount: simplePaths.length,
            spacer: ''
          }
        })
      }
    },
    watch: {
    },
    methods: {
      searchStringChanged (newSearchString) {
        let thisVue = this
        thisVue.searchString = newSearchString
      },
      selectEndStationKey (endStationKey) {
        let thisVue = this
        if (endStationKey === thisVue.selectedEndStationKey) {
          thisVue.selectedEndStationKey = null
        } else {
          thisVue.selectedEndStationKey = endStationKey
        }
      },
      buildPath (selectedPath) {
        let thisVue = this
        thisVue.$emit('build-path', selectedPath)
      },
      makeDetailedPath (simplePath = []) {
        return new js8pathRoute.DetailedPath(simplePath)
      },
      makeDetailedPaths (simplePathList = []) {
        let thisVue = this
        return _map(simplePathList, thisVue.makeDetailedPath)
      },
      makeAllDetailedPaths () {
        let thisVue = this
        let simplePathList = []
        _forEach(thisVue.pathsByEndStation, (simplePaths) => {
          simplePathList = _concat(simplePathList, simplePaths)
        })
        return thisVue.makeDetailedPaths(simplePathList)
      }
    },
    created () {
    }
  }
</script>

<style>
</style>
