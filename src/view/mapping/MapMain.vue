<template>
  <v-container fluid>
    <v-row>
      <vl-map ref="mainmap"
              v-if="!disableMap"
              style="height: 500px"
              :load-tiles-while-animating="true"
              :load-tiles-while-interacting="true"
      >
        <vl-view
            :projection="currentProjectionName"
            :zoom.sync="zoom"
            :center.sync="center"
            :rotation.sync="rotation"
        ></vl-view>

        <vl-layer-tile
            id="osm"
            :z-index="30"
        >
          <vl-source-osm></vl-source-osm>
        </vl-layer-tile>

        <vl-layer-vector
            id="vectorCountries01"
            :z-index="10"
            :visible="useAzimuthalProjection"
        >
          <vl-source-vector
              url="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"
          ></vl-source-vector>
          <vl-style-box>
            <vl-style-stroke color="green" :width="2"></vl-style-stroke>
            <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
          </vl-style-box>
        </vl-layer-vector>

        <vl-layer-vector
            id="vectorLakes01"
            :z-index="20"
            :visible="useAzimuthalProjection"
        >
          <vl-source-vector
              url="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_lakes.geojson"
          ></vl-source-vector>
          <vl-style-box>
            <vl-style-stroke color="blue" :width="1"></vl-style-stroke>
            <vl-style-fill color="rgba(0,0,255,0.5)"></vl-style-fill>
          </vl-style-box>
        </vl-layer-vector>

        <vl-geoloc @update:position="geolocPosition = $event">
          <template slot-scope="geoloc">
            <vl-feature v-if="geoloc.position" id="position-feature">
              <vl-geom-point :coordinates="geoloc.position"></vl-geom-point>
              <vl-style-box>
                <vl-style-icon src="_media/marker.png" :scale="0.4" :anchor="[0.5, 1]"></vl-style-icon>
              </vl-style-box>
            </vl-feature>
          </template>
        </vl-geoloc>

        <vl-feature
            v-if="displayGrayLine"
        >
          <vl-geom-polygon
              :coordinates="grayLineMultiLine"
              id="currentGrayline"
          ></vl-geom-polygon>
          <vl-style-box
              :z-index="20"
          >
            <!--
            <vl-style-stroke
                v-if="useAzimuthalProjection"
                color="lightgray"
                :width="10"
            ></vl-style-stroke>
            -->
            <vl-style-fill
                v-if="useAzimuthalProjection"
                color="rgba(255,255,255,0.2)"
            ></vl-style-fill>
            <vl-style-fill
                v-if="!useAzimuthalProjection"
                color="rgba(0,0,0,0.2)"
            ></vl-style-fill>
          </vl-style-box>
        </vl-feature>

        <vl-layer-vector
            v-for="(bandStations, bandId) in stationsByBand"
            v-bind:key="'bandStations' + bandId"
            :id="'bandStations' + bandId"
            :z-index="zIndexesForMap.allStationsPoints"
            :visible="(alwaysShowAllStations || pathStations.length === 0) && bandSettings[bandId].visible"
        >
        <vl-source-vector
            :features="stationFeaturesByBand[bandId]"
        ></vl-source-vector>
          <vl-style-box>
            <vl-style-circle :radius="5">
              <vl-style-stroke :color="bandSettings[bandId].color"></vl-style-stroke>
            </vl-style-circle>
          </vl-style-box>
        </vl-layer-vector>

        <template v-if="alwaysShowAllContacts || pathStations.length === 0">
          <template v-for="(bandData, bandId) in allContactsProjectedByBand">
            <template v-if="bandSettings[bandId].visible">
              <MappingMultiLineString v-if="bandData.oneWayMappingMultiLine.length > 0"
                                      v-bind:key="'allStationsTxToContacts|'+ bandId"
                                      :coordinates="bandData.oneWayMappingMultiLine"
                                      :strokeColor="bandSettings[bandId].color"
                                      :strokeWidth="0.8"
                                      :strokeLineDash="[4, 4]"
                                      :zIndex="zIndexesForMap.allStationsContacts"
                                      :featureId="'allStationsTxToContacts|' + bandId"
              ></MappingMultiLineString>
              <MappingMultiLineString v-if="bandData.twoWayMappingMultiLine.length > 0"
                                      v-bind:key="'allStationsRxFromContacts|'+ bandId"
                                      :coordinates="bandData.twoWayMappingMultiLine"
                                      :strokeColor="bandSettings[bandId].color"
                                      :strokeWidth="2.2"
                                      :strokeLineDash="[]"
                                      :zIndex="zIndexesForMap.allStationsContacts + 1"
                                      :featureId="'allStationsRxFromContacts|' + bandId"
              ></MappingMultiLineString>
            </template>
          </template>
        </template>

        <vl-feature v-for="pathStation in pathStations"
                    v-bind:key="'pathStationsPoints'+pathStation.key"
                    :id="'pathStationsPoints'+pathStation.key">
          <vl-geom-point v-if="stationLocationValid(pathStation)"
                         :coordinates="[pathStation.maidenhead.lon, pathStation.maidenhead.lat]"
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

        <template v-if="pathStations.length > 1">
          <template v-for="(mlscoords, mlsix) in [pathGreatCircleMultiLineString(pathStations)]">
            <MappingMultiLineString v-if="mlscoords.length > 0"
                                    v-bind:key="'pathBuilderGCPath'+mlsix"
                                    :coordinates="xfmMultiLineFromLonLat(mlscoords)"
                                    :strokeColor="strokeColorsForMap.currentPathLines"
                                    :strokeWidth="3"
                                    :zIndex="zIndexesForMap.currentPathLines"
                                    featureId="pathBuilderGCPath"
            ></MappingMultiLineString>
          </template>
        </template>


        <template v-if="pathStations.length > 0 && selectedPathStation">
          <vl-feature v-for="station in txToStationsForStation(selectedPathStation)"
                      v-bind:key="'txToStation'+ station.key"
                      :id="'txToStation'+station.key"
          >
            <vl-geom-point v-if="stationLocationValid(station)"
                           :coordinates="xfmFromLonLat([station.maidenhead.lon, station.maidenhead.lat])"
            ></vl-geom-point>
            <vl-style-box :z-index="400">
              <vl-style-circle :radius="5">
                <vl-style-stroke :color="strokeColorsForMap.pathStationOutgoingContacts"></vl-style-stroke>
              </vl-style-circle>
            </vl-style-box>
          </vl-feature>

          <vl-feature v-for="station in rxFromStationsForStation(selectedPathStation)"
                      v-bind:key="'rxFromStation'+ station.key"
                      :id="'rxFromStation' + station.key"
          >
            <vl-geom-point v-if="stationLocationValid(station)"
                           :coordinates="xfmFromLonLat([station.maidenhead.lon, station.maidenhead.lat])"
            ></vl-geom-point>
            <vl-style-box :z-index="400">
              <vl-style-circle :radius="3">
                <vl-style-stroke :color="strokeColorsForMap.pathStationIncomingContacts"></vl-style-stroke>
                <vl-style-fill :color="strokeColorsForMap.pathStationIncomingContacts"></vl-style-fill>
              </vl-style-circle>
            </vl-style-box>
          </vl-feature>

          <template v-for="(contact, contactIx) in contactsForStation(selectedPathStation)">
            <MappingLineString v-if="contact.waypoints.length > 0"
                                    v-bind:key="'pathEndStationContacts'+contactIx"
                                    :coordinates="xfmLineFromLonLat(contact.waypoints)"
                                    :strokeColor="strokeColorsForMap.pathStationAllContacts"
                                    :strokeWidth="0.5"
                                    :zIndex="zIndexesForMap.pathStationAllContacts"
                                    :featureId="'pathEndStationContacts'+contactIx"
            ></MappingLineString>
            <MappingLineString v-if="contact.waypoints.length > 0 && contact.txToPwr"
                                    v-bind:key="'pathEndStationTxToContacts'+contactIx"
                                    :coordinates="xfmLineFromLonLat(contact.waypoints)"
                                    :strokeColor="strokeColorsForMap.pathStationOutgoingContacts"
                                    :strokeLineDash="txToPattern"
                                    :strokeLineDashOffset="txToOffset"
                                    :strokeWidth="0.8 + contact.txToPwr * 4.0"
                                    :zIndex="zIndexesForMap.pathStationOutgoingContacts"
                                    :featureId="'pathEndStationTxToContacts'+contactIx"
            ></MappingLineString>
            <MappingLineString v-if="contact.waypoints.length > 0 && contact.rxFromPwr"
                                    v-bind:key="'pathEndStationRxFromContacts'+contactIx"
                                    :coordinates="xfmLineFromLonLat(contact.waypoints)"
                                    :strokeColor="strokeColorsForMap.pathStationIncomingContacts"
                                    :strokeLineDash="rxFromPattern"
                                    :strokeLineDashOffset="rxFromOffset"
                                    :strokeWidth="0.8 + contact.rxFromPwr * 3.0"
                                    :zIndex="zIndexesForMap.pathStationIncomingContacts"
                                    :featureId="'pathEndStationRxFromContacts'+contactIx"
            ></MappingLineString>
          </template>
        </template>

        <vl-interaction-select
            v-if="enableFeatureSelect"
            :features.sync="selectedFeatures"
            :filter="filterForSelect"
            :multi="true"
        >
          <template slot-scope="select">
            <vl-overlay class="feature-popup"
                        v-if="select.features.length > 0"
                        id="selected-stations-details-popup"
                        :position="pointOnSurface(select.features[0].geometry)"
                        :auto-pan="true"
                        :auto-pan-animation="{ duration: 300 }"
            >
              <template>
                <div class="selected-stations-popup caption">
                  <div class="full-width">
                    <div class="font-weight-bold float-left">
                      Selected Stations
                    </div>
                    <div class="float-right">
                      <v-tooltip left>
                        <template v-slot:activator="{ on }">
                          <v-icon small
                                  v-on="on"
                                  @click="selectedFeatures = []"
                          >mdi-close-box</v-icon>
                        </template>
                        <span>Close popup</span>
                      </v-tooltip>
                    </div>
                  </div>
                  <div>
                    <table>
                      <thead>
                      <tr>
                        <th>&nbsp;</th>
                        <th>Call</th>
                        <th>Band</th>
                        <th>Grid</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="station in stationsFromFeatures(select.features)"
                          :key="station.key"
                      >
                        <td>
                          <div class="station-action-icon float-left">
                            <v-tooltip left>
                              <template v-slot:activator="{ on }">
                                <v-icon small
                                        v-on="on"
                                        @click="$emit('center-station-azimuthal', station)"
                                >mdi-crosshairs-gps</v-icon>
                              </template>
                              Center map here
                            </v-tooltip>
                          </div>
                          <div class="station-action-icon float-left">
                            <v-tooltip left>
                              <template v-slot:activator="{ on }">
                                <v-icon small
                                        v-on="on"
                                        @click="setRootStation(station)"
                                >mdi-home-floor-1</v-icon>
                              </template>
                              <span>Start Path Here</span>
                            </v-tooltip>
                          </div>
                          <div class="station-action-icon float-left"
                               v-if="canAddStation(station)"
                          >
                            <v-tooltip left>
                              <template v-slot:activator="{ on }">
                                <v-icon small
                                        v-on="on"
                                        @click="addLinkedStation(station)"
                                >mdi-plus-network</v-icon>
                              </template>
                              <span>Add to Path</span>
                            </v-tooltip>
                          </div>
                          <div class="station-action-icon float-left"
                               v-if="stationIsInPath(station)"
                          >
                            <v-tooltip left>
                              <template v-slot:activator="{ on }">
                                <v-icon small
                                        v-on="on"
                                        @click="unlinkStation(station)"
                                >mdi-bookmark-remove</v-icon>
                              </template>
                              <span>Remove from Path</span>
                            </v-tooltip>
                          </div>
                        </td>
                        <td class="font-weight-bold">{{station.call}}</td>
                        <td>{{station.band}}</td>
                        <td>{{station.grid}}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
            </vl-overlay>
          </template>
        </vl-interaction-select>
      </vl-map>
    </v-row>

    <v-row v-if="showCoordinateDetails">
      <div style="padding: 20px">
        Zoom: {{ zoom }}<br>
        Center: {{ center }}<br>
        Rotation: {{ rotation }}<br>
        My geolocation: {{ geolocPosition }}
      </div>
    </v-row>

    <v-row>
      <v-col md="1">
        <v-btn small @click="refreshMap">Refresh</v-btn>
      </v-col>
      <v-col md="2">
        <v-switch dense hide-details class="pa-0 ma-0 caption"
                  v-model="azimuthalCheckboxValue"
                  label="Azimuthal"
        ></v-switch>
      </v-col>
      <v-col md="2">
        <v-switch dense hide-details class="pa-0 ma-0 caption"
                  v-model="showCoordinateDetails"
                  label="Details"
        ></v-switch>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// See notes in MappingNote.md

