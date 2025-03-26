//
//    Entry function declaration
//
// For suggestions on how to add interactive D3 elements
// see https://stackoverflow.com/questions/62065912/leaflet-overlaid-with-d3-chart-need-chart-to-remain-in-one-place
//
import {
  addGeomanControl,
  addSaveButton,
  createGeoJsonFeatureGroup,
  getZoomLevel,
  setZoomLevel,
  resetStyle
  // addSVG,
  // removeSVG
} from '../common/leaflet-handling'
import {
  clickEvent,
  mouseoverEvent
} from '../common/event-handling'
import * as LH from '../common/layer-handler'
import {
  updateStateFunction,
  getFeatureMovements
  // square
} from '../common/state-handling'
import {
  createMap,
  addTileLayer,
  addMiniMap,
  setView
} from './leaflet-handling'
import {
  validateFeatures
} from '../common/data-validation'
import * as GT from '../common/geometry-types'

/**
 * Operating Model visualisation entry function
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
  try {
    // console.log('Config: ' + JSON.stringify(config))
    const maxLayers = 10
    const featureCollections = []
    //
    // Retrieve configuration
    //
    const style = config.style
    const superDataChanged = config.functions.dataChanged
    const superInputChanged = config.functions.inputChanged
    config.functions.inputChanged = inputChanged
    //
    // Get state data if present
    // State data was introduced in MooD Customer Release 6 (16.082)
    //
    const editable = config.state && config.state.editable
    const stateValue = config.state && config.state.value
    //
    // Get package version number, used to mark state information
    //
    const packageVersion = config.version

    const el = document.getElementById(config.element)
    el.style.background = style.background

    const mapEventHandlers = {
      zoomend: zoomendEvent
    }

    const initialZoom = config.inputs.zoomLevel || 1
    config.inputs.zoomLevel = initialZoom
    const centreX = config.inputs.centreX || 0
    config.inputs.centreX = centreX
    const centreY = config.inputs.centreY || 0
    config.inputs.centreY = centreY
    const map = createMap(config.element, config.inputs, style, mapEventHandlers)
    addTileLayer(map, config.inputs, style)
    if (style.miniMapControl) {
      addMiniMap(map, config.inputs, style)
    }
    const numLayers = Math.min(style.numLayers, maxLayers)

    const movedFeatures = getFeatureMovements(stateValue, config.functions.errorOccurred)
    //
    // If in edit mode add edit and save buttons
    //
    if (editable) {
      addGeomanControl(map, style)
      const updateFunction = updateStateFunction(config.functions.updateState, featureCollections, packageVersion)
      addSaveButton(map, updateFunction, style.controlPosition || 'topleft')
    }

    const featureEventHandlers = {
      mouseover: mouseoverEvent(config.functions.updateOutput, style.layers),
      mouseout: resetStyle,
      click: clickEvent(config.functions.performAction, editable),
      editable
    }
    const geoJsonFeatureGroups = []
    const layerHandler = new LH.LayerHandler(numLayers, style.layers, map, initialZoom, geoJsonFeatureGroups)

    config.functions.dataChanged = function (data) {
      superDataChanged(data)

      config.data = data

      createFeatures(featureCollections, data, movedFeatures, style.layers, numLayers)

      featureCollections.forEach((collection, index) => {
        geoJsonFeatureGroups[index] = createGeoJsonFeatureGroup(collection, style.layers, featureEventHandlers)
      })

      const zoomLevel = getZoomLevel(map)
      layerHandler.clearLayer()
      layerHandler.zoomChanged(zoomLevel)

      // const markers = getMarkers(data, movedFeatures)
      // removeSVG(map) // remove SVG if one previously created
      // addSVG(map)
      // const svg = d3.select("#" + config.element).select("svg")
      // const g = svg.append("g")
      // addMarkers(map, markers, g, featureOpacity)
      // addInteractivity (config.functions, svg, featureOpacity, featureHighlightOpacity, editable)
    }

    setZoomLevel(map, initialZoom + 0.25)
    setZoomLevel(map, initialZoom)
    config.functions.dataChanged(config.data)

    // turn on / off mouseover (geojson) layers at different levels of zoom:
    function zoomendEvent () {
      layerHandler.zoomChanged(getZoomLevel(map))
    }
    // function moveendEvent() {
    //   d3.selectAll("circle")
    //   .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
    //   .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
    // }
    /**
     * Handle change to input.
     * React to change of Zoom, and centre X/Long, Y/Lat but note they are updated one at a time so may jump around a bit
     * Ignore changes to Tile Server configuration
     * @param {String} name name of input
     * @param {*} value number or string
     */
    function inputChanged (name, value) {
      superInputChanged(name, value)
      console.log('name: ' + name + ', value: ' + value)

      if (name === 'zoomLevel') {
        config.inputs.zoomLevel = value
        setZoomLevel(map, value)
      }

      if (name === 'centreX') {
        config.inputs.centreX = value
        setView(map, config.inputs.zoomLevel, config.inputs.centreX, config.inputs.centreY)
      }

      if (name === 'centreY') {
        config.inputs.centreY = value
        setView(map, config.inputs.zoomLevel, config.inputs.centreX, config.inputs.centreY)
      }

      return true
    }
  } catch (e) {
    const errorMessage = e.name + ': ' + e.message
    console.error(errorMessage)
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }
}

