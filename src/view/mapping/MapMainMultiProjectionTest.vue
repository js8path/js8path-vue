<template>
  <!--
  Here are a bunch of links for info on multiple projections (and azimuthal projection) with vue layers and open layers
  https://github.com/ghettovoice/vuelayers/blob/master/docs/quickstart.md#global-data-projection
  https://github.com/ghettovoice/vuelayers/issues/150
  https://openlayers.org/en/latest/doc/faq.html#how-do-i-change-the-projection-of-my-map-
  https://stackoverflow.com/questions/44684133/web-map-with-opellayers-polar-projection
  http://proj4js.org/
  https://spatialreference.org/ref/
  https://openlayers.org/en/latest/doc/tutorials/raster-reprojection.html
  https://openlayers.org/en/latest/examples/reprojection.html
  https://openlayers.org/en/master/examples/reprojection-image.
  https://gis.stackexchange.com/questions/279763/correct-projection-proj-4-string-to-rotate-map
  https://gis.stackexchange.com/questions/68938/manipulating-azimuthal-equidistant-projections-in-qgis
  https://vuelayers.github.io/#/docs/component/view


  -->
  <v-container fluid>
    <v-row>
      <v-col md="2">
        <v-btn small @click="displayMap = !displayMap">Display: {{displayMap}} </v-btn>
      </v-col>
      <v-col md="4">
      <v-select
          v-model="selectedProjectionName"
          :items="projectionList"
          label="Current Projection"
      ></v-select>
      </v-col>
      <v-col md="6">
        {{JSON.stringify(currentProjectionDef)}}
      </v-col>
    </v-row>
    <v-row>
    <vl-map v-if="displayMap" :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
            style="height: 500px"> <!-- :data-projection="currentProjectionName"  -->
      <vl-view :zoom.sync="zoom"
               :projection="currentProjectionName"
               :center.sync="center"
               :rotation.sync="rotation"

      > <!-- :extent="[-6371000, -6371000, 6371000, 6371000]" -->
      </vl-view>

      <vl-layer-tile id="osm"

      >
        <vl-source-osm :projection="'EPSG:4326'"
        ></vl-source-osm>
      </vl-layer-tile>

      <vl-layer-vector id="vectorCountries01"
      >
        <vl-source-vector
            url="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"
        ></vl-source-vector>
        <vl-style-box  :z-index="100">
          <vl-style-stroke color="green" :width="2"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
        </vl-style-box>
      </vl-layer-vector>

      <vl-layer-vector id="vectorLakes01"
                       :projection="currentProjectionName"
      >
        <vl-source-vector
            url="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_lakes.geojson"
        ></vl-source-vector>
        <vl-style-box  :z-index="110">
          <vl-style-stroke color="blue" :width="1"></vl-style-stroke>
          <vl-style-fill color="rgba(0,0,255,0.5)"></vl-style-fill>
        </vl-style-box>
      </vl-layer-vector>

      <vl-feature>
        <vl-geom-line-string :coordinates="[xfmFromLonLat([1, -5]), xfmFromLonLat([10, -20])]"
        ></vl-geom-line-string>
      </vl-feature>

      <vl-feature>
        <vl-geom-line-string :coordinates="[xfmFromLonLat([-76.5, 39.2]), xfmFromLonLat([176.92, -38])]"
        ></vl-geom-line-string>
      </vl-feature>

      <vl-feature>
        <vl-geom-line-string :coordinates="[xfmFromLonLat([-76.5, 39.2]), xfmFromLonLat([115.75, -31.79])]"
        ></vl-geom-line-string>
      </vl-feature>

      <vl-feature>
        <vl-geom-line-string :coordinates="[xfmFromLonLat([-76.5, 39.2]), xfmFromLonLat([2.08, 41.46])]"
        ></vl-geom-line-string>
      </vl-feature>

      <vl-feature>
        <vl-geom-line-string :coordinates="[xfmFromLonLat([-76.5, 39.2]), xfmFromLonLat([-1.5, 51.75])]"
        ></vl-geom-line-string>
      </vl-feature>

      <vl-layer-vector>
          <vl-feature id="origin01">
            <vl-geom-point :coordinates="[1, 1]"></vl-geom-point>
            <vl-style-box :z-index="1000">
              <vl-style-circle :radius="5">
                <vl-style-fill :color="'green'"></vl-style-fill>
                <vl-style-stroke :color="'green'"></vl-style-stroke>
              </vl-style-circle>
            </vl-style-box>
          </vl-feature>
          <vl-feature id="origin02">
            <vl-geom-point :coordinates="xfmFromLonLat([-76.5, 39.2])"></vl-geom-point>
            <vl-style-box :z-index="1000">
              <vl-style-circle :radius="5">
                <vl-style-fill :color="'orange'"></vl-style-fill>
                <vl-style-stroke :color="'green'"></vl-style-stroke>
              </vl-style-circle>
            </vl-style-box>
          </vl-feature>
          <vl-feature id="point01">
            <vl-geom-point :coordinates="xfmFromLonLat([3, 3])"></vl-geom-point>
          </vl-feature>
          <vl-feature id="point02">
            <vl-geom-point :coordinates="xfmFromLonLat([6, 6])"></vl-geom-point>
          </vl-feature>
          <vl-feature id="point03">
            <vl-geom-point :coordinates="xfmFromLonLat([10, 20])"></vl-geom-point>
          </vl-feature>
        </vl-layer-vector>

      <vl-feature v-for="pathStation in pathStations"
                  v-bind:key="'pathStationsPoints'+pathStation.key"
                  :id="'pathStationsPoints'+pathStation.key">
        <vl-geom-point v-if="stationLocationValid(pathStation)"
                       :coordinates="xfmFromLonLat([pathStation.maidenhead.lon, pathStation.maidenhead.lat])"
        ></vl-geom-point>
        <vl-style-box  :z-index="zIndexesForMap.currentPathPoint">
          <vl-style-circle :radius="5">
            <vl-style-fill
                :color="fillColorForCurrentPathStation(pathStation)"
            ></vl-style-fill>
            <vl-style-stroke
                :color="strokeColorsForMap.currentPathLines"
            ></vl-style-stroke>
          </vl-style-circle>
        </vl-style-box>
      </vl-feature>

      <vl-feature v-for="(pathStation, pathStationIx) in pathStations"
                  v-bind:key="'pathStationsSegs'+pathStation.key"
                  :id="'pathStationsSegss'+pathStation.key">
        <vl-geom-line-string  v-if="pathStationIx > 0"
            :coordinates="[xfmFromLonLat([pathStations[pathStationIx - 1].maidenhead.lon, pathStations[pathStationIx - 1].maidenhead.lat]), xfmFromLonLat([pathStation.maidenhead.lon, pathStation.maidenhead.lat])]"
        ></vl-geom-line-string>
      </vl-feature>

    </vl-map>
    <div style="padding: 20px">
      Zoom: {{ zoom }}<br>
      Center: {{ center }}<br>
      Rotation: {{ rotation }}<br>
      My geolocation: {{ geolocPosition }}
    </div>
    </v-row>
  </v-container>
