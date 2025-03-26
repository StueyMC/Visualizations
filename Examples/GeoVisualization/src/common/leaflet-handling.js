import * as L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import * as GT from '../common/geometry-types'

/**
 * Get the zoom level (z coordinate) currently selected on the map
 * @param {*} map
 * @returns zoom level
 */
export function getZoomLevel (map) {
  // console.log("Get Zoom: " + map.getZoom())
  return map.getZoom()
}
/**
 * Set the zoom level of the map
 * @param {*} map Leaflet Map object
 * @param {number} z z coordinate to set the map to
 */
export function setZoomLevel (map, zoom) {
  map.setZoom(zoom)
  // console.log("Get Zoom: " + map.getZoom())
}
/**
 * Add a layer (GeoJson feature group) to the map
 * @param {*} map
 * @param {*} layer
 */
export function addLayer (map, layer) {
  layer.addTo(map)
}

/**
 * Remove a layer (GeoJson feature group) from the map
 * @param {*} map
 * @param {*} layer
 */
export function removeLayer (map, layer) {
  if (layer) {
    map.removeLayer(layer)
  }
}
/**
 * Create a Leaflet-Geoman control and add to the map
 * @param {*} map The map to add the control to
 * @param {*} style Configuration for the control
 */
export function addGeomanControl (map, style) {
  // add Leaflet-Geoman controls with some options to the map
  map.pm.addControls({
    position: style.controlPosition || 'topleft',
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawPolygon: false,
    drawCircle: false,
    drawText: false,
    cutPolygon: false,
    removalMode: false,
    rotateMode: false
  })
  // Limit the number of markers when resizing features in edit mode
  if (style.limitMarkersToCount) {
    map.pm.setGlobalOptions({
      limitMarkersToCount: style.limitMarkersToCount
    })
  }
}

/**
 * Add a save button control used to trigger saving of dragged feature positions
 * @param {*} map The map to add the control to
 * @param {*} saveFunction Function to call on button click
 * @param {string} position name of position to place button, e.g. topleft
 */
