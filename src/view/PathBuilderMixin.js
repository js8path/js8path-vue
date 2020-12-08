import _clone from 'lodash/clone'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import _isNull from 'lodash/isNull'
import _last from 'lodash/last'
import _reverse from 'lodash/reverse'
import _slice from 'lodash/slice'

import {mapActions, mapMutations, mapState} from 'vuex'
import _forEach from 'lodash/findIndex'
import _has from 'lodash/findIndex'
import _map from 'lodash/map'
import js8pathRoute from '@js8path/js8path-route'

export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapState({
      pathBuilderStations: state => state.pathBuilderStations,
      pathBuilderSelectedStation: state => state.pathBuilderSelectedStation
    }),
    selectedPathStations () {
      let thisVue = this
      let selectedPathStations = []
      if (thisVue.pathBuilderSelectedStation) {
        let selectedStationIndex = _findIndex(thisVue.pathBuilderStations, {key: thisVue.pathBuilderSelectedStation.key})
        selectedPathStations = _slice(thisVue.pathBuilderStations, 0, selectedStationIndex + 1)
      }
      return selectedPathStations
    },
    linkedStations () {
      let thisVue = this
      return _map(thisVue.pathBuilderStations, function (station, ix, pathBuilderStations) {
        return new js8pathRoute.LinkedStation(
          station,
          (ix > 0) ? pathBuilderStations[ix-1] : null,
          (ix +1 < pathBuilderStations.length) ? pathBuilderStations[ix+1] : null
        )
      })
    }
  },
  watch: {
  },
  methods: {
    ...mapMutations({
    }),
    ...mapActions({
      updatePathBuilderStations: 'updatePathBuilderStations',
      updatePathBuilderSelectedStation: 'updatePathBuilderSelectedStation'
    }),
    selectStation (stationToSelect) {
      let thisVue = this
      thisVue.updatePathBuilderSelectedStation(stationToSelect)
    },
    setRootStation (station) {
      let thisVue = this
      let newPathStations = null
      if (thisVue.pathBuilderStations.length === 0) {
        newPathStations = [station]
      } else {
        let pathIx = _findIndex(thisVue.pathBuilderStations, {key: station.key})
        if (pathIx < 0) {
          newPathStations = [station]
        } else if (pathIx > 0) {
          newPathStations = _slice(thisVue.pathBuilderStations, pathIx)
        }
      }
      if (!_isNull(newPathStations)) {
        thisVue.updatePathBuilderStations(newPathStations)
      }
    },
    rootStationSelected (selectedStation = null) {
      let thisVue = this
      if (_isNull(selectedStation)) {
        thisVue.resetLinkedStations()
      } else {
        if (
          thisVue.pathBuilderStations.length === 0 ||
          !selectedStation.sameStationAs(thisVue.pathBuilderStations[0])
        ) {
          thisVue.updatePathBuilderStations([selectedStation])
        }
      }
    },
    addLinkedStation (station) {
      let thisVue = this
      thisVue.linkStations (_last(thisVue.selectedPathStations), station)
    },
    addStationToPath (station) {
      let thisVue = this
      if (thisVue.pathBuilderStations.length === 0) {
        thisVue.setRootStation(station)
      } else if (!_find(thisVue.pathBuilderStations, {key: station.key})) {
        thisVue.linkStations (_last(thisVue.pathBuilderStations), station)
      }
    },
    linkStations (station1, station2) {
      let thisVue = this
      let linkIndex = _findIndex(thisVue.pathBuilderStations, {key: station1.key})
      if (linkIndex >= 0) {
        let newLocalPathStations = _slice(thisVue.pathBuilderStations, 0, linkIndex + 1)
        newLocalPathStations.push(station2)
        thisVue.updatePathBuilderStations(newLocalPathStations).then(() => {
            thisVue.updatePathBuilderSelectedStation(station2)
        })
      }
    },
    unlinkStation (stationToUnlink) {
      let thisVue = this
      let linkIndex = _findIndex(thisVue.pathBuilderStations, {key: stationToUnlink.key})
      if (linkIndex >= 0) {
        let newLocalPathStations = _slice(thisVue.pathBuilderStations, 0, linkIndex)
        thisVue.updatePathBuilderStations(newLocalPathStations).then(() => {
          let selectedStation = (newLocalPathStations.length === 0) ? null : newLocalPathStations[newLocalPathStations.length - 1]
          thisVue.updatePathBuilderSelectedStation(selectedStation)
        })
      }
    },
    clearPath () {
      let thisVue = this
      if (thisVue.pathBuilderStations.length > 0) {
        thisVue.unlinkStation(thisVue.pathBuilderStations[0])
      }
    },
    reversePath () {
      let thisVue = this
      if (thisVue.pathBuilderStations.length > 1) {
        let reversedPathStations = _reverse(_clone(thisVue.pathBuilderStations))
        thisVue.updatePathBuilderStations(reversedPathStations) // .then(() => {}
      }
    },
    resetLinkedStations () {
      let thisVue = this
      thisVue.updatePathBuilderStations([])
    },
    updateLinkedStations () {
      // update pathStations per router changes
      // FixMe: doesn't seem to remove expired stations immediately after load
      //console.time('updateLinkedStations')
      let thisVue = this
      let newPathStations = []
      let ignoreRest = false
      let currentLinkedStations = thisVue.linkedStations
      let currentRouter = thisVue.stationRouter
      _forEach(currentLinkedStations, (linkedStation, pathIx) => {
        if (!ignoreRest) {
          let keepThis = true
          let routerStation = currentRouter.stations[linkedStation.key]
          if (!routerStation) {
            // station no longer in router
            keepThis = false
          } else if (pathIx > 0) {
            let prevStation = currentLinkedStations[pathIx - 1]
            if (!_has(routerStation.txTo, prevStation.key)) {
              if (!_has(routerStation.rxFrom, prevStation.key)) {
                // station is no longer linked to previous station
                keepThis = false
              }
            }
          }
          if (keepThis) {
            newPathStations.push(linkedStation.station)
          } else {
            ignoreRest = true
          }
        }
      })
      thisVue.updatePathBuilderStations(newPathStations).finally(
        //console.timeEnd('updateLinkedStations')
      )
    }
  }
}