import _assign from 'lodash/assign'
import _debounce from 'lodash/debounce'
import _defaults from 'lodash/defaults'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _isNull from 'lodash/isNull'
import _isNumber from 'lodash/isNumber'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _startsWith from 'lodash/startsWith'
import _values from 'lodash/values'

import moment from 'moment'
import GeographicLib from 'geographiclib'
let  Geodesic = GeographicLib.Geodesic
let geod = Geodesic.WGS84
import { findPointOnSurface } from 'vuelayers/lib/ol-ext'

import {register as registerProjection} from 'ol/proj/proj4'
import {
  fromLonLat,
  toLonLat
} from 'ol/proj';
import proj4 from 'proj4'
proj4.defs('EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees')
proj4.defs('CUSTOM:AZIMUTHAL', '+title=Lambert Azimuthal Equal-Area (Arbitrary)     +proj=laea  +ellps=WGS84              +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=m       +no_defs')
let azimuthalIx = 0
registerProjection(proj4)

import DayNight from 'ol-ext/source/DayNight'

import js8pathRoute from '@js8path/js8path-route'

import PathBuilderMixin from '@/view/PathBuilderMixin.js'

import MappingLineString from '@/view/mapping/MappingLineString.vue'
import MappingMultiLineString from '@/view/mapping/MappingMultiLineString.vue'

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
  name: 'MapMain',
  mixins: [
    PathBuilderMixin
  ],
  components: {
    MappingLineString: MappingLineString,
    MappingMultiLineString: MappingMultiLineString
  },
  props: {
    loading: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    displayGrayLine: {
      type: Boolean,
      default: function () {
        return true
      }
    },
    grayLineMoment: {
      // if not null, lock grayline to this moment
      type: Object,
      default: function () {
        return null
      }
    },
    grayLineUpdateSeconds: {
      // gray line update interval, if grayLineMoment is null
      type: Number,
      default: function () {
        return 300
      }
    },
    momentNow: {
      // timer-updated moment value. Must be supplied for auto updates (grayLine, etc)
      type: Object,
      default: function () {
        return null
      }
    },
    alwaysShowAllStations: {
      type: Boolean,
      default: function () {
        return true
      }
    },
    alwaysShowAllContacts: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    useAzimuthalProjection: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    azimuthalCenterStation: {
      type: Object,
      default: function () {
        return null
      }
    },
    bandSettings: {
      type: Object,
      default: function () {
        return {}  // { <bandId>: { visible: true, color: 'gray' } }
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
  data () {
    return {
      disableMap: false,
      showCoordinateDetails: false,
      showAllContacts: false,
      currentProjectionName: 'EPSG:4326',
      zoom: 2,
      center: [0, 15],
      rotation: 0,
      grayLineDayNight: new DayNight({}),
      grayLineLonLatMultiLine: [], // current gray line in lon/lat coordinates
      grayLineComputedMoment: null, // moment when grayLineLonLatMultiLine was computed
      geolocPosition: undefined,
      selectedFeatures: [],
      enableFeatureSelect: true,
      allStationsSegmentDegrees: 5,
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
    azimuthalCheckboxValue: {
      get: function () {
        return this.useAzimuthalProjection
      },
      // setter
      set: function (newValue) {
        this.$emit('set-use-azimuthal-projection', newValue)
      }
    },
    allStationsLonLat () {
      // returns { <stationKey>: [ <stationLongitude>, <stationLatitude> ], ... }
      let thisVue = this
      let stationsLonLat = {}
      _forEach(thisVue.stationList, (station) => {
        if (thisVue.stationLocationValid(station)) {
          stationsLonLat[station.key] = [station.maidenhead.lon, station.maidenhead.lat]
        }
      })
      return stationsLonLat
    },
    allStationsProjected () {
      // returns { <stationKey>: [ <stationProjectedX>, <stationProjectedY> ], ... }
      let thisVue = this
      let stationsXY = {}
      _forEach(thisVue.allStationsLonLat, (stationLonLat, stationKey) => {
        stationsXY[stationKey] = thisVue.xfmFromLonLat(stationLonLat)
      })
      return stationsXY
    },
    stationFeaturesByBand () {
      let thisVue = this
      let stationFeaturesByBand = {}
      _forEach(thisVue.stationsByBand, (bandStations, bandId) => {
        stationFeaturesByBand[bandId] = []
        _forEach(bandStations, (station) => {
          let stationCoords = thisVue.allStationsProjected[station.key]
          if (stationCoords) {
            stationFeaturesByBand[bandId].push({
              type: 'Feature',
              id: 'allStationsPoints' + station.key,
              geometry: {
                type: 'Point', //'Circle',
                coordinates: stationCoords,
                // radius: 5
              },
              properties: {
                type: 'station',
                call: station.call,
                grid: station.grid,
                band: station.band,
                key: station.key
              }
            })
          }
        })
      })
      return stationFeaturesByBand
    },
    allContacts () {
      /* returns
        {
          contactKey: {
            txStation: {},
            rxStation: {},
            band: nnn,
            twoWay: false
          },...
        }
      */
      let thisVue = this
      let contacts = {}
      let _processContact = (txStation, rxStation) => {
        // helper function
        let contactKey = txStation.key + rxStation.key
        if (!_has(contacts, contactKey)) {
          contacts[contactKey] = {
            txStation: txStation,
            rxStation: rxStation,
            band: txStation.band,
            twoWay: false
          }
        }
        let reverseContactKey = rxStation.key + txStation.key
        if (_has(contacts, reverseContactKey)) {
          contacts[reverseContactKey].twoWay = true
        }
      }
      _forEach(thisVue.stationList, (station1) => {
        if (thisVue.stationLocationValid(station1)) {
          _forEach(station1.txTo, (txToValue) => {
            let station2 = txToValue.station
            if (thisVue.stationLocationValid(station2)) {
              _processContact(station1, station2)
            }
          })
          _forEach(station1.rxFrom, (rxFromValue) => {
            let station2 = rxFromValue.station
            if (thisVue.stationLocationValid(station2)) {
              _processContact(station2, station1)
            }
          })
        }
      })
      console.log('allContacts: ', _size(contacts))
      return contacts
    },
    allContactsLonLat () {
      // returns { <contactKey>: [ [<ptLongitude>, <ptLatitude> ], ...], ... }
      let thisVue = this
      let contactsLonLat = {}
      _forEach(thisVue.allContacts, (contact, contactKey) => {
        contactsLonLat[contactKey] = thisVue.greatCircleWaypoints(
          contact.txStation.maidenhead.lon, contact.txStation.maidenhead.lat,
          contact.rxStation.maidenhead.lon, contact.rxStation.maidenhead.lat,
          thisVue.allStationsSegmentDegrees
        )
      })
      return contactsLonLat
    },
    allContactsProjected () {
      // returns { <contactKey>: [ [<ptProjectedX>, <ptProjectedY> ], ...], ... }
      let thisVue = this
      let contactsXY = {}
      _forEach(thisVue.allContactsLonLat, (contactLonLat, contactKey) => {
        contactsXY[contactKey] = thisVue.xfmLineFromLonLat(contactLonLat)
      })
      return contactsXY
    },
    allContactsProjectedByBand () {
      /* returns
          {
            <bandId>: {
              oneWayMappingMultiLine: [],
              twoWayMappingMultiLine: []
            }
          }
      */
      let thisVue = this
      let contactsByBand = {}
      _forEach(thisVue.allContactsProjected, (contactProjected, contactKey) => {
        if (contactProjected && contactProjected.length > 0) {
          let contact = thisVue.allContacts[contactKey]
          if (contact) {
            _defaults(
              contactsByBand,
              {
                [contact.band]: {
                  oneWayMappingMultiLine: [],
                  twoWayMappingMultiLine: []
                }
              }
            )
            if (contact.twoWay) {
              contactsByBand[contact.band].twoWayMappingMultiLine.push(contactProjected)
            } else {
              contactsByBand[contact.band].oneWayMappingMultiLine.push(contactProjected)
            }
          }
        }
      })
      return contactsByBand
    },
    grayLineMultiLine () {
      // the current grayLine, projected on current map projection
      let thisVue = this
      return thisVue.xfmMultiLineFromLonLat(thisVue.grayLineLonLatMultiLine)
    },
    strokeColorsForMap () {
      let thisVue = this
      return _assign({}, strokeColorsDefault, thisVue.strokeColors)
    },
    zIndexesForMap () {
      let thisVue = this
      return _assign({}, zIndexesDefault, thisVue.zIndexes)
    },
    stationsByBand () {
      // returns: { <bandId>: [<station>, ...] }
      let thisVue = this
      let stationsByBand = {}
      _forEach(thisVue.stationList, (station) => {
        _defaults(stationsByBand, {[station.band]: []})
        stationsByBand[station.band].push(station)
      })
      return stationsByBand
    }
  },
  watch: {
    momentNow () { // timer event
      let thisVue = this
      if (!_isNull(thisVue.momentNow)) {
        let recomputeGrayLine = false
        if (_isNull(thisVue.grayLineMoment)) {
          if (_isNull(thisVue.grayLineComputedMoment)) {
            recomputeGrayLine = true
          } else {
            let msSinceLastGraylineCompute = thisVue.momentNow - thisVue.grayLineComputedMoment
            if (msSinceLastGraylineCompute / 1000 > thisVue.grayLineUpdateSeconds) {
              recomputeGrayLine = true
            }
          }
        }
        if (recomputeGrayLine) {
          thisVue.updateGrayLine(thisVue.momentNow)
        }
      }
    },
    grayLineMoment (newValue, oldValue) {
      let thisVue = this
      if (newValue !== oldValue) {
        thisVue.updateGrayLine(newValue)
      }
    },
    selectedPathStation () {
      let thisVue = this
      if (thisVue.selectedPathStation) {
        thisVue.$emit('center-station-azimuthal', thisVue.selectedPathStation)
      }
    },
    useAzimuthalProjection (newValue, oldValue) {
      let thisVue = this
      if (newValue !== oldValue) {
        thisVue.updateProjection()
      }
    },
    azimuthalCenterStation (newValue, oldValue) {
      let thisVue = this
      if (thisVue.stationLocationValid(newValue)) {
        thisVue.center = [
          newValue.maidenhead.lon,
          newValue.maidenhead.lat
        ]
      }
      if (thisVue.useAzimuthalProjection) {
        if (newValue !== oldValue || (newValue && !newValue.sameStationAs(oldValue))) {
          thisVue.updateProjection()
        }
      }
    }
  },
  methods: {
    pointOnSurface: findPointOnSurface,
    updateGrayLine(newGrayLineMoment = null) {
      let thisVue = this
      if (_isNull(newGrayLineMoment)) {
        newGrayLineMoment = moment() // now
      }
      thisVue.grayLineDayNight.setTime(newGrayLineMoment.toDate())
      thisVue.grayLineLonLatMultiLine = [thisVue.grayLineDayNight.getCoordinates()]
      thisVue.grayLineComputedMoment = newGrayLineMoment
    },
    updateProjection() {
      let thisVue = this
      console.log('updateProjection')
      let oldProjectionName = thisVue.currentProjectionName
      let newProjectionName = thisVue.useAzimuthalProjection ? 'CUSTOM:AZIMUTHAL' : 'EPSG:4326'
      if (newProjectionName !== oldProjectionName) {
        let centerLonLat = thisVue.center
        if (!_isNull(thisVue.azimuthalCenterStation)) {
          centerLonLat = [thisVue.azimuthalCenterStation.maidenhead.lon, thisVue.azimuthalCenterStation.maidenhead.lat]
        } else if (oldProjectionName) {
          centerLonLat = thisVue.xfmToLonLat(thisVue.center, oldProjectionName)
          centerLonLat = [centerLonLat[0] || 0, centerLonLat[1] || 0]
        }
        // console.log('centerLonLat', centerLonLat[0], centerLonLat[1])
        if (thisVue.useAzimuthalProjection) {
          azimuthalIx = azimuthalIx + 1
          newProjectionName =  'CUSTOM:AZI' + azimuthalIx
          let projString = '+title=Lambert Azimuthal Equal-Area (' + azimuthalIx + ')' +
            ' +proj=laea  +ellps=WGS84' +
            ' +lat_0=' + centerLonLat[1] +
            ' +lon_0=' + centerLonLat[0] +
            ' +x_0=0 +y_0=0 +units=m +no_defs'
          // console.log(newProjectionName, projString)
          proj4.defs(newProjectionName, projString)
          registerProjection(proj4)
        }
        let centerProj = thisVue.xfmFromLonLat(centerLonLat, newProjectionName)
        // console.log('centerProj', centerProj[0], centerProj[1])
        centerProj = [centerProj[0] || 0, centerProj[1] || 0]
        // console.log('newProjectionName', newProjectionName)
        thisVue.center = centerProj
        thisVue.currentProjectionName = newProjectionName
        if (!thisVue.disableMap) {
          thisVue.refreshMap()
          // console.log('thisVue.center', thisVue.center)
          // console.log('thisVue.currentProjectionName', thisVue.currentProjectionName)
        }
      }
    },
    xfmFromLonLat(lonlat = [0, 0], projectionName = null) {
      let thisVue = this
      if (_isNull(projectionName)) {
        projectionName = thisVue.currentProjectionName
      }
      return fromLonLat(lonlat, projectionName)
    },
    xfmLineFromLonLat(lineLonlat = [], projectionName = null) {
      let thisVue = this
      return _map(lineLonlat, (lonLat) => {
        return thisVue.xfmFromLonLat(lonLat, projectionName)
      })
    },
    xfmMultiLineFromLonLat(multiLineLonlat = [], projectionName = null) {
      let thisVue = this
      return _map(multiLineLonlat, (lineLonlat) => {
        return thisVue.xfmLineFromLonLat(lineLonlat, projectionName)
      })
    },
    xfmToLonLat(xy = [0, 0], projectionName = null) {
      let thisVue = this
      if (_isNull(projectionName)) {
        projectionName = thisVue.currentProjectionName
      }
      return toLonLat(xy, projectionName)
    },
    filterForSelect(feature) { //, layer) {
      let featureId = feature.getId()
      let result = _startsWith(featureId, 'allStationsPoints')
      return(result)
    },
    refreshMap: _debounce(function () {
      let thisVue = this
      thisVue.doRefreshMap()
    }, 500),
    doRefreshMap (preRefreshFn) {
      let thisVue = this
      console.log('refreshing map')
      thisVue.disableMap = true
      thisVue.$nextTick(() => {
        if (preRefreshFn) {
          preRefreshFn(thisVue)
        }
        thisVue.disableMap = false
        console.log('map refresh complete')
      })
    },
    stationLocationValid (station) {
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
    stationFromFeature(feature) {
      let thisVue = this
      let simpleStation = new js8pathRoute.Station(feature.properties.call, feature.properties.grid, feature.properties.band)
      let station = _find(thisVue.stationList, simpleStation, (aStation) => {aStation.sameStationAs(simpleStation)})
      return station || simpleStation
    },
    stationsFromFeatures(features) {
      let thisVue = this
      return _map(features, (feature) => {return thisVue.stationFromFeature(feature)})
    },
    canAddStation(station) {
      let thisVue = this
      let canAdd = false
      if ((thisVue.pathStations.length > 0) && !thisVue.stationIsInPath(station)) {
        if (_has(thisVue.selectedPathStation.txTo, station.key)) {
          canAdd = true
        } else if (_has(thisVue.selectedPathStation.rxFrom, station.key)) {
          canAdd = true
        }
      }
      return canAdd
    },
    stationIsInPath(station) {
      let thisVue = this
      return !!_find(
        thisVue.pathStations,
        station,
        (pathStation) => {pathStation.sameStationAs(station)}
      )
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
    },
    computeContactPower(reports, nowSeconds) {
      let pwr = 0
      if (reports.length > 0) {
        if (!_isNull(reports[0].sNR)) {
          let strength = Math.min(Math.max(reports[0].sNR + 30, 0), 40) / 40.0
          let ageFactor = (3600 - Math.min(nowSeconds - moment(reports[0].timestamp).unix(), 3600)) / 3600.0
          pwr = strength * ageFactor
        }
      }
      return pwr
    },
    contactsForStation(rootStation, segmentDegrees = 1) {
      let thisVue = this
      let nowSeconds = moment().unix()
      let contacts = {}
      if (thisVue.stationLocationValid(rootStation)) {
        _forEach(rootStation.txTo, (txToItem) => {
          let otherStation = txToItem.station
          if (thisVue.stationLocationValid(otherStation)) {
            let waypoints = thisVue.greatCircleWaypoints(
              rootStation.maidenhead.lon, rootStation.maidenhead.lat,
              otherStation.maidenhead.lon, otherStation.maidenhead.lat,
              segmentDegrees
            )
            if (waypoints.length > 0) {
              let rxFromReports = _get(rootStation.rxFrom, [otherStation.key, 'reports'], [])
              contacts[otherStation.key] = {
                waypoints: waypoints,
                txToPwr: thisVue.computeContactPower(txToItem.reports, nowSeconds),
                rxFromPwr: thisVue.computeContactPower(rxFromReports, nowSeconds)
              }
            }
          }
        })
        _forEach(rootStation.rxFrom, (rxFromItem) => {
          let otherStation = rxFromItem.station
          if (!_has(contacts,otherStation.key)) {
            if (thisVue.stationLocationValid(otherStation)) {
              let waypoints = thisVue.greatCircleWaypoints(
                rootStation.maidenhead.lon, rootStation.maidenhead.lat,
                otherStation.maidenhead.lon, otherStation.maidenhead.lat,
                segmentDegrees
              )
              if (waypoints.length > 0) {
                contacts[otherStation.key] = {
                  waypoints: waypoints,
                  txToPwr: null,
                  rxFromPwr: thisVue.computeContactPower(rxFromItem.reports, nowSeconds)
                }
              }
            }
          }
        })
      }
      return _values(contacts)
    },
    txToStationsForStation(rootStation) {
      let thisVue = this
      let stations = []
      if (thisVue.stationLocationValid(rootStation)) {
        _forEach(rootStation.txTo, (txToItem) => {
          if (thisVue.stationLocationValid(txToItem.station)) {
            stations.push(txToItem.station)
          }
        })
      }
      return stations
    },
    rxFromStationsForStation(rootStation) {
      let thisVue = this
      let stations = []
      if (thisVue.stationLocationValid(rootStation)) {
        _forEach(rootStation.rxFrom, (rxFromItem) => {
          if (thisVue.stationLocationValid(rxFromItem.station)) {
            stations.push(rxFromItem.station)
          }
        })
      }
      return stations
    },
    pathGreatCircleMultiLineString(pathStations = [], segmentDegrees = 1) {
      let thisVue = this
      let gcmls = []
      let prevStation = null
      _forEach(pathStations, (currStation) => {
        if (thisVue.stationLocationValid(currStation)) {
          if (!_isNull(prevStation) && thisVue.stationLocationValid(prevStation)) {
            let waypoints = thisVue.greatCircleWaypoints(
              prevStation.maidenhead.lon, prevStation.maidenhead.lat,
              currStation.maidenhead.lon, currStation.maidenhead.lat,
              segmentDegrees
            )
            if (waypoints.length > 0) {
              gcmls.push(waypoints)
            }
          }
        }
        prevStation = currStation
      })
      return gcmls
    },
    greatCircleWaypoints(lon1, lat1, lon2, lat2, segmentDegrees = 1) {
      let wpLonLat = []
      if (lon2 !== lon1 || lat2 !== lat1) {
        let l = geod.InverseLine(
          lat1, lon1,
          lat2, lon2,
          Geodesic.LATITUDE | Geodesic.LONGITUDE
        )
        let n = Math.ceil(l.a13 / segmentDegrees)
        let da = l.a13 / n
        for (let i = 0; i <= n; ++i) {
          let a = da * i
          let r = l.ArcPosition(
            a,
            Geodesic.LATITUDE | Geodesic.LONGITUDE | Geodesic.LONG_UNROLL
          )
          wpLonLat.push([r.lon2, r.lat2])
        }
      }
      return wpLonLat
    }
  },
  created () {
    let thisVue = this
    thisVue.updateGrayLine(thisVue.grayLineMoment)
    thisVue.updateProjection()
  }
}
</script>

<style>
  .full-width {
    width: 100%;
  }
  .feature-popup {
    position: absolute;
    left: -2em;
    bottom: -1em;
    min-width: 20em;
    max-width: none;
  }
  div.selected-stations-popup {
    background-color: white;
    padding: 0.5em;
  }
  .selected-stations-popup table td,th {
    text-align: left;
    padding-left: 1em;
  }
</style>
