import {
  addLayer,
  removeLayer
} from '../common/leaflet-handling'

export class LayerHandler {
  constructor (numLayers, layerConfig, map, initialZoom, geoJsonFeatureGroups) {
    const maxLayerIndex = numLayers - 1
    const layerData = layerConfig.map(layer => ({
      startZoom: layer.startZoom,
      endZoom: layer.endZoom
    }))
    const currentZoom = initialZoom

    /**
     * Convert map zoom level into a zero based index for the overlay layer
     * @param {} zoom The map zoom level
     * @returns zero based index for the overlay layer
     */
    this.index = function (zoom) {
      const zoomInt = Math.floor(zoom + 0.5)
      let layerIndex = -1
      for (let i = 0; i <= maxLayerIndex && layerIndex === -1; i++) {
        if (zoomInt >= layerData[i].startZoom && zoomInt <= layerData[i].endZoom) {
          layerIndex = i
        }
      }
      return layerIndex
    }

    let currentLayerIndex = this.index(currentZoom)
    let currentGeoJsonLayer = null
    if (currentLayerIndex !== -1) {
      addLayerToMap(currentLayerIndex)
    }

    this.zoomChanged = function (zoom) {
      const displayLayerIndex = this.index(zoom)
      if (displayLayerIndex !== currentLayerIndex) {
        removeLayer(map, currentGeoJsonLayer)
        if (displayLayerIndex !== -1) {
          addLayerToMap(displayLayerIndex)
        } else {
          currentLayerIndex = -1
          currentGeoJsonLayer = null
        }
      }
    }

    this.clearLayer = function () {
      removeLayer(map, currentGeoJsonLayer)
      currentGeoJsonLayer = null
      currentLayerIndex = -1
    }

    function addLayerToMap (layerIndex) {
      currentLayerIndex = layerIndex
      currentGeoJsonLayer = geoJsonFeatureGroups[layerIndex]
      if (currentGeoJsonLayer) {
        addLayer(map, currentGeoJsonLayer)
      }
    }
  }
}
