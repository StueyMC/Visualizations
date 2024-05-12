import * as vNG from "v-network-graph"

interface NodeInfo {
  nodeId: string,
  outEdgeIds: string[],
  inEdgeIds: string[]
}
interface NodeMap {
  [name: string]: NodeInfo
}
interface PathInfo {
  pathId: string,
  nodes: NodeMap,
  edges: string[],
  startNodeId: string,
}

/**
 * Place the edges within each path in the correct order
 * Each path is validated to ensure that there is a realisable path over
 * all of the edges in it. Invalid paths are left unaltered
 * @param paths the set of paths to process. Edges are reordered in place
 * @param edges the edges for the graph
 * @returns an array of reports, one element for each invalid path
 */
export function orderPaths (paths: vNG.Paths, edges: vNG.Edges) : string[] {
  const report: string[] = []

  for (let pathId in paths) {
    const path = paths[pathId]
    console.log("inspectPath")
    const pathInfo = inspectPath(path, edges)
    console.log("validatePath")
    let errorReport = validatePath(pathInfo, edges)
    if (!errorReport) {
      console.log("orderPath")
      errorReport = orderPath(path, pathInfo, edges)
    }

    if (errorReport) {
      report.push(errorReport)
    }
  }

  return report
}

/**
 * Identify all the nodes visited by the path and record the
 * edges flowing out (source nodes) and edges flowing in (target nodes)
 * @param path The path to inspect
 * @param edges All the edges in the graph
 * @returns The source nodes and target nodes with edges out and in respectively
 */
function inspectPath(path: vNG.Path, edges: vNG.Edges): PathInfo {
  const pathInfo: PathInfo = {
    pathId: path.id || "unknown",
    nodes: {},
    edges: [],
    startNodeId: "",
  }
  path.edges.forEach((edgeId) => {
    const edge = edges[edgeId]
    if (edge) {
      const sourceNodeId = edge.source
      const targetNodeId = edge.target
      //
      // Record all the nodes that are sources of edges
      //
      if (!pathInfo.nodes[sourceNodeId]) {
        pathInfo.nodes[sourceNodeId] = {nodeId: sourceNodeId, outEdgeIds: [], inEdgeIds: []}
      }
      pathInfo.nodes[sourceNodeId].outEdgeIds.push(edgeId)
      //
      // Record all the nodes that are targets of edges
      //
      if (!pathInfo.nodes[targetNodeId]) {
        pathInfo.nodes[targetNodeId] = {nodeId: targetNodeId, outEdgeIds: [], inEdgeIds: []}
      }
      pathInfo.nodes[targetNodeId].inEdgeIds.push(edgeId)
    } else {
      throw new DOMException("Unknown edge " + edgeId + " in Path " + path.id)
    }
  })

  return pathInfo
}

/**
 * Check to see if the path is valid, i.e. there is a route starting at a node
 * that can traverse each of the edges once and only once to reach a node at the
 * end of the path. Validation is performed using a set of rules without traversing
 * the path. Records the node to start the path at in the pathInfo
 * @param pathInfo Information needed to validate the path
 * @param edges All the edges in the graph
 * @returns an empty string 
 */
function validatePath(pathInfo: PathInfo, edges: vNG.Edges) : string | undefined {
    // Type to record information about nodes that don't have the
    // same number of edges flowing in as flowing out
  interface UnbalancedNodeInfo {
    edgeCountMismatch: number,
    nodeId: string
  }

  let report: string | undefined

  try {
    //
    // Determine source node(s) for the path, i.e. nodes that are not targets of any of the edges in the path
    // A path must have zero or one source node, the start of the path. A path with no source node has a cycle
    //
    const sourceNodes: string[] = Object.values(pathInfo.nodes)
    .filter(node => node.inEdgeIds.length === 0)
    .map(node => node.nodeId)
    if (sourceNodes.length > 1) {
      throw new DOMException("Path " + pathInfo.pathId + " has " + sourceNodes.length + " source nodes")
    }
    //
    // Determine sink node(s) for the path, i.e. nodes that are not sources of any of the edges in the path
    // A path with no sink nodes is circular. A path with multiple sinks cannot be rendered without drawing a section
    // of the path between sink nodes where there is no edge between them
    //
    const sinkNodes: string[] = Object.values(pathInfo.nodes)
    .filter(node => node.outEdgeIds.length === 0)
    .map(node => node.nodeId)
    if (sinkNodes.length > 1) {
      throw new DOMException("Path " + pathInfo.pathId + " has " + sinkNodes.length + " sink nodes")
    }
    const hasSourceNode = sourceNodes.length === 1
    const hasSinkNode = sinkNodes.length === 1
    let sourceNodeId: string = ""
    //
    // Validate branches in the path.
    // 1. All branches must be cycles back to the branch point
    // 2. Paths with both a source and sink node can only have cycles where there is a path from source to the same
    //    node in the cycle as the branch out of the cycle to the sink node
    //
    // Loop through all nodes and record any where the number of edges flowing in isn't the same as flowing out
    //
    const unbalancedNodes: UnbalancedNodeInfo[] = []
    Object.values(pathInfo.nodes)
    .filter(node => node.inEdgeIds.length !== node.outEdgeIds.length)
    .forEach(node => {
      unbalancedNodes.push({edgeCountMismatch: (node.outEdgeIds.length - node.inEdgeIds.length), nodeId: node.nodeId})
    })
    //
    // Validate any unbalanced nodes and identify the source and sink nodes for the path
    //
    if (hasSourceNode === hasSinkNode) { // both sink and source nodes
      if (unbalancedNodes.length === 2 &&
        unbalancedNodes[0].edgeCountMismatch + unbalancedNodes[1].edgeCountMismatch === 0) {
          // start path at source node
          pathInfo.startNodeId = sourceNodes[0]
      } else {
        throw new DOMException("Path " + pathInfo.pathId + " has invalid branches in it")
      }
    } else if (hasSourceNode) { // source but no sink
      if (unbalancedNodes.length === 2 &&
        unbalancedNodes[0].edgeCountMismatch + unbalancedNodes[1].edgeCountMismatch === 0) {
        // start path at source node
        pathInfo.startNodeId = sourceNodes[0]
      } else {
        throw new DOMException("Path " + pathInfo.pathId + " has invalid branches in it")
      }
    } else if (hasSinkNode) { // sink but no source
      if (unbalancedNodes.length === 2 &&
        unbalancedNodes[0].edgeCountMismatch + unbalancedNodes[1].edgeCountMismatch === 0) {
        // the path is a loop with a branch out towards the sink node
        // start path at node in loop where the path branches out to the sink
        pathInfo.startNodeId = unbalancedNodes[0].nodeId
      } else {
        throw new DOMException("Path " + pathInfo.pathId + " has invalid branches in it")
      }
    } else { // no source nor sink nodes
      if (unbalancedNodes.length === 0) {
        // with no source nor sink nodes the path is a loop
        // start path at arbitary node
        pathInfo.startNodeId = pathInfo.nodes[0].nodeId
      } else {
        throw new DOMException("Path " + pathInfo.pathId + " has invalid branches in it")
      }
    }
  } catch (e) {
    report = e.name + ': ' + e.message
  }

  return report
}

