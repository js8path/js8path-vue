<template>
  <div>
    <v-btn small hide-details class="pa-1 mr-2"
           :disabled="!valuesChanged"
           @click="$emit('reset-form-data')"
    >Reset</v-btn>
    <v-btn small hide-details class="pa-1 mr-2"
           :disabled="!valuesChanged || !formValid"
           @click="$emit('submit-form-data')"
    >Save</v-btn>
  </div>
</template>

<script>
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'

export default {
  name: 'SettingsFormSubmit',
  props: {
    originalValues: {
      type: Array,
      default: function () {
        return []
      }
    },
    currentValues: {
      type: Array,
      default: function () {
        return []
      }
    },
    formValid: {
      type: Boolean,
      default: function () {
        return true
      }
    }
  },
  computed: {
    valuesChanged () {
      let thisVue = this
      return (_isEmpty(thisVue.originalValues) && _isEmpty(thisVue.currentValues)) ||
        !_isEqual(thisVue.originalValues, thisVue.currentValues)
    }
  }
}
</script>

<style>
</style>
