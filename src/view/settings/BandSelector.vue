<template>
  <v-container fluid>
    <v-row v-for="(bandNames, rowIx) in bandsForRows"
           v-bind:key="'row'+rowIx"
           class="my-0 py-1"
    >
      <v-col cols="1" class="my-0 py-0">
        <b v-if="rowIx === 0">Bands</b>
        <v-btn v-if="rowIx === 1"
               x-small pa-1
               @click="selectAllBands"
        >All</v-btn>
        <v-btn v-if="rowIx === 2"
               x-small pa-1
               @click="selectNoBands"
        >None</v-btn>
      </v-col>
      <v-col cols="1" class="my-0 py-0"
             v-for="(bandName, colIx) in bandNames"
             v-bind:key="'col'+colIx"
      >
        <v-checkbox  class="shrink ma-0 pa-0"
                     hide-details
                     v-model="selectedBandNames"
                     :label="bandName"
                     :value="bandName"
        ></v-checkbox>
      </v-col>
    </v-row>
  </v-container>
</template>

<!--
<div>
  <v-select
      pa-1
      class="d-inline-block"
      v-model="selectedBandNames"
      :items="allBandNames"
      small-chips
      dense
      multiple
      label="Bands to Display"
  >
  </v-select>
</div>
-->
<!--
<div>
  <v-container fluid>
    <v-row>
      <v-col cols="2">
        <div class="py-4">
          Bands
        </div>
        <div class="py-4">
          <v-btn
              x-small pa-1
              @click="selectAllBands"
          >All</v-btn>
        </div>
        <div class="py-4">
          <v-btn
              x-small pa-1
              @click="selectNoBands"
          >None</v-btn>
        </div>
      </v-col>
      <v-col cols="2"
             v-for="(column, colIx) in partitionArray(allBandNames, 4)"
             v-bind:key="colIx"
      >
        <v-checkbox  v-for="bandName in column"
                     v-bind:key="bandName"
                     v-model="selectedBandNames"
                     :label="bandName"
                     :value="bandName"
        ></v-checkbox>
      </v-col>
    </v-row>
  </v-container>
</div>
-->

<script>
import _clone from 'lodash/clone'
import _forEach from 'lodash/forEach'
import _isEqual from 'lodash/isEqual'
import _keys from 'lodash/keys'
import _pickBy from 'lodash/pickBy'

export default {
  name: 'BandSelector',
  mixins: [
  ],
  components: {
  },
  props: {
    bandSelections: {
      type: Object, // { bandName: selectedBoolean }
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      selectedBandNames: []
    }
  },
  computed: {
    allBandNames () {
      let thisVue = this
      return _keys(thisVue.bandSelections)
    },
    currentBandNames () {
      let thisVue = this
      return _keys(_pickBy(thisVue.bandSelections))
    },
    bandsForRows () {
      let thisVue = this
      let bandRows = thisVue.partitionArray(thisVue.allBandNames, 3)
      while (bandRows.length < 3) {
        bandRows.push([])
      }
      return bandRows
    }
  },
  watch: {
    currentBandNames (newValue, oldValue) {
      let thisVue = this
      if (!_isEqual(newValue, oldValue)) {
        thisVue.selectedBandNames = thisVue.currentBandNames
      }
    },
    selectedBandNames () {
      let thisVue = this
      if (!_isEqual(thisVue.selectedBandNames, thisVue.currentBandNames)) {
        thisVue.updateBandSelections()
      }
    }
  },
  methods: {
    partitionArray(values = [], nparts= 4) {
      let valuesPerPart = Math.max(1, Math.round(values.length / nparts))
      let allParts = []
      let currentPart = []
      _forEach(values, (value) => {
        currentPart.push(value)
        if (currentPart.length >= valuesPerPart) {
          allParts.push(currentPart)
          currentPart = []
        }
      })
      if (currentPart.length > 0) {
        allParts.push(currentPart)
      }
      return allParts
    },
    selectAllBands () {
      let thisVue = this
      thisVue.selectedBandNames = _clone(thisVue.allBandNames)
    },
    selectNoBands () {
      let thisVue = this
      thisVue.selectedBandNames = []
    },
    updateBandSelections () {
      let thisVue = this
      let newBandSelections = {}
      _forEach(thisVue.bandSelections, (isSelected, bandName) => {
        newBandSelections[bandName] = false
      })
      _forEach(thisVue.selectedBandNames, (bandName) => {
        newBandSelections[bandName] = true
      })
      thisVue.$emit('update-band-selections', newBandSelections)
    }
  },
  created () {
    let thisVue = this
    thisVue.selectedBandNames = thisVue.currentBandNames
  },
  destroyed () {
  }
}
</script>

<style>
</style>
