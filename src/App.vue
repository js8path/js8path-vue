<template>
  <v-app>
    <MainAppBar/>
    <v-content>
      <MainContent />
    </v-content>
  </v-app>
</template>

<script>
import {mapActions} from 'vuex'

import MainAppBar from '@/view/MainAppBar.vue'
import MainContent from '@/view/Main.vue'

export default {
  name: 'app',
  components: {
    MainAppBar: MainAppBar,
    MainContent: MainContent
  },
  methods: {
    ...mapActions({
      initializeAppData: 'initializeAppData'
    })
  },
  created () {
    let thisVue = this
    thisVue.initializeAppData().then(function () {
      console.log('initialized')
    })
  }
}
</script>

<style lang="sass">
@import '../node_modules/typeface-roboto/index.css'
</style>

<style>
</style>
