import {visualization} from '../../src/visualization02/visualization';
import MooDConfig from './MooDConfig.json';
import otherMooDConfig from '../visualization01/MooDConfig.json';
import styleConfig from './style2.json';
import inputsConfig from './inputs.json';
import { commonConfig } from '../visualization01/common-config'

const loadTestCSSurl = 'visualization02/load-test.css'
const cssTestPropertyName = 'font-size'
const cssTestPropertyAppliedValue = '10px'
let elementId

const config = {}
const pkg = require('../../package.json')
config.version = pkg.version
const otherConfig = {}
let key
let css

for (key in MooDConfig) {
    if(MooDConfig.hasOwnProperty(key)) {
        config[key] = MooDConfig[key]
    }
}

for (key in otherMooDConfig) {
    if(otherMooDConfig.hasOwnProperty(key)) {
        otherConfig[key] = otherMooDConfig[key]
    }
}

config.data = commonConfig.data

if (styleConfig.URL !== undefined) {
    css = styleConfig.URL
}


for (key in styleConfig) {
    if(styleConfig.hasOwnProperty(key) && key !== 'URL') {
        config[key] = styleConfig[key]
    }
}

for (key in commonConfig.style) {
    if(commonConfig.style.hasOwnProperty(key)) {
        config.style[key] = commonConfig.style[key]
    }
}

for (key in inputsConfig) {
    if(inputsConfig.hasOwnProperty(key)) {
        config[key] = inputsConfig[key]
    }
}

//   console.log(JSON.stringify(config));
   addCSSFile('CSS/default.css')
   addCSSFile(css)
   //
   // Load test CSS. Will check that this has been applied before
   // calling visualisation
   //
   addCSSFile(loadTestCSSurl)
   
    //
    // Define updateOutput function to log to console changes to output
    //
    var errorOccurred = function(error) {
        console.log(error)
    }
    //
    // Define performAction function to log to console actions triggered by visualisation
    //
    var performAction = function(name, id, event) {
        console.log('Perform Action: name = ' + name + ', id = ' + id + ', event: ' + JSON.stringify(event))
    }
    //
    // Define updateSize function
    //
    var updateSize = function (width, height) {
        console.log('header updateSize: size updated to ' + width + ' x ' + height)
        var el = document.getElementById(elementId)
        el.style.height = height + 'px'
        el.style.width = width + 'px'
    }

    config.functions = {
        errorOccurred: errorOccurred,
        performAction: performAction,
        updateSize: updateSize
    };
    if (!config.style.verticalSwimlanes) {
        //
        // Switch element for horizontal swimlane orientation
        //
        config.element = 'vert_' + config.element
        //
        // Limit width of header for horizontal swimlane orientation
        //
        config.width = config.height
        config.height = otherConfig.height
    }
    elementId = config.element
    var el = document.getElementById(config.element)
    el.style.height = config.height
    el.style.width = config.width
    // el.style.display = 'inline-block'
    waitForCss(visualization, config)


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

function waitForCss(callback, param) {
    function checkStyle(testElement, prop, param, callback) {
        const computedValue = window.getComputedStyle(testElement, null).getPropertyValue(prop)
        console.log('Computed value = ' + computedValue)
        if (computedValue !== cssTestPropertyAppliedValue) {
            window.setTimeout(function() {checkStyle(testElement, prop, param, callback)}, 100)
        } else {
            callback(param)
        }
    }

    const testElement = document.getElementById(param.element)
    checkStyle(testElement, cssTestPropertyName, param, callback)
}

