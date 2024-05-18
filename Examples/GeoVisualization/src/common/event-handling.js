import {
  highlightFeature
} from '../common/leaflet-handling'

/**
 * Create a click event handler
 * @param {*} performAction the function to call to notify MooD of the click event
 * @param {*} editable indicates if visualisation is in edit mode or not
 * @returns click event handler function
 */
export function clickEvent (performAction, editable) {
  return function (event) {
    //
    // Only inform MooD of click when not in edit mode as dragging features
    // will fire the click event
    //
    if (!editable) {
      performAction('Feature Click', event.target.feature.properties.id, event.originalEvent)
    }
  }
}

/**
 * Create an overlay mouseover event handler
 * @param {*} updateOutput the function to call to notify MooD of the change of output
 * @param {*} layerConfig configuration data for the overlay layers
 * @returns mouseover event handler function
 */
export function mouseoverEvent (updateOutput, layerConfig) {
  return function (event) {
    // console.log('Feature GUID: ' + event.target.feature.properties.id)
    // highlightFeature(event, layerConfig)
    updateOutput('hoverFeature', event.target.feature.properties.id)
  }
}
