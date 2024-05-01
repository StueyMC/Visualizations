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

if (data) {
  data.nodes?.forEach((node) => {
    if (node.id) {
      nodes[node.id] = { name: node.name }
      if (node.x !== undefined && node.y !== undefined) {
        layouts.nodes[node.id] = {x: node.x, y: node.y}
      }
    }
  })

  data.links?.forEach((link) => {
    if (link.id && link.source?.id && link.target?.id) {
      edges[link.id] = {source: link.source.id, target: link.target.id}
    }
  })
}
// console.log('Nodes: ' + JSON.stringify(nodes))
// console.log('Layouts: ' + JSON.stringify(layouts))

</script>

<template>
    <v-network-graph
    :nodes="nodes"
    :edges="edges"
    :layouts="layouts"
  />
</template>