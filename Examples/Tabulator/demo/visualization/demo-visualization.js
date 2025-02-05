import { visualization } from "../../src/visualization/visualization";
import MooDConfig from "./MooDConfig.json";
import dataConfig from "./sample-data.json";
import styleConfig from "./style.json";
import inputsConfig from "./inputs.json";

const config = {};
const pkg = require("../../package.json");
config.version = pkg.version;
let key;
let css;

for (key in MooDConfig) {
  if (MooDConfig.hasOwnProperty(key)) {
    config[key] = MooDConfig[key];
  }
}

for (key in dataConfig) {
  if (dataConfig.hasOwnProperty(key)) {
    config[key] = dataConfig[key];
  }
}

if (styleConfig.URL !== undefined) {
  css = styleConfig.URL;
}

for (key in styleConfig) {
  if (styleConfig.hasOwnProperty(key) && key !== "URL") {
    config[key] = styleConfig[key];
  }
}

for (key in inputsConfig) {
  if (inputsConfig.hasOwnProperty(key)) {
    config[key] = inputsConfig[key];
  }
}

//    console.log(JSON.stringify(config));
addCSSFile(css);

var el = document.getElementById(config.element);
el.style.height = config.height;
el.style.width = config.width;
visualization(config);

function addCSSFile(cssURL) {
  if (cssURL !== undefined && cssURL !== null) {
    var link = document.createElement("link");
    link.href = cssURL;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";

    document.getElementsByTagName("head")[0].appendChild(link);
  }
}
