<template>
  <span>
    <template v-if="showSNr && !reverse">
      <span :class="{'font-weight-bold': true, 'mr-1': showAge}">{{receptionReport.sNR}}</span>
    </template>
    <LiveClockDifference v-if="showAge"
                      class="font-weight-light"
                      :diffMoment="receptionReportMoment"
                      :futurePositive="false"
                      :showHours="true"
                      :showSeconds="false"
    ></LiveClockDifference>
    <template v-if="showSNr && reverse">
      <span :class="{'font-weight-bold': true, 'ml-1': showAge}">{{receptionReport.sNR}}</span>
    </template>
  </span>
</template>

<script>
import moment from 'moment'

import LiveClockDifference from '@/components/LiveClockDifference.vue'

export default {
  name: 'ReceptionReport',
  components: {
    LiveClockDifference: LiveClockDifference
  },
  props: {
    receptionReport: {
      type: Object,
      default: function () {
        return {
          timestamp: '2010-01-01T00:00:00Z',
          freqHz: 7080000,
          band: '7',
          sNR: null, // or integer
          rxCall: 'RX0ABC',
          rxGrid: 'AA11',
          txCall: 'TX9XYZ',
          txGrid: 'ZZ99',
          srcType: 'test',
          srcData: null
        }
      }
    },
    reverse: {
      type: Boolean,
      default: function () { return false }
    },
    showAge: {
      type: Boolean,
      default: function () { return true }
    },
    showSNr: {
      type: Boolean,
      default: function () { return true }
    }
  },
  data () {
    return {
      intervalId: null
    }
  },
  computed: {
    receptionReportMoment () {
      let thisVue = this
      return moment(thisVue.receptionReport.timestamp)
    }
  },
  methods: {
  },
  created () {
  },
  destroyed () {
  }
}
</script>

<style>
</style>