export function addSaveButton (map, saveFunction, position) {
  L.Control.Save = L.Control.extend({
    _container: L.DomUtil.create('div', 'leaflet-bar leaflet-control'),
    onAdd: function (map) {
      const a = L.DomUtil.create('a', 'leaflet-control-save', this._container)
      a.ariaLabel = 'Save'
      a.title = 'Save'
      a.role = 'button'
      a.href = '#'

      L.DomEvent.on(this._container, 'click', this._click, this)

      return this._container
    },

    onRemove: function (map) {
      L.DomEvent.off(this._container, 'click', this._click, this)
    },

    _click: function () {
      saveFunction()
    }

  })

  L.control.save = function (opts) {
    return new L.Control.Save(opts)
  }

  L.control.save({
    position
    // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  }).addTo(map)
}
let featureStyle

function resetFeatureStyle (feature, layer) {
  if (feature.geometry.type !== GT.geoJsonPointName || feature.geometry.pointType !== 'icon') {
    // reset style for non-point features
    layer.setStyle(featureStyle(feature))
  } else {
    // reset style for point (marker) features
    layer.setOpacity(feature.properties.fillOpacity)
  }
}

/**
 * Set the style to highlight a feature. Does not apply to Points / L.Markers
 * @param {*} e event object
 * @param {*} layerConfig Configuration of each of the layers including highlighted feature opacity
 */
export function highlightFeature (e, layerConfig) {
  const layer = e.target
  const feature = e.target.feature
  const properties = feature.properties
  if (feature.geometry.type !== GT.geoJsonPointName || feature.geometry.pointType !== 'icon') {
    // Set style for non-point features
    layer.setStyle({
      fillOpacity: properties.highlightFillOpacity || layerConfig[properties.layerIndex].featureHighlightOpacity,
      opacity: properties.highlightOpacity || layerConfig[properties.layerIndex].featureHighlightOpacity
    })
  } else {
    // Set style for point (marker) features
    layer.setOpacity(properties.highlightFillOpacity)
  }
}

/**
 * Reset the style of the feature that is the target of an event
 * @param {Event} e Event
 */
export function resetStyle (e) {
  const feature = e.target.feature
  const layer = e.target
  resetFeatureStyle(feature, layer)
}
/**
 * Create a GeoJson object containing a collection of features
 * @param {*} featureCollection GeoJSON format feature collection
 * @param {Array} layerConfig Configuration of overlay layers (features)
 * @param {*} eventHandlers Event handler functions
 * @returns GeoJson object
 */
export function createGeoJsonFeatureGroup (featureCollection, layerConfig, eventHandlers) {
  featureStyle = function (feature) {
    const props = feature.properties
    const layerStyle = layerConfig[props.layerIndex]
    return {
      color: props.colour,
      fillColor: props.fillColour,
      weight: props.width || layerStyle.featureWeight,
      opacity: props.opacity || layerStyle.featureBorderOpacity,
      fillOpacity: props.fillOpacity || layerStyle.featureOpacity
    }
  }

  /**
   * Create a marker to represent the point as an overlay on the map
   * @param {Object} point Point feature data
   * @param {L.LatLng} latLng Position of marker in Latitude, Longitude
   * @returns L.Marker object
   */
  function pointToLayer (point, latLng) {
    // new L.circle(coord, 100, {color : '#006080', fillColor : '#99ccff', fillOpacity : 0, opacity : 0, weight : 1});
    // let myIcon
    // if (point.properties.icon) {
    //   // If Icon URL defined then create a marker with the Icon
    //   const size = point.properties.size || defaultMarkerSize
    //   const iconSize = L.point([size, size])
    //   const iconAnchor = L.point([size / 2, size / 2])
    //   myIcon = L.icon({ iconUrl: point.properties.icon, iconSize, iconAnchor })
    // } else {
    //   // If no Icon is defined then create a marker with the default image
    //   const height = point.properties.size || 41
    //   const width = point.properties.size ? point.properties.size * (25 / 41) : 25
    //   const size = L.point([width, height])
    //   const anchor = L.point([width / 2, height])
    //   myIcon = L.divIcon({ className: 'leaflet-default-marker', iconSize: size, iconAnchor: anchor })
    // }
    const markerOptions = {
      radius: point.properties.size,
      color: point.properties.colour,
      opacity: point.properties.opacity,
      weight: point.properties.width,
      fillColor: point.properties.fillColour,
      fillOpacity: point.properties.fillOpacity
    }
    // console.log("PointToLayer: " + JSON.stringify(markerOptions))
    const marker = L.circle(latLng, markerOptions) // L.marker(latLng, { icon: myIcon })
    // Set initial, unhighlighted opacity of the marker
    if (point.geometry.pointType === 'icon') {
      marker.setOpacity(point.properties.fillOpacity)
    }
    return marker
  }

  function editComplete (e) {
    // console.log(e.shape)
    const feature = e.layer.feature
    feature.properties.state.moved = true // mark feature as having been moved / edited
    if (feature.geometry.type === GT.geoJsonPolygonName) {
      // Handle 2 dimensional array of coordinates for Polygon
      feature.geometry.coordinates =
        e.layer.getLatLngs().map(array => array.map(latLng => [latLng.lng, latLng.lat]))
    } else if (feature.geometry.type === GT.geoJsonPointName) {
      // Handle point L.marker
      const latLng = e.target.getLatLng()
      feature.geometry.coordinates = [latLng.lng, latLng.lat]
    } else {
      // Handle 1 dimensional array of coordinates for other supported geometries
      feature.geometry.coordinates =
        e.layer.getLatLngs().map(latLng => [latLng.lng, latLng.lat])
    }
  }

  function onEachGeoJsonFeature (feature, layer) {
    const options = {
      mouseover: eventHandlers.mouseover,
      mouseout: eventHandlers.mouseout,
      click: eventHandlers.click
    }
    if (eventHandlers.editable) {
      options['pm:edit'] = editComplete
    }
    layer.on(options)
    if (feature.properties.displayName) {
      layer.bindTooltip(
        feature.properties.name,
        {
          permanent: false,
          direction: 'auto',
          sticky: true,
          opacity: 1.0
        }
      )
    }
  }

  return L.geoJson(featureCollection, {
    pointToLayer,
    style: featureStyle,
    onEachFeature: onEachGeoJsonFeature
  })
}
