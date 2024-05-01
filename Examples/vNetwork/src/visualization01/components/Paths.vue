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

if (data) {
  data.nodes?.forEach((node) => {
    if (node.id) {
      nodes[node.id] = { name: node.name }
    }
  })

  data.links?.forEach((link) => {
    if (link.id && link.source?.id && link.target?.id) {
      edges[link.id] = {source: link.source.id, target: link.target.id}
    }
  })
}

</script>

<template>
    <v-network-graph
    :nodes="nodes"
    :edges="edges"
  />
</template>