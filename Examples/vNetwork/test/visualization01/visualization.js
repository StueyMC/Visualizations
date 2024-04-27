import { visualization } from "../../src/visualization01/visualization";
// import { MooDConfig } from "@moodtypes/index"; // "../../types/typescript-transformer/moodtypes/index";

import MooDConfiguration from "./MooDConfig.json";
import dataConfig from "./data.json";
import styleConfig from "./style.json";
import inputsConfig from "./inputs.json";
import stateConfig from "./state.json";

// const config: MooDConfig = {};
const config = {};
let key;
let css;

for (key in MooDConfiguration) {
  if (MooDConfiguration.hasOwnProperty(key)) {
    config[key] = MooDConfiguration[key];
  }
}

for (key in stateConfig) {
  if (stateConfig.hasOwnProperty(key)) {
    config[key] = stateConfig[key];
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
if (el) {
  el.style.height = config.height;
  el.style.width = config.width;
  visualization(config);
}

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
