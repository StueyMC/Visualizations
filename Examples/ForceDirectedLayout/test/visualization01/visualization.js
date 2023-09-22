import { createForceLayout } from '../../src/visualization01/visualization';
import MooDConfig from './MooDConfig.json';
// import dataConfig from './data.json';
// import dataConfig from './data2.json';
// import dataConfig from './data3.json';
import dataConfig from './data4.json';
import styleConfig from './style.json';
import inputsConfig from './inputs.json';

const config = {};
const pkg = require('../../package.json')
config.version = pkg.version
let key;
let css;

for (key in MooDConfig) {
    if(MooDConfig.hasOwnProperty(key)) {
        config[key] = MooDConfig[key];
    }
}

for (key in dataConfig) {
    if(dataConfig.hasOwnProperty(key)) {
        config[key] = dataConfig[key];
    }
}

if (styleConfig.URL !== undefined) {
    css = styleConfig.URL
}

for (key in styleConfig) {
    if (styleConfig.hasOwnProperty(key) && key !== 'URL') {
        config[key] = styleConfig[key];
    }
}

for (key in inputsConfig) {
    if (inputsConfig.hasOwnProperty(key)) {
        config[key] = inputsConfig[key];
    }
}

    //
    // Define updateOutput function to log to console changes to output
    //
    var updateOutput = function(name, value) {
        console.log('Output changed: name = ' + name + ', value = ' + value.toString())
    }
    //
    // Define errorOccurred function to log errors to console
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
    // Define inputChanged function
    //
    var inputChanged = function (name, value) {
        console.log('Inputs Changed: name = ' + name + ', value: ' + JSON.stringify(value))
    }

    var buttonEl = document.getElementById("toggle-show-labels")
    buttonEl.addEventListener('click', () => toggleShowLabel())
    buttonEl.children.item(0).innerText = config.inputs.showLabels.toString()
    //
    // Define button click functions to alter the inputs
    //
    function toggleShowLabel() {
        config.inputs.showLabels++
        if (config.inputs.showLabels > 3) {
            config.inputs.showLabels = 1
        }
        config.functions.inputChanged('showLabels', config.inputs.showLabels)
        buttonEl.children.item(0).innerText = config.inputs.showLabels.toString()
    }

    config.functions = {
        errorOccurred: errorOccurred,
        performAction: performAction,
        inputChanged: inputChanged,
        updateOutput: updateOutput
    };
    //    console.log(JSON.stringify(config));
    addCSSFile(css);

    var el = document.getElementById(config.element)
    el.style.height = config.height
    el.style.width = config.width
    createForceLayout(config);

    function addCSSFile(cssURL) {
        if (cssURL !== undefined && cssURL !== null) {
            var link = document.createElement("link");
            link.href = cssURL
            link.type = "text/css";
            link.rel = "stylesheet";
            link.media = "screen,print";

            document.getElementsByTagName("head")[0].appendChild(link);
        }
    }
