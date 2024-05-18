/**
 * Creates a function to update state in MooD
 * @param {function} updateState Function to call to save updated state back to MooD
 * @param {*} featureCollections Collection of features, some or all of which have been edited
 * @param {string} packageVersion The current version number of the custom visualisation
 * @returns Function to save updated state back to MooD
 */
export function updateStateFunction (updateState, featureCollections, packageVersion) {
  return function () {
    const newState = {
      packageVersion,
      features: {}
    }
    featureCollections.forEach(featureCollection => {
      featureCollection.features
        .filter(feature => feature.properties.state.moved)
        .forEach(feature => {
          newState.features[feature.properties.id] = {
            name: feature.properties.name,
            coordinates: feature.geometry.coordinates
          }
        })
    })
    updateState(JSON.stringify(newState))
  }
}
/**
 * Process any state data detailing repositioning of features
 * NOTE: prior to MooD Customer Release 6 (16.082) there is no state information
 * @param {*} stateValue Object converted to string detailing coordinates of features moved in edit mode, maybe undefined
 * @returns Object detailing updated coordinates of features
 */
export function getFeatureMovements (stateValue, logError) {
  let features = {}
  let state
  if (stateValue) {
    try {
      state = JSON.parse(stateValue)
    } catch (e) {
      const errorMessage = 'Error parsing state - ' + e.name + ': ' + e.message
      console.error(errorMessage)
      logError(errorMessage)
    }
    //
    // Ignore package version in the state for now
    // state.packageVersion
    //
    if (state.features) {
      features = state.features
    }
  }
  return features
}

export function square (centre, size) {
  const coords = []
  // Top Left
  coords[0] = [centre[0] - size / 2, centre[1] - size / 2]
  // Top Right
  coords[1] = [centre[0] - size / 2, centre[1] + size / 2]
  // Bottom Right
  coords[2] = [centre[0] + size / 2, centre[1] + size / 2]
  // Bottom Left
  coords[3] = [centre[0] + size / 2, centre[1] - size / 2]

  return coords
}