</template>

<script>
import _assign from 'lodash/assign'
// import _clone from 'lodash/clone'
import _isNull from 'lodash/isNull'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'

// import GeographicLib from 'geographiclib'
// let  Geodesic = GeographicLib.Geodesic
// let DMS = GeographicLib.DMS
// let geod = Geodesic.WGS84

// vuelayers docs: https://vuelayers.github.io/#/docs/component/multi-line-string-geom
import { findPointOnSurface } from 'vuelayers/lib/ol-ext'

// http://proj4js.org/
// https://stackoverflow.com/questions/44684133/web-map-with-opellayers-polar-projection
// https://openlayers.org/en/latest/doc/tutorials/raster-reprojection.html
// https://gis.stackexchange.com/questions/118125/proj4js-is-this-correct-implementation-of-azimuthal-equidistant-relative-to-an
import {register} from 'ol/proj/proj4'
import {get as getProjection, fromLonLat, toLonLat} from 'ol/proj';
import proj4 from 'proj4'
// proj4.defs('CUSTOM:10001', '+proj=aeqd  +R=6371000 +lat_0=34 +lon_0=-81 +units=degrees')
// proj4.defs('CUSTOM:10001', '+proj=aeqd  +R=6371000 +lat_0=34 +lon_0=-81 +units=m')

