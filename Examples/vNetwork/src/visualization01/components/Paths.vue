<script setup lang="ts">
import {
  getVisualizationConfig,
  getVisualizationState,
  getVisualizationData,
  getVisualizationOutputs,
} from "@helpers/config";
// import { setupProductionConfig } from "@helpers/production";
// import { useStrictAction } from "@helpers/hooks/useStrictAction";
import { ActionsEnum } from "../src/types/actions";
import { OutputsEnum } from "../src/types/outputs";
// import { useData } from "@helpers/hooks/useData";

// import { reactive, ref } from "vue"
import * as vNG from "v-network-graph"
import {
  ForceLayout,
  ForceNodeDatum,
  ForceEdgeDatum,
} from "v-network-graph/lib/force-layout"

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
const config = getVisualizationConfig();
// setupProductionConfig(config);
const outputs = getVisualizationOutputs();
console.log("Outputs: " + JSON.stringify(outputs))
const eventHandlers: vNG.EventHandlers = {
  "node:click": ({ node, event }) => {
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
  },
}

const data = getVisualizationData(false)
const nodes: vNG.Nodes = {};
const edges: vNG.Edges = {};
const layouts: vNG.Layouts = {nodes: {}};
const paths: vNG.Paths = {};
const configs = vNG.defineConfigs({
  view: {
    // builtInLayerOrder: ["edges", "paths"],
    autoPanAndZoomOnLoad: "center-content", //"fit-content", // false | "center-zero" | "center-content" | 
    // fitContentMargin: 0,
    minZoomLevel: 0.5,
    maxZoomLevel: 5,
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: true,
        createSimulation: (d3, nodes, edges) => {
          // d3-force parameters
          const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
          return d3
            .forceSimulation(nodes)
            .force("edge", forceLink.distance(40).strength(0.5))
            .force("charge", d3.forceManyBody().strength(-800))
            .force("center", d3.forceCenter().strength(0.05))
            .alphaMin(0.001)

            // * The following are the default parameters for the simulation.
            // const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
            // return d3
            //   .forceSimulation(nodes)
            //   .force("edge", forceLink.distance(100))
            //   .force("charge", d3.forceManyBody())
            //   .force("collide", d3.forceCollide(50).strength(0.2))
            //   .force("center", d3.forceCenter().strength(0.05))
            //   .alphaMin(0.001)
        }
      }),
    },
  node: {
    normal: {
      type: "circle",
      // radius: 20,
      color: "#99ccff",
    },
    hover: {
      color: "#88bbff",
    },
    label: {
      visible: true,
      fontSize: 8,
    },
  },
  edge: {
    gap: 12,
    normal: {
      color: "#6699cc",
    },
    hover: {
      color: "#6699cc",
      width: 6,
    },
  },
  path: {
    visible: true,
    clickable: true,
    hoverable: true,
    normal: {
      width: 8,
    },
    hover: {
      width: 10,
    }
  },
})


if (data) {
  data.nodes?.forEach((node) => {
    if (node.id) {
      nodes[node.id] = { name: node.name }
      if (node.x !== undefined && node.y !== undefined) {
        // layouts.nodes[node.id] = {x: node.x, y: node.y}
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
        paths[pathLink.path.id] = {edges: []}
      }
      paths[pathLink.path.id].edges.push(pathLink.edge.id)
    }
  })
}
// console.log('Nodes: ' + JSON.stringify(nodes))
// console.log('Edges: ' + JSON.stringify(edges))
// console.log('Layouts: ' + JSON.stringify(layouts))
// console.log('Paths: ' + JSON.stringify(paths))

</script>

<template>
    <v-network-graph
    :nodes="nodes"
    :edges="edges"
    :paths="paths"
    :layouts="layouts"
    :configs="configs"
    :event-handlers="eventHandlers"
  />
</template>