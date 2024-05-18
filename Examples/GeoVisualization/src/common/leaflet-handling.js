import * as L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'

const defaultMarkerSize = 40 // default size of marker icons in pixels
let svg = undefined

/**
 * Get the zoom level (z coordinate) currently selected on the map
 * @param {*} map
 * @returns zoom level
 */
export function getZoomLevel (map) {
  return map.getZoom()
}
/**
 * Set the zoom level of the map
 * @param {*} map Leaflet Map object
 * @param {number} z z coordinate to set the map to
 */
export function setZoomLevel (map, zoom) {
  map.setZoom(zoom)
}
/**
 * Add an SVG element to the map
 * @param {*} map 
 */
export function addSVG(map) {
  svg = L.svg().addTo(map)
}
/**
 * Remove the SVG element from the map
 * No action is taken if there is no SVG on the map
 * @param {*} map 
 */
export function removeSVG(map) {
  if (svg) {
    svg.removeFrom(map)
    svg = undefined
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
