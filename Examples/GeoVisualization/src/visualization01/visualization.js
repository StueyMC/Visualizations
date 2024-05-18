//
//    Entry function declaration
//
import * as d3 from 'd3'
import {
  addGeomanControl,
  addSaveButton,
  // createGeoJsonFeatureGroup,
  getZoomLevel,
  setZoomLevel,
  // resetStyle,
  addSVG,
  removeSVG
} from '../common/leaflet-handling'
import {
  clickEvent,
  mouseoverEvent
} from '../common/event-handling'
import {
  updateStateFunction,
  getFeatureMovements,
  square
} from '../common/state-handling'
import {
  createMap,
  addTileLayer,
  addMiniMap,
  setView
} from './leaflet-handling'
/**
 * Operating Model visualisation entry function
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
  try {
    // console.log('Config: ' + JSON.stringify(config))
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
      zoomend: zoomendEvent,
      moveend: moveendEvent
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

    const featureOpacity = style.featureOpacity
    const featureHighlightOpacity = style.featureHighlightOpacity

    const movedFeatures = getFeatureMovements(stateValue, config.functions.errorOccurred)
    //
    // If in edit mode add edit and save buttons
    //
    if (editable) {
      addGeomanControl(map, style)
      const updateFunction = updateStateFunction(config.functions.updateState, featureCollections, packageVersion)
      addSaveButton(map, updateFunction, style.controlPosition || 'topleft')
    }

    config.functions.dataChanged = function (data) {
      superDataChanged(data)

      config.data = data

      const markers = getMarkers(data, movedFeatures)
      removeSVG(map) // remove SVG if one previously created
      addSVG(map)
      const svg = d3.select("#" + config.element).select("svg")
      addMarkers(map, markers, svg, featureOpacity)
      addInteractivity (config.functions, svg, featureOpacity, featureHighlightOpacity, editable)

      // const zoomLevel = getZoomLevel(map)
    }

    setZoomLevel(map, initialZoom + 0.25)
    setZoomLevel(map, initialZoom)
    config.functions.dataChanged(config.data)

    // turn on / off mouseover (geojson) layers at different levels of zoom:
    function zoomendEvent () {
      // layerHandler.zoomChanged(getZoomLevel(map))
    }
    function moveendEvent() {
      d3.selectAll("circle")
      .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
      .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })  
    }
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

function getMarkers(data, movedFeatures) {
  const markers = Array.isArray(data.markers) ? data.markers : []
  return markers.map(marker => { return {
    id: marker.id, name: marker.name,
    long: marker.longitude,
    lat: marker.latitude,
    outerSize: marker.size,
    outerColour: marker.outerColour,
    innerSize: marker.outerValue ? marker.size * marker.innerValue / marker.outerValue : marker.size,
    innerColour: marker.innerColour
  }})
}

function addMarkers(map, markers, svg, featureOpacity) {
  // Select the svg area and add outer circles:
  svg.selectAll("myCircles")
  .data(markers)
  .enter()
  .append("circle")
    .attr("cx", function(d) { return map.latLngToLayerPoint([d.lat, d.long]).x })
    .attr("cy", function(d) { return map.latLngToLayerPoint([d.lat, d.long]).y })
    .attr("r", function(d) { return d.outerSize })
    .style("fill", function(d) { return d.outerColour })
    .attr("stroke", function(d) { return d.outerColour })
    .attr("stroke-width", 3)
    .attr("fill-opacity", featureOpacity)
 //  Select the svg area and add inner circles:
 svg.selectAll("myCircles")
 .data(markers)
 .enter()
 .append("circle")
   .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
   .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
   .attr("r", function(d) { return d.innerSize })
   .style("fill", function(d) { return d.innerColour })
   .attr("stroke", function(d) { return d.innerColour })
   .attr("stroke-width", 3)
   .attr("fill-opacity", featureOpacity)
}

function addInteractivity (functions, svg, featureOpacity, featureHighlightOpacity, editable) {
  console.log("Add Interactivity")
  // svg //.selectAll("myCircles")
  // .on('mouseover', featureMouseover(functions.updateOutput, svg, featureHighlightOpacity))
  // .on('mouseout', featureMouseleave(svg, featureOpacity))
  // .on('click', featureClick(functions.performAction, editable))
  svg.attr("class", "leaflet-interactive")
  svg.attr("pointer-events", "auto;")
}

function featureMouseover (updateOutput, svg, featureHighlightOpacity) {
  return function (event, d) {
    console.log("Mouseover: " + JSON.stringify(d))
    svg.selectAll("myCircles").filter(datum => datum.id === d.id )
    .style('opacity', featureHighlightOpacity)
    // d3.select('#links').selectAll('path').style('opacity', l => (l.source.id === d.id) || (l.target.id === d.id) ? featureHighlightOpacity : lowlightLinkOpacity)
    updateOutput('hoverNode', d.id)
  }
}

function featureMouseleave (svg, featureOpacity) {
  return function (d) {
    svg.selectAll("myCircles").filter(datum => datum.id === d.id )
    .style('opacity', featureOpacity)
  }
}

function featureClick (performAction, editable) {
  return function (d) {
    if (!editable) {
      performAction('Feature Click', d.id, {})
    }
  }
}

