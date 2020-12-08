<template>
  <div class="text-no-wrap">
    <span :class="{'font-weight-bold': callBold}">
      {{station.call}}
    </span>
    <v-tooltip right v-if="showRxTx">
      <template v-if="stationIsRx"
                v-slot:activator="{ on }"
      >
        <div class="text-icon" v-on="on">Rx</div>
      </template>
      <span>Rx: Station provides reception reports</span>
    </v-tooltip>
    <v-tooltip right v-if="showRxTx">
      <template v-if="stationIsTx"
                v-slot:activator="{ on }"
      >
        <div class="text-icon" v-on="on">Tx</div>
      </template>
      <span>Tx: Station transmissions received by others</span>
    </v-tooltip>
  </div>
</template>

<script>
import _size from 'lodash/size'

export default {
  name: 'StationCallWidget',
  components: {
  },
  props: {
    station: {
      type: Object
    },
    callBold: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    showRxTx: {
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
    stationIsRx () {
      let thisVue = this
      return _size(thisVue.station.rxFrom)
    },
    stationIsTx () {
      let thisVue = this
      return _size(thisVue.station.txTo)
    }
  },
  watch: {
  },
  methods: {
  },
  created () {
  }
}
</script>

<style>
  div.text-icon {
    display: inline-block;
    font-size: x-small;
    font-weight: lighter;
    margin-left: 2px;
  }
</style>
