<script setup lang="ts">
import {
  getVisualizationConfig,
  getVisualizationState,
  getVisualizationData,
} from "@helpers/config";
import * as vNG from "v-network-graph"

const data = getVisualizationData(false)
const nodes: vNG.Nodes = {};
const edges: vNG.Edges = {};
const layouts: vNG.Layouts = {nodes: {}};
const paths: vNG.Paths = {};
const configs = vNG.defineConfigs({
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
  },
  path: {
    visible: true,
    path: {
      width: 10,
    },
  },
})


if (data) {
  data.nodes?.forEach((node) => {
    if (node.id) {
      nodes[node.id] = { name: node.name }
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
  />
</template>