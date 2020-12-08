<template>
  <vl-feature :id="featureIdForTemplate">
    <vl-geom-multi-line-string :coordinates="coordinates"
    ></vl-geom-multi-line-string>
    <vl-style-box :z-index="zIndex">
      <vl-style-stroke
          :color="strokeColor"
          :width="strokeWidth"
          :lineDash="strokeLineDash"
          :lineDashOffset="strokeLineDashOffset"
      ></vl-style-stroke>
    </vl-style-box>
  </vl-feature>
</template>

<script>
let globalFeatureIdIx = 0

export default {
  name: 'MappingMultiLineString',
  components: {},
  props: {
    coordinates: {
      type: Array,
      default: function () {
        return []
      }
    },
    strokeColor: {
      type: String,
      default: function () {
        return 'black'
      }
    },
    strokeWidth: {
      type: Number,
      default: function () {
        return 1.25
      }
    },
    strokeLineDash: {
      type: Array,
      default: function () {
        return []
      }
    },
    strokeLineDashOffset: {
      type: Number,
      default: function () {
        return 0
      }
    },
    zIndex: {
      type: Number,
      default: function () {
        return 0
      }
    },
    featureId: {
      type: String,
      default: function () {
        return ''
      }
    },
    autoFeatureIdPrefix: {
      type: String,
      default: function () {
        return 'js8path_MappingLineString_'
      }
    }
  },
  data() {
    return {
      featureIdIx: 0
    }
  },
  computed: {
    featureIdForTemplate () {
      let thisVue = this
      let featureIdForTemplate = thisVue.featureId
      if (!featureIdForTemplate) {
        featureIdForTemplate = thisVue.autoFeatureIdPrefix + thisVue.featureIdIx
      }
      return featureIdForTemplate
    }
  },
  methods: {
  },
  created () {
    let thisVue = this
    globalFeatureIdIx = globalFeatureIdIx + 1
    thisVue.featureIdIx = globalFeatureIdIx
  }
}
</script>

<style>
</style>
