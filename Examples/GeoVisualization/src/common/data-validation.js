/**
 * Updates feature overlay ranges with valid values
 * @param {Array} features Array of feature data passed in from MooD
 * @param {*} numLayers Number of overlay layers
 */
export function validateFeatures (features, numLayers) {
  features.forEach(feature => {
    if (!feature.minLayer) {
      feature.minLayer = 1

      if (!feature.maxLayer) {
        feature.maxLayer = numLayers
      }
    } else {
      if (!feature.maxLayer) {
        feature.maxLayer = feature.minLayer
      }
    }
  })
}
