## js8path-vue mapping notes


### VueLayers OpenLayers mapping in Vue.js

 - VueLayers home: https://vuelayers.github.io/#/
 - Docs: https://vuelayers.github.io/#/?id=vuelayers
 - Code: https://github.com/ghettovoice/vuelayers/
 - Demo: https://vuelayers.github.io/demo/
   - Demo code: https://github.com/ghettovoice/vuelayers-demo
 - Adding geojson pre-computed features added to vector layer
     - https://github.com/ghettovoice/vuelayers/issues/59
    - https://github.com/ghettovoice/vuelayers-demo/blob/master/src/App.vue#L497
    - https://vuejs.org/v2/guide/components.html#Dynamic-Components
    - https://vuejs.org/v2/guide/components-dynamic-async.html  

### GeographicLib Geodesic utilities

 - GeographicLib npm home: https://www.npmjs.com/package/geographiclib
 - computing great circle waypoints:
   - from https://geographiclib.sourceforge.io/html/js/tutorial-3-examples.html#waypoints

 
```
import GeographicLib from 'geographiclib'
let  Geodesic = GeographicLib.Geodesic
// let DMS = GeographicLib.DMS
let geod = Geodesic.WGS84
import { findPointOnSurface } from 'vuelayers/lib/ol-ext'
```

### Proj4js map projection code

 - proj4js home: http://proj4js.org/
 - hints on azimuthal projection:
    - https://stackoverflow.com/questions/44684133/web-map-with-opellayers-polar-projection
    - https://openlayers.org/en/latest/doc/tutorials/raster-reprojection.html
    - https://gis.stackexchange.com/questions/118125/proj4js-is-this-correct-implementation-of-azimuthal-equidistant-relative-to-an

### Proj4js usage examples

```
import {register as registerProjection} from 'ol/proj/proj4'
import {
  // get as getProjection,
  fromLonLat,
  toLonLat
} from 'ol/proj';
import proj4 from 'proj4'
```

define a projection individually

`proj4.defs('CUSTOM:10001', '+proj=aeqd  +R=6371000 +lat_0=34 +lon_0=-81 +units=degrees')`

define a list of projections

```
  var proj4ProjectionList = [
    ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
    ['CUSTOM:10403', '+title=Lambert Azimuthal Equal-Area (Arbitrary)     +proj=laea  +ellps=WGS84              +lat_0=39.2 +lon_0=-76.5 +x_0=0 +y_0=0 +units=m       +no_defs']
  ]
  proj4.defs(proj4ProjectionList)
```

register defined projections with openlayers (and viewlayers)

`registerProjection(proj4)`




### ol-ext extensions for OpenLayers (not the sane as vuelayers ol-ext)

 - ol-ext home: https://viglino.github.io/ol-ext/ 
   - github code: https://github.com/Viglino/ol-ext
 - DayNight grayline mapping
   - https://github.com/Viglino/ol-ext/issues/33
   - https://github.com/Viglino/ol-ext/blob/master/examples/layer/map.daynight.html
   - import DayNight from 'ol-ext/source/DayNight'
 
### internet map sources

 - https://www.naturalearthdata.com/
  - vector countries: https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson
  - vector lakes: https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_lakes.geojson
  - other free vector and raster data
  
  