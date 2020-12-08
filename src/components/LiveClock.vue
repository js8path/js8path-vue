<template>
  <span>
    <slot v-bind:momentNow="momentNow"
          v-bind:momentNowUTC="momentNowUTC"
    >
      {{momentNow.format('HH:mm:ss')}}
    </slot>
  </span>
</template>

<script>
import moment from 'moment'

/* example usage displaying utc instead
      <LiveClock>
        <template v-slot:default="slotProps">
          {{slotProps.momentNowUTC.format('HH:mm:ss')}}
        </template>
      </LiveClock>
 */

export default {
  name: 'LiveClock',
  components: {
  },
  props: {
    updateIntervalMs: {
      // FixMe: this is not dynamically updateable
      type: Number,
      default: function () { return 1000 }
    }
  },
  data () {
    return {
      intervalID: null,
      momentNow: moment()
    }
  },
  computed: {
    momentNowUTC () {
      let thisVue = this
      return moment.utc(thisVue.momentNow)
    }
  },
  methods: {
    updateMomentNow () {
      let thisVue = this
      thisVue.momentNow = moment()
      thisVue.$emit('clockUpdated', thisVue.momentNow)
    }
  },
  created () {
    let thisVue = this
    thisVue.intervalID = setInterval(thisVue.updateMomentNow, thisVue.updateIntervalMs)
  },
  destroyed () {
    let thisVue = this
    if (thisVue.intervalID) {
      clearInterval(thisVue.intervalID)
    }
  }
}
</script>

<style>
</style>
