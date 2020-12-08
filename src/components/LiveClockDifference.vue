<template>
  <LiveClock>
    <template v-slot:default="liveClockProps">
      <MomentDifference v-if="futurePositive"
                        :startMoment="liveClockProps.momentNow"
                        :endMoment="diffMoment"
                        :showHours="showHours"
                        :showSeconds="showSeconds"
      ></MomentDifference>
      <MomentDifference v-if="!futurePositive"
                        :startMoment="diffMoment"
                        :endMoment="liveClockProps.momentNow"
                        :showHours="showHours"
                        :showSeconds="showSeconds"
      ></MomentDifference>
    </template>
  </LiveClock>
</template>

<script>
import LiveClock from '@/components/LiveClock.vue'
import MomentDifference from '@/components/MomentDifference.vue'

export default {
  name: 'LiveClockDifference',
  components: {
    LiveClock: LiveClock,
    MomentDifference: MomentDifference
  },
  props: {
    diffMoment: {
      type: Object,
      default: function () { return null }
    },
    futurePositive: {
      type: Boolean,
      default: function () { return true }
    },
    showHours: {
      type: Boolean,
      default: function () { return false }
    },
    showSeconds: {
      type: Boolean,
      default: function () { return true }
    }
  },
  data () {
    return {
      msTotal: 0,
      seconds: 0,
      minutes: 0,
      hours: 0,
      isNegative: false
    }
  },
  watch: {
    startMoment () {
      let thisVue = this
      thisVue.computeTimes()
    },
    endMoment () {
      let thisVue = this
      thisVue.computeTimes()
    }
  },
  methods: {
    computeTimes () {
      let thisVue = this
      if (thisVue.endMoment && thisVue.startMoment) {
        let msTotal = thisVue.endMoment - thisVue.startMoment
        let seconds = Math.round(Math.abs(msTotal) / 1000)
        let minutes = Math.floor(seconds / 60)
        seconds = seconds - (60 * minutes)
        let hours = 0
        if (thisVue.showHours) {
          hours = Math.floor(minutes / 60)
          minutes = minutes - (60 * hours)
        }
        thisVue.hours = hours
        thisVue.minutes = minutes
        thisVue.seconds = seconds
        thisVue.msTotal = msTotal
        thisVue.isValid = true
      } else {
        thisVue.isValid = false
      }
    }
  },
  created () {
    let thisVue = this
    thisVue.computeTimes()
  }
}
</script>

<style>
</style>
