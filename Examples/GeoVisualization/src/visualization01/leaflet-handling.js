import * as L from 'leaflet'
import MiniMap from 'leaflet-minimap'
//
// Coordinate Reference System
//
const crsLookup = {
  simple: L.CRS.Simple,
  spherical: L.CRS.EPSG3857, // Spherical Mercator Projection
  equirectangular: L.CRS.EPSG4326,
  elliptical: L.CRS.EPSG3395
}
const defaultCRS = L.CRS.EPSG3857 // Spherical Mercator Projection
//
// Default Tile Server configuration
//
const defaultTilePattern = '{z}/{x}/{y}.png'
const defaultBottomLeftX = -180
const defaultBottomLeftY = -90
const defaultTopRightX = 180
const defaultTopRightY = 90
const defaultMinZoom = 1
const defaultMaxZoom = 22
const defaultTileWidth = 256
const defaultTileHeight = 256

/**
 * Create a Leaflet map
 * @param {string} element Identity of HTML element to add map to
 * @param {*} mapConfig Configuration for the map
 * @param {*} style Styling for the map
 * @param {*} eventHandlers event handler functions
 * @returns map
 */
export function createMap (elementId, mapConfig, style, eventHandlers) {
  const initialZoom = mapConfig.zoomLevel
  const center = [mapConfig.centreY, mapConfig.centreX]
  console.log('Map Centre: ' + JSON.stringify(center))
  const crs = crsLookup[mapConfig.coordRefSystem] || defaultCRS
  const map = L.map(
    elementId,
    {
      crs,
      zoom: initialZoom,
      zoomDelta: 0.25,
      zoomSnap: 0.25,
      center,
      attributionControl: false,
      zoomControl: false
    })

  if (style.zoomControl) {
    L.control.zoom({ position: style.controlPosition || 'topleft' }).addTo(map)
  }

  map.on('zoomend', eventHandlers.zoomend)
  map.on('moveend', eventHandlers.moveend)

  return map
}

/**
 * Create a Leaflet TileLayer
 * @param {*} tileServerConfig
 * @returns a new tile layer
 */
function createTileLayer (tileServerConfig) {
  //
  // Construct tile server template
  //
  const urlTemplate = tileServerConfig.tileServer + (tileServerConfig.tilePattern || defaultTilePattern)
  //
  // Map bounding coordinates
  //
  const boundsBottomLeftX = (tileServerConfig.boundsBottomLeftX !== undefined && tileServerConfig.boundsBottomLeftX !== null)
    ? tileServerConfig.boundsBottomLeftX
    : defaultBottomLeftX
  const boundsBottomLeftY = (tileServerConfig.boundsBottomLeftY !== undefined && tileServerConfig.boundsBottomLeftY !== null)
    ? tileServerConfig.boundsBottomLeftY
    : defaultBottomLeftY
  const boundsTopRightX = (tileServerConfig.boundsTopRightX !== undefined && tileServerConfig.boundsTopRightX !== null)
    ? tileServerConfig.boundsTopRightX
    : defaultTopRightX
  const boundsTopRightY = (tileServerConfig.boundsTopRightY !== undefined && tileServerConfig.boundsTopRightY !== null)
    ? tileServerConfig.boundsTopRightY
    : defaultTopRightY

  const bounds = [
    [boundsBottomLeftY, boundsBottomLeftX],
    [boundsTopRightY, boundsTopRightX]
  ]

  const minZoom = (tileServerConfig.minZoom !== null && tileServerConfig.minZoom !== undefined)
    ? tileServerConfig.minZoom
    : defaultMinZoom
  const maxZoom = (tileServerConfig.maxZoom !== null && tileServerConfig.maxZoom !== undefined)
    ? tileServerConfig.maxZoom
    : defaultMaxZoom
  const tileWidth = tileServerConfig.tileWidth || defaultTileWidth
  const tileHeight = tileServerConfig.tileHeight || defaultTileHeight

  const tileLayerOptions = {
    minZoom: minZoom <= maxZoom ? minZoom : maxZoom,
    maxZoom,
    maxNativeZoom: maxZoom,
    noWrap: true,
    bounds,
    maxBounds: bounds,
    maxBoundsViscosity: 1,
    tileSize: L.point(tileWidth, tileHeight)
  }
  //
  // Allow for tile server subdomains if defined in the style
  //
  if (tileServerConfig.tileServerSubDomains) {
    const subDomains = tileServerConfig.tileServerSubDomains.split(',')
    tileLayerOptions.subdomains = subDomains
  }
  return L.tileLayer(urlTemplate, tileLayerOptions)
}
/**
 * Create a Leaflet TileLayer and add it to the map
 * @param {*} map
 * @param {*} tileServerConfig
 * @param {*} style
 */
export function addTileLayer (map, tileServerConfig, style) {
  //
  // Construct tile server template
  //
  const tl = createTileLayer(tileServerConfig)
  tl.addTo(map)
  if (style.attribution) {
    const attributionPosition = style.attributionPosition || 'bottomright'
    L.control.attribution({ position: attributionPosition }).setPrefix('').addAttribution(style.attribution).addTo(map)
  }
}

/**
 * Add a Mini Map control to assist with navigation
 * @param {*} map
 * @param {*} tileServerConfig
 * @param {*} style
 */
export function addMiniMap (map, tileServerConfig, style) {
  //
  // Create a new tile layer for the MiniMap
  //
  const tl = createTileLayer(tileServerConfig)
  const options = {
    toggleDisplay: true,
    position: style.miniMapPosition || 'bottomright',
    width: style.miniMapWidth || 200,
    height: style.miniMapHeight || 200,
    zoomLevelOffset: style.miniMapZoomOffset || -5,
    // zoomLevelFixed: 1,
    minimized: style.miniMapMinimized
  }
  new MiniMap(tl, options).addTo(map)
}
/**
 * Set the map view to a specified zoom level and centre point
 * @param {*} map Leaflet Map
 * @param {number} zoomLevel Initial Map zoom level
 * @param {number} centreX X/Longitude of point to centre the Map
 * @param {number} centreY Y/Latitude of point to centre the Map
 */
export function setView (map, zoomLevel, centreX, centreY) {
  const initialZoom = zoomLevel
  const center = [centreY, centreX]
  map.setView(center, initialZoom)
}
