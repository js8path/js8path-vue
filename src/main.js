import Vue from 'vue'
import App from './App.vue'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import vuetify from './plugins/vuetify';
// import router from './router'
import store from './store/store-root'

// https://linusborg.github.io/portal-vue/#/guide
import PortalVue from 'portal-vue'

// https://vuelayers.github.io/#/docs/component/multi-line-string-geom
import VueLayers from 'vuelayers'
// import { Map, TileLayer, OsmSource, Geoloc } from 'vuelayers'
import 'vuelayers/lib/style.css' // needs css-loader


Vue.use(PortalVue)
Vue.use(VueLayers, {
  // dataProjection: 'EPSG:4326',
})
// Vue.use(Map)
// Vue.use(TileLayer)
// Vue.use(OsmSource)
// Vue.use(Geoloc)

Vue.config.productionTip = false

new Vue({
  vuetify,
  // router,
  store,
  render: h => h(App),
}).$mount('#app')

