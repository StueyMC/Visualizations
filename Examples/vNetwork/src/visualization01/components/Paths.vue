<script setup lang="ts">
import {
  getVisualizationConfig,
  getVisualizationStyle,
  getVisualizationData,
  getVisualizationOutputs,
} from "@helpers/config"
import { ActionsEnum } from "../src/types/actions"
import { OutputsEnum } from "../src/types/outputs"
import { createForceLayoutHandler, orderPathEdges } from "../graph"

import * as vNG from "v-network-graph"

interface Config {
  [name: string]: any
}

// Get a reference to the "Node Click" action that we can call
//  but only if the action has been set up in MooD BA
// const [nodeClickStrict, nodeClickStrictHasAction] = useStrictAction(
//   ActionsEnum.Node_Click
// );
// Get a reference to the "Edge Click" action that we can call
//  but only if the action has been set up in MooD BA
// const [edgeClickStrict, edgeClickStrictHasAction] = useStrictAction(
//   ActionsEnum.Edge_Click
// );
const config = getVisualizationConfig()
// setupProductionConfig(config);
const outputs = getVisualizationOutputs()
const eventHandlers: vNG.EventHandlers = {
  "node:click": ({node, event}) => {
    config.functions.performAction(ActionsEnum.Node_Click, node, event)
    // nodeClickStrict(node, event)
    //           .then(() => {
    //             alert(`${ActionsEnum.Node_Click} has executed successfully`);
    //           })
    //           .catch(() => {
    //             alert(`${ActionsEnum.Node_Click} has failed to execute`);
    //           });
  },
  "edge:click": ({ edge, edges, event, summarized }) => {
    config.functions.performAction(ActionsEnum.Edge_Click, edge ?? "", event)
    // edgeClickStrict(edge ?? "", event)
    //           .then(() => {
    //             alert(`${ActionsEnum.Edge_Click} has executed successfully, edges: ${JSON.stringify(edges)}, summarize: ${summarized}`);
    //           })
    //           .catch(() => {
    //             alert(`${ActionsEnum.Edge_Click} has failed to execute`);
    //           });
  },
  "path:click": ({ path, event }) => {
    config.functions.performAction(ActionsEnum.Path_Click, path, event)
  },
  "node:pointerover": ({ node }) => {
    config.functions.updateOutput(OutputsEnum.hoverNode, node)
  },
  "edge:pointerover": ({ edge }) => {
    config.functions.updateOutput(OutputsEnum.hoverEdge, edge)
  },
  "path:pointerover": ({ path }) => {
    config.functions.updateOutput(OutputsEnum.hoverPath, path)
  }
};

const data = getVisualizationData(false)
const nodes: vNG.Nodes = {}
const edges: vNG.Edges = {}
const layouts: vNG.Layouts = {nodes: {}}
// const unorderedPaths: vNG.Paths = {}
const paths: vNG.Paths = {}
const configs = vNG.defineConfigs(getConfig())
// let hasIcons: boolean = false

if (data) {
  data.nodes?.forEach((node) => {
    if (node.id) {
      nodes[node.id] = {...node}

      if (node.x !== undefined && node.y !== undefined) {
        layouts.nodes[node.id] = {x: node.x, y: node.y}
      }
    }
  })
  
  data.edges?.forEach((edge) => {
    if (edge.id && edge.source?.id && edge.target?.id) {
      edges[edge.id] = {source: edge.source.id, target: edge.target.id}
    }
  })

  data?.paths?.forEach((pathLink) => {
    if (pathLink.path && pathLink?.path.id && pathLink.edge && pathLink.edge.id) {
      if (!paths[pathLink.path.id]) {
        paths[pathLink.path.id] = { edges: [], animated: pathLink.path?.animated || false }
      }
      paths[pathLink.path.id].edges.push(pathLink.edge.id)
    }
  })
  
  try {
    const report = orderPathEdges(paths, edges)
    if (report.length > 0) {
      config.functions.errorOccurred(report.join("\n"))
    }
    // console.log('Ordered Paths: ' + JSON.stringify(paths))
  } catch (e) {
    const errorMessage = e.name + ": " + e.message
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }

  // Conditionally render the icon template if we have any icons configured
  // hasIcons = data.nodes?.some((node) => node.hasOwnProperty("icon")) || false;
}

// console.log('Nodes: ' + JSON.stringify(nodes))
// console.log('Edges: ' + JSON.stringify(edges))
// console.log('Layouts: ' + JSON.stringify(layouts))
// console.log('Paths: ' + JSON.stringify(paths))

function getConfig(): Config {
  const style = getVisualizationStyle()
  const config: Config = {
    view: {
      // builtInLayerOrder: ["edges", "paths"],
      autoPanAndZoomOnLoad: "center-zero", //"fit-content", // false | "center-zero" | "center-content" |
      // fitContentMargin: 0,
      minZoomLevel: 0.5,
      maxZoomLevel: 5
    },
    node: {
      normal: {
        type: (node: vNG.Node) => node.normal?.shape || 'rect',
        radius: (node: vNG.Node) => node.normal?.radius || 32,
        width: (node: vNG.Node) => node.normal?.width || 64,
        height: (node: vNG.Node) => node.normal?.height || 32,
        color: (node: vNG.Node) => node.normal?.color || "#4287f5",
        label: (node: vNG.Node) => node.normal?.label || true,
        strokeWidth: 1,
        strokeColor: "#000000",
        strokeDasharray: "0",
      },
      hover: {
        color: (node: vNG.Node) => node.hover?.color,
      },
      label: {
        visible: (node: vNG.Node) => node.showLabel || true,
        fontSize: 12,
      }
    },
    edge: {
      gap: 12,
      normal: {
        color: "#C70039",
        linecap: "round"
      },
      hover: {
        color: "#C70039",
        width: 6
      }
    },
    path: {
      visible: true,
      clickable: true,
      hoverable: true,
      curveInNode: true,
      normal: {
        width: 4,
        color: "#FF6961",
        dasharray: "10 16",
        animate: (p: Vis.Data.AugmentedEndpoint) => p?.animated || false,
        animationSpeed: "40"
      },
      hover: {
        width: 10,
      }
    }
  }

  if (style?.showArrows) {
    config.edge.marker = {
      target: {
        type: "arrow",
      }
    }
  }

  if (style?.scaleObjects) {
    config.view.scalingObjects = true
  }

  if (style?.pathEnd) {
    config.path.end = style?.pathEnd
  }

  if (style?.useForceLayout) {
    config.view.layoutHandler = createForceLayoutHandler()
  }
  
  return config
}
</script>

<template>
  <v-network-graph
    :nodes="nodes"
    :edges="edges"
    :paths="paths"
    :layouts="layouts"
    :configs="configs"
    :event-handlers="eventHandlers" />
</template>
