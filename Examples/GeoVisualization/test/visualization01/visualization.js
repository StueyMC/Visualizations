import {visualization} from '../../src/visualization01/visualization';
import MooDConfig from './MooDConfig.json';
// import dataConfig from './data.json';
// import styleConfig from './style.json';
// import inputsConfig from './inputs.json';
// import stateConfig from './state.json';
import dataConfig from './data2.json';
import styleConfig from './style2.json'; // tile.openstreetmap.org NOTE: only use this tile server for limited testing 
import inputsConfig from './inputs2.json';
import stateConfig from './state2.json';
// import dataConfig from './data2.json';
// import styleConfig from './style3.json'; // Google maps
// import inputsConfig from './inputs3.json';
// import stateConfig from './state2.json';

const config = {}
const pkg = require('../../package.json')
config.version = pkg.version

let key
let css

for (key in MooDConfig) {
    if(MooDConfig.hasOwnProperty(key)) {
        config[key] = MooDConfig[key]
    }
}

for (key in dataConfig) {
    if(dataConfig.hasOwnProperty(key)) {
        config[key] = dataConfig[key]
    }
}

if (styleConfig.URL !== undefined) {
    css = styleConfig.URL
}


for (key in styleConfig) {
    if(styleConfig.hasOwnProperty(key) && key !== 'URL') {
        config[key] = styleConfig[key]
    }
}

for (key in inputsConfig) {
    if(inputsConfig.hasOwnProperty(key)) {
        config[key] = inputsConfig[key]
    }
}

for (key in stateConfig) {
    if(stateConfig.hasOwnProperty(key)) {
        config[key] = stateConfig[key]
    }
}
config.state.value = JSON.stringify(config.state.value)

//   console.log(JSON.stringify(config));
   addCSSFile('CSS/leaflet-custom.css')
   addCSSFile('CSS/leaflet-geoman.css')
   addCSSFile('CSS/leaflet-minimap.css')
   addCSSFile(css)
   
    //
    // Define inputChanged function
    //
    var inputChanged = function (name, value) {
        console.log('Inputs Changed: name = ' + name + ', value: ' + JSON.stringify(value))
    }
    //
    // Define updateOutput function to log to console changes to output
    //
    var updateOutput = function(name, value) {
        console.log('Output changed: name = ' + name + ', value = ' + value.toString())
    }
    //
    // Define performAction function to log to console actions triggered by visualisation
    //
    var performAction = function(name, id, event) {
        console.log('Perform Action: name = ' + name + ', id = ' + id + ', event type: ' + JSON.stringify(event.type))
    }
    //
    // Define updateState function
    //
    var updateState = function (value) {
        console.log('updateState value: ' + JSON.stringify(value))
    }
    //
    // Define errorOccurred function to report errors
    //
    var errorOccurred = function(error) {
        console.error(error)
    }
    //
    // Define empty dataChanged function that the visualisation extends
    //
    var dataChanged = function(config)
    {

    }
    config.functions = {
        dataChanged: dataChanged,
        inputChanged: inputChanged,
        updateOutput: updateOutput,
        performAction: performAction,
        updateState: updateState,
        errorOccurred
    }


    //
    // Handle Zoom Level input
    //
    const zoomEl = document.getElementById('zoom')
    zoomEl.value = config.inputs.zoomLevel
    zoomEl.addEventListener(
        "change",
        (event) => {
            const value = parseInt(event.target.value)
            config.inputs.zoomLevel = value
            config.functions.inputChanged('zoomLevel', value)
        },
        false,
        )
    //
    // Handle Centre point x / longitude input
    //
    const latEl = document.getElementById('centre-x')
    latEl.value = config.inputs.centreX
    latEl.addEventListener(
        "change",
        (event) => {
            const value = parseFloat(event.target.value)
            config.inputs.centreX = value
            config.functions.inputChanged('centreX', value)
        },
        false,
        )
    //
    // Handle Centre point y / latitude input
    //
    const longEl = document.getElementById('centre-y')
    longEl.value = config.inputs.centreY
    longEl.addEventListener(
        "change",
        (event) => {
            const value = parseFloat(event.target.value)
            config.inputs.centreY = value
            config.functions.inputChanged('centreY', value)
        },
        false,
        )

    // // Remove inputs for the other visualisation in the package
    // var viz02Div = document.getElementById('visualisation02_inputs')
    // viz02Div.remove()

    var el = document.getElementById(config.element)
    el.style.height = config.height
    el.style.width = config.width
    visualization(config)

function addCSSFile(cssURL) {
    if (cssURL !== undefined && cssURL !== null) {
        var link = document.createElement( "link" );
        link.href = cssURL
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";

        document.getElementsByTagName( "head" )[0].appendChild( link );    
    }
}