/**
* Return an array of feature collections containing the features on the map
* Features are positioned and sized as defined in the layer data, overridden by
* coordinates in the state information
* Each element of the array contains all the features in a layer on the map
* @param {Array} featureCollections Array to store feature collections containing the features on the map
* @param {Object} data Layer data
* @param {Object} movedFeatures Object detailing coordinates of features moved in edit mode
* @param {Array} layerConfig Configuration of overlay layers (features)
* @param {int} numLayers Number of layers on the map
* @returns array of feature collections containing the features on the map
*/
function createFeatures (featureCollections, data, movedFeatures, layerConfig, numLayers) {
  /**
 * Return an array of feature collections containing the features on the map
 * Features are positioned and sized as defined in the layer data, overridden by
 * coordinates in the state information
 * Each element of the array contains all the features in a layer on the map
 * @param {Object} data Layer data
 * @param {Object} movedFeatures Object detailing coordinates of features moved in edit mode
 * @param {int} numLayers Number of layers on the map
 * @returns array of feature collections containing the features on the map
 */
  // function createFeatures (data, movedFeatures, numLayers) {
  /**
   * Build a GeoJson feature in the format for a GeoJson Feature Collection element
   * @param {*} feature Feature data passed from MooD
   * @param {*} layerIndex The zero based index of the layer over the map
   * @param {*} geometryMap Lookup up object for feature data
   * @returns The feature object
   */
  function buildFeature (feature, layerIndex, geometryMap) {
    const geometryData = geometryMap[feature.id]
    return {
      type: 'Feature',
      geometry: geometryData.geometry,
      properties: {
        id: feature.id,
        name: feature.name,
        icon: feature.icon,
        size: feature.size,
        colour: feature.borderColour !== undefined && feature.borderColour !== null ? feature.borderColour : layerConfig[layerIndex].featureBorderColour,
        fillColour: feature.colour !== undefined && feature.colour !== null ? feature.colour : layerConfig[layerIndex].featureColour,
        displayName: feature.displayName !== undefined && feature.displayName !== null ? feature.displayName : layerConfig[layerIndex].displayFeatureName,
        width: feature.featureWeight || layerConfig[layerIndex].featureWeight,
        opacity: layerConfig[layerIndex].featureBorderOpacity,
        fillOpacity: layerConfig[layerIndex].featureOpacity,
        highlightOpacity: layerConfig[layerIndex].featureHighlightOpacity,
        highlightFillOpacity: layerConfig[layerIndex].featureHighlightOpacity,
        layerIndex,
        state: geometryData.state
      }
    }
  }
  // Handle un-configured data from MooD
  const points = Array.isArray(data.markers) ? data.markers : []
  validateFeatures(points, numLayers)
  //
  // Build marker geometries
  //
  const pointMap = {}
  points.forEach(feature => {
    const editedFeature = movedFeatures[feature.id]
    const geometry = {
      type: GT.geoJsonPointName,
      pointType: 'circle',
      coordinates: editedFeature ? editedFeature.coordinates : [feature.longitude, feature.latitude]
    }
    const state = {
      moved: !!editedFeature
    }
    pointMap[feature.id] = {
      geometry,
      state,
      styleURL: feature.styleURL,
      minLayer: feature.minLayer,
      maxLayer: feature.maxLayer
    }
  })

  for (let i = 0; i < numLayers; i++) {
    featureCollections[i] = {}
    featureCollections[i].type = 'FeatureCollection'
    //
    // Build outer markerfeatures that are configured to appear in the layer
    //
    const outerMarkerFeatures = points
      .filter(feature => feature.minLayer <= (i + 1) && feature.maxLayer >= (i + 1))
      .map(feature => {
        return {
          id: feature.id,
          name: feature.name,
          icon: undefined,
          size: feature.size,
          borderColour: feature.outerBorderColour,
          colour: feature.outerColour,
          displayName: feature.displayName,
          featureWeight: feature.outerFeatureWeight
        }
      })
      .map(feature => buildFeature(feature, i, pointMap))
    //
    // Build inner markerfeatures that are configured to appear in the layer
    //
    const innerMarkerFeatures = points
      .filter(feature => feature.minLayer <= (i + 1) && feature.maxLayer >= (i + 1))
      .map(feature => {
        return {
          id: feature.id,
          name: feature.name,
          icon: undefined,
          size: feature.outerValue ? feature.size * feature.innerValue / feature.outerValue : 0,
          borderColour: feature.innerBorderColour,
          colour: feature.innerColour,
          displayName: feature.displayName,
          featureWeight: feature.innerFeatureWeight
        }
      })
      .map(feature => buildFeature(feature, i, pointMap))

    featureCollections[i].features =
      outerMarkerFeatures
        .concat(innerMarkerFeatures)
  }
  // console.log("Features: " + JSON.stringify(featureCollections))
  return featureCollections
}