interface SubPath {
  orderedEdgeIds: string[],
  isLoop: boolean
}

function orderPath(path: vNG.Path, pathInfo: PathInfo, edges: vNG.Edges): string | undefined {
  let report: string | undefined
  const orderedPath = findPath(pathInfo.startNodeId, pathInfo.startNodeId, pathInfo, edges, undefined)
  if (orderedPath.orderedEdgeIds.length !== path.edges.length) {
    report = "Path " + path.id + " is not contiguous"
  } else {
    path.edges = orderedPath.orderedEdgeIds
  }

  return report
}

function findPath(startNodeId: string, endOfLoopNodeId: string, pathInfo: PathInfo, edges: vNG.Edges, initialEdgeId: string | undefined): SubPath {
  console.log("Entry to findPath: (" + startNodeId + ", " + endOfLoopNodeId + ", " + initialEdgeId)
  const path: SubPath = {orderedEdgeIds: [], isLoop: false}
  let currentNodeId: string = startNodeId
  let atEndOfPath: boolean = false

  if (initialEdgeId) {
    console.log("Initial edge id: " + initialEdgeId)
    path.orderedEdgeIds.push(initialEdgeId)
  }

  while (!atEndOfPath) {
    console.log("Current Node Id: " + currentNodeId)
    let nodeInfo = pathInfo.nodes[currentNodeId]

    if (!nodeInfo || nodeInfo.outEdgeIds.length === 0 ) {
      console.log("Ending path: " + JSON.stringify(nodeInfo))
      atEndOfPath = true
    } else if (nodeInfo.outEdgeIds.length === 1) {
      //
      // Single edge out of the current node
      //
      const edgeId = nodeInfo.outEdgeIds[0]
      console.log("Add edge: " + edgeId)
      path.orderedEdgeIds.push(edgeId)
      currentNodeId = edges[edgeId].target
      nodeInfo.outEdgeIds.pop()
      if (currentNodeId === endOfLoopNodeId) {
        atEndOfPath = true
        path.isLoop = true
      }
    } else {
      //
      // Branch in the path
      // Need to traverse loops before heading for sink node
      //
      console.log("Branch at node: " + currentNodeId)
      let finalPath: string[] = []
      let newNodeId: string = ""
      nodeInfo.outEdgeIds.forEach(edgeId => {
        console.log("Processing edge: " + edgeId)
        const nextNodeId = edges[edgeId].target
        // array.shift()
        if (nextNodeId === currentNodeId) {
          console.log("Single node loop, edgeId: " + edgeId)
          path.orderedEdgeIds.push(edgeId)
        } else {
          const subPath = findPath(nextNodeId, currentNodeId, pathInfo, edges, edgeId)
          if (subPath.isLoop) {
            console.log("Add subpath:" + JSON.stringify(subPath.orderedEdgeIds))
            path.orderedEdgeIds = path.orderedEdgeIds.concat(subPath.orderedEdgeIds)
          } else {
            console.log("Final path: " + JSON.stringify(subPath.orderedEdgeIds))
            finalPath = subPath.orderedEdgeIds
            newNodeId = nextNodeId
          }
        }
      })
      console.log("Add final path node: " + JSON.stringify(finalPath))
      path.orderedEdgeIds = path.orderedEdgeIds.concat(finalPath)
      currentNodeId = newNodeId
    }
  }

  console.log("Sub-path" + JSON.stringify(path))
  return path
}