var proj4ProjectionList = [
  ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
  ['EPSG:4269', '+title=NAD83 (long/lat) +proj=longlat +ellps=GRS80 +datum=NAD83 +a=6378137.0 +b=6356752.31414036 +units=degrees'],
  ['EPSG:3857m', '+title=Web Mercator (meters) +proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'], // https://spatialreference.org/ref/sr-org/6864/
  ['EPSG:3857d', '+title=Web Mercator (degrees) +proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=degrees +no_defs'],
  ['EPSG:21781', '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
  '+x_0=600000 +y_0=200000 +ellps=bessel ' +
  '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs'
  ], // from https://github.com/ghettovoice/vuelayers/issues/150
  ['ESRI:102016', '+title=North Polar Azimuthal Equidistant (WGS84/m)   +proj=aeqd  +ellps=WGS84 +datum=WGS84 +lat_0=90   +lon_0=0     +x_0=0 +y_0=0 +units=m       +no_defs'],
  ['ESRI:102019', '+title=South Polar Azimuthal Equidistant (WGS84/m)   +proj=aeqd  +ellps=WGS84 +datum=WGS84 +lat_0=-90  +lon_0=0     +x_0=0 +y_0=0 +units=m       +no_defs'],
  ['CUSTOM:10003', '+title=Arbitrary Azimuthal Equidistant (WGS84/m)    +proj=aeqd  +ellps=WGS84 +datum=WGS84 +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=m       +no_defs'],
  ['CUSTOM:10033', '+title=Arbitrary Azimuthal Equidistant (ESRI:54032) +proj=aeqd               +datum=WGS84 +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=m       +no_defs'],
  ['CUSTOM:10033', '+title=Arbitrary Azimuthal Equidistant (zzz)        +proj=aeqd  +ellps=WGS84 +k_0=0.5     +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0'],
  ['CUSTOM:10101', '+title=North Polar Azimuthal Equidistant (sphere/m) +proj=aeqd  +R=6371000                +lat_0=90   +lon_0=0     +x_0=0 +y_0=0 +units=m       +no_defs'],
  ['CUSTOM:10102', '+title=South Polar Azimuthal Equidistant (sphere/m) +proj=aeqd  +R=6371000                +lat_0=-90  +lon_0=0     +x_0=0 +y_0=0 +units=m       +no_defs'],
  ['CUSTOM:10103', '+title=Arbitrary Azimuthal Equidistant (sphere/m)   +proj=aeqd  +R=6371000                +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=m       +no_defs'],
  ['CUSTOM:10201', '+title=North Polar Azimuthal Equidistant (sphere/d) +proj=aeqd  +R=6371000                +lat_0=90   +lon_0=0     +x_0=0 +y_0=0 +units=degrees +no_defs'],
  ['CUSTOM:10202', '+title=South Polar Azimuthal Equidistant (sphere/d) +proj=aeqd  +R=6371000                +lat_0=-90  +lon_0=0     +x_0=0 +y_0=0 +units=degrees +no_defs'],
  ['CUSTOM:10203', '+title=Arbitrary Azimuthal Equidistant (sphere/d)   +proj=aeqd  +R=6371000                +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=degrees +no_defs'],
  ['CUSTOM:10233', '+title=Arbitrary Azimuthal Equidistant (sphere2)    +proj=aeqd  +R=6371000                +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0'],
  ['EPSG:3413',    '+title=NSIDC Polar Stereographic North (EPSG:3413)  +proj=stere +k=1         +datum=WGS84 +lat_0=90   +lon_0=-45   +x_0=0 +y_0=0 +units=m       +no_defs +lat_ts=70'],
  ['CUSTOM:10303', '+title=NSIDC Polar Stereographic (Arbitrary)        +proj=stere +k=1         +datum=WGS84 +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=m       +no_defs +lat_ts=70'],
  ['CUSTOM:10403', '+title=Lambert Azimuthal Equal-Area (Arbitrary)     +proj=laea  +ellps=WGS84              +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=m       +no_defs']
]
var proj4ProjectionNames = _map(proj4ProjectionList, (proj4ProjectionSpec) => {return proj4ProjectionSpec[0]})
proj4.defs(proj4ProjectionList)
register(proj4)

import PathBuilderMixin from '@/view/PathBuilderMixin.js'

let zIndexesDefault = {
  allStationsPoints: 120,
  allStationsContacts: 110,
  currentPathPoint: 310,
  currentPathLines: 300,
  pathStationAllContacts: 200,
  pathStationIncomingContacts: 210,
  pathStationOutgoingContacts: 210
}

let strokeColorsDefault = {
  allStationsPoints: 'blue',
  allStationsContacts: 'gray',
  currentPathPoint: 'black',
  currentPathLines: 'blue',
  pathStationAllContacts: 'white',
  pathStationIncomingContacts: 'green',
  pathStationOutgoingContacts: 'red'
}

export default {
  name: 'MapMainMultiProjectionTest',
  mixins: [
    PathBuilderMixin
  ],
  components: {
  },
  props: {
    loading: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    stationList: {
      type: Array,
      default: function () {
        return []
      }
    },
    pathStations: {
      type: Array,
      default: function () {
        return []
      }
    },
    selectedPathStation: {
      type: Object,
      default: function () {
        return null
      }
    },
    strokeColors: {
      type: Object,
      default: function () {
        return {}
      }
    },
    zIndexes: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      zoom: 2,
      center: [5, 15],
      center2: [5, 15],
      rotation: 0,
      displayMap: true,
      projectionList: proj4ProjectionNames,
      selectedProjectionName: 'EPSG:4326',
      currentProjectionName: 'EPSG:4326',
      geolocPosition: undefined,
      selectedFeatures: [],
      enableFeatureSelect: true,
      /* simple pattern */
      txToPattern: [12, 12],
      txToOffset: 0,
      rxFromPattern: [12, 12],
      rxFromOffset: -12

      /*  __.. ..__ pattern
      txToPattern: [6, 4, 2, 4, 2, 22],
      txToOffset: -6,
      rxFromPattern: [2, 4, 2, 4, 6, 22],
      rxFromOffset: 12
       */
    }
  },
  computed: {
    currentProjection () {
      let thisVue = this
      return getProjection(thisVue.currentProjectionName)
    },
    strokeColorsForMap () {
      let thisVue = this
      return _assign({}, strokeColorsDefault, thisVue.strokeColors)
    },
    zIndexesForMap () {
      let thisVue = this
      return _assign({}, zIndexesDefault, thisVue.zIndexes)
    },
    currentProjectionDef () {
      let thisVue = this
      return proj4.defs(thisVue.currentProjectionName)
    }
  },
  watch: {
    selectedProjectionName (newProjectionName, oldProjectionName) {
      let thisVue = this
      if (newProjectionName !== oldProjectionName) {
        let centerLonLat = thisVue.center
        console.log(JSON.stringify([1, centerLonLat, oldProjectionName]))
        if (oldProjectionName) {
          centerLonLat = thisVue.xfmToLonLat(thisVue.center, oldProjectionName)
          console.log(JSON.stringify([2, centerLonLat]))
        }
        let centerProj = thisVue.xfmFromLonLat(centerLonLat, newProjectionName)
        console.log(JSON.stringify([3, centerProj, newProjectionName]))
        thisVue.displayMap = false
        thisVue.$nextTick(() => {
          thisVue.center = centerProj
          thisVue.currentProjectionName = newProjectionName
          thisVue.displayMap = true
        })
      }
    }
  },
  methods: {
    pointOnSurface: findPointOnSurface,
    xfmFromLonLat(lonlat = [0, 0], projectionName = null) {
      let thisVue = this
      if (_isNull(projectionName)) {
        projectionName = thisVue.currentProjectionName
      }
      return fromLonLat(lonlat, projectionName)
    },
    xfmToLonLat(xy = [0, 0], projectionName = null) {
      let thisVue = this
      if (_isNull(projectionName)) {
        projectionName = thisVue.currentProjectionName
      }
      return toLonLat(xy, projectionName)
    },
    stationLocationValid(station) {
      let isValid = true
      if (!station.maidenhead) {
        isValid = false
      } else if (!_isNumber(station.maidenhead.lon)) {
        isValid = false
      } else if (!_isNumber(station.maidenhead.lat)) {
        isValid = false
      }
      return isValid
    },
    fillColorForCurrentPathStation(pathStation) {
      let thisVue = this
      let fillColor = 'transparent'
      if (pathStation) {
        if (thisVue.selectedPathStation && pathStation.sameStationAs(thisVue.selectedPathStation)) {
          fillColor = thisVue.strokeColorsForMap.currentPathPoint
        } else if (thisVue.pathStations.length > 0 && pathStation.sameStationAs(thisVue.pathStations[0])) {
          fillColor = thisVue.strokeColorsForMap.currentPathLines
        }
      }
      return fillColor
    }
  }
}
</script>

<style>
</style>
