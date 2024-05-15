import { createApp } from 'vue'
import App from './App.vue'
import { VNetworkGraph } from 'v-network-graph'
import 'v-network-graph/lib/style.css'

import Logger from '@helpers/logger'
// import { ConfigContext } from "@helpers/context/configContext";
import {
  // getVisualizationConfig,
  // getVisualizationState,
  setVisualizationConfig
  // getVisualizationData
} from '@helpers/config'
import './visualization.css'
import { MooDConfig } from '@moodtypes/index'
// import { Vis } from "@core/src/types/data";

//
//    Entry function declaration
//
export function visualization (config: MooDConfig): void {
  Logger.developmentMode = config.style?.DevelopmentMode ?? false
  Logger.Log('Development mode is enabled, logging will be enabled')

  // Update the global Custom Visualization config object
  setVisualizationConfig(config)

  // Example ways to reference config variables before we enter React
  // const width = parseFloat(config.width)
  // const height = parseFloat(config.height)
  // const animation = config.animation
  // const state = getVisualizationState(true);

  // Logger.Log("This is an example of a development log");

  // Create the Vue application root element with the element provided by MooD BA
  const app = createApp(App)
  app.component('VNetworkGraph', VNetworkGraph)
  app.mount('#' + config.element)
}
