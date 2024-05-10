import { node } from "prop-types"
import * as vNG from "v-network-graph"

interface NodeInfo {
  /*visited: boolean,*/
  edgeIds: string[]
}
interface NodeMap {
  [name: string]: NodeInfo
}
interface PathInfo {
  sourceNodes: NodeMap,
  targetNodes: NodeMap,
  // edgeMap: EdgeMap,
  edges: string[]
  hasCycles: boolean
}

interface SubPath {
  orderedEdgeIds: string[],
  isLoop: boolean
}

export function orderPaths (paths: vNG.Paths, edges: vNG.Edges) : vNG.Paths {
  // const data = getVisualizationData(false)
  // const nodes: vNG.Nodes = {};
  // const edges: vNG.Edges = {};
  const orderedPaths: vNG.Paths = {};
  interface UnbalancedNodeInfo {
    edgeCountMismatch: number,
    nodeId: string
  }
  interface PathMap {
    [name: string]: PathInfo
  }
  //
  // Build path data for subsequent path edge ordering
  //
  console.log("Paths parameter: " + JSON.stringify(paths))
  const pathMap: PathMap = {};
  for (let pathId in paths) {
    pathMap[pathId] = {sourceNodes: {}, targetNodes: {}, edges: [], hasCycles: false}
    orderedPaths[pathId] = {edges: []}
    const pathInfo = pathMap[pathId]
    paths[pathId].edges.forEach((edgeId) => {
      const edge = edges[edgeId]
      if (edge) {
        const sourceNodeId = edge.source
        const targetNodeId = edge.target
        //
        // Record all the nodes that are sources of edges
        //
        if (pathInfo.sourceNodes[sourceNodeId]) {
          pathInfo.hasCycles = true
        } else {
          pathInfo.sourceNodes[sourceNodeId] = {/*visited: false,*/ edgeIds: []}
        }
        pathInfo.sourceNodes[sourceNodeId].edgeIds.push(edgeId)
        //
        // Record all the nodes that are targets of edges
        //
        if (pathInfo.targetNodes[targetNodeId]) {
          pathInfo.hasCycles = true
        } else {
          pathInfo.targetNodes[targetNodeId] = {/*visited: false,*/ edgeIds: []}
        }
        pathInfo.targetNodes[targetNodeId].edgeIds.push(edgeId)
      } else {
        throw new DOMException("Unknown edge " + edgeId + " in Path " + pathId)
      }
    })
    //
    // Determine source node(s) for the path, i.e. nodes that are not targets of any of the edges in the path
    // A path must have zero or one source node, the start of the path. A path with no source node has a cycle
    //
    const sourceNodes: string[] = []
    for (let node in pathInfo.sourceNodes) {
      if (!pathInfo.targetNodes[node]) {
        sourceNodes.push(node)
      }
    }
    if (sourceNodes.length > 1) {
      throw new DOMException("Path " + pathId + "' has " + sourceNodes.length + " source nodes")
    }
    //
    // Determine sink node(s) for the path, i.e. nodes that are not sources of any of the edges in the path
    // A path with no sink nodes is circular. A path with multiple sinks cannot be rendered without drawing a section
    // of the path between sink nodes where there is no edge between them
    //
    const sinkNodes: string[] = []
    for (let node in pathInfo.targetNodes) {
      if (!pathInfo.sourceNodes[node]) {
        sinkNodes.push(node)
      }
    }
    if (sinkNodes.length > 1) {
      throw new DOMException("Path " + pathId + "' has " + sinkNodes.length + " sink nodes")
    }
    const hasSourceNode = sourceNodes.length === 1
    const hasSinkNode = sinkNodes.length === 1
    let sourceNodeId: string = ""
    let sinkNodeId: string = ""
    //
    // Validate branches in the path.
    // 1. All branches must be cycles back to the branch point
    // 2. Paths with both a source and sink node can only have cycles where there is a path from source to the same
    //    node in the cycle as the branch out of the cycle to the sink node
    //
    // Loop through all nodes where there are branches, i.e. more than one edge flowing out of the node
    //
    const unbalancedBranchNodes: UnbalancedNodeInfo[] = []
    Object.values(pathInfo.sourceNodes)
    .filter(node => node.edgeIds.length > 1)
    .forEach(node => {
      const nodeId = edges[node.edgeIds[0]].source
      const edgesFromNode = node.edgeIds.length
      const edgesIntoNode = pathInfo.targetNodes[nodeId].edgeIds.length
      if (edgesFromNode !== edgesIntoNode) {
        unbalancedBranchNodes.push({edgeCountMismatch: edgesFromNode - edgesIntoNode, nodeId})
      }
    })
    //
    // Loop through all nodes where there are merges, i.e. more than one edge flowing into the node
    //
    const unbalancedMergeNodes: UnbalancedNodeInfo[] = []
    Object.values(pathInfo.targetNodes)
    .filter(node => node.edgeIds.length > 1)
    .forEach(node => {
      const nodeId = edges[node.edgeIds[0]].target
      const edgesIntoNode = node.edgeIds.length
      const edgesFromNode = pathInfo.sourceNodes[nodeId].edgeIds.length
      if (edgesFromNode !== edgesIntoNode) {
        unbalancedMergeNodes.push({edgeCountMismatch: edgesFromNode - edgesIntoNode, nodeId})
      }
    })
    //
    // Validate any unbalanced nodes and identify the source and sink nodes for the path
    //
    if (hasSourceNode === hasSinkNode) { // either both sink and source or neither
      if ((unbalancedBranchNodes.length + unbalancedMergeNodes.length) === 0) {
        sourceNodeId = sourceNodes[0]
        sinkNodeId = sinkNodes[0]
      } else {
        throw new DOMException("Path " + pathId + "' has invalid branches in it")
      }
    } else if (hasSourceNode) { // source but no sink
      if ((unbalancedMergeNodes.length === 1 && unbalancedMergeNodes[0].edgeCountMismatch === -1) &&
          (unbalancedBranchNodes.length === 0 ||
            (unbalancedBranchNodes.length === 1 && unbalancedBranchNodes[0].nodeId === unbalancedMergeNodes[0].nodeId))) {
        sourceNodeId = sourceNodes[0]
        sinkNodeId = unbalancedMergeNodes[0].nodeId
      } else {
        throw new DOMException("Path " + pathId + "' has invalid branches in it")
      }
    } else if (hasSinkNode) { // sink but no source
      if ((unbalancedBranchNodes.length === 1 && unbalancedBranchNodes[0].edgeCountMismatch === 1) &&
          (unbalancedMergeNodes.length === 0 ||
            (unbalancedMergeNodes.length === 1 && unbalancedMergeNodes[0].nodeId === unbalancedBranchNodes[0].nodeId))) {
        sourceNodeId = unbalancedBranchNodes[0].nodeId
        sinkNodeId = sinkNodes[0]
      } else {
        throw new DOMException("Path " + pathId + "' has invalid branches in it")
      }
    }
    //
    // Traverse the graph of path edges depth first
    // in order to identify the ultimate destination (self node or sink node) of edges at a branch node
    //
    console.log("pathInfo: "  + JSON.stringify(pathInfo))
    // console.log("sourceNodeId: "  + JSON.stringify(sourceNodeId))
    const path = findPath(sourceNodeId, sourceNodeId, sinkNodeId, pathInfo, edges, undefined)
    orderedPaths[pathId] = {edges: path.orderedEdgeIds}
  }
  //
  // Set the edge order for each path
  //
  // for (let pathId in pathMap) {
  //   const pathInfo = pathMap[pathId]
  //   // const sourceNodeSet = new Set(Object.keys(pathInfo.sourceNodes))
  //   // const targetNodeSet = new Set(Object.keys(pathInfo.targetNodes))

  //   // sourceNodeSet.has()
  // }

  
  return orderedPaths
}

function findPath(startNodeId: string, endOfLoopNodeId: string, sinkNodeId: string, pathInfo: PathInfo, edges: vNG.Edges, initialEdgeId: string | undefined): SubPath {
  console.log("Entry to findPath: (" + startNodeId + ", " + endOfLoopNodeId + ", " + sinkNodeId + ", " + initialEdgeId)
  const path: SubPath = {orderedEdgeIds: [], isLoop: false}
  let currentNodeId: string = startNodeId
  let atEndOfPath: boolean = false

  if (initialEdgeId) {
    console.log("Initial edge id: " + initialEdgeId)
    path.orderedEdgeIds.push(initialEdgeId)
  }

  while (!atEndOfPath) {
    console.log("Current Node Id: " + currentNodeId)
    let nodeInfo = pathInfo.sourceNodes[currentNodeId]

    if (!nodeInfo || nodeInfo.edgeIds.length === 0 /*|| (startNodeId === endOfLoopNodeId && initialEdgeId)*/ ) {
      console.log("Ending path: " + JSON.stringify(nodeInfo))
      atEndOfPath = true
    } else if (nodeInfo.edgeIds.length === 1) {
      //
      // Single edge out of the current node
      //
      const edgeId = nodeInfo.edgeIds[0]
      console.log("Add edge: " + edgeId)
      path.orderedEdgeIds.push(edgeId)
      currentNodeId = edges[edgeId].target
      nodeInfo.edgeIds.pop()
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
      nodeInfo.edgeIds.forEach((edgeId, index, array) => {
        console.log("Processing edge: " + edgeId)
        const nextNodeId = edges[edgeId].target
        // array.shift()
        if (nextNodeId === currentNodeId) {
          console.log("Single node loop, edgeId: " + edgeId)
          path.orderedEdgeIds.push(edgeId)
        } else {
          const subPath = findPath(nextNodeId, currentNodeId, sinkNodeId, pathInfo, edges, edgeId)
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

// function findNode(startNodeId: string, startEdgeId: string, sinkNodeId: string, pathInfo: PathInfo, edges: vNG.Edges): string {
//   let foundNodeId: string = ""
//   let foundNode: boolean = false

//   let nextNodeId = edges[startEdgeId].target

//   while (nextNodeId !== startNodeId && nextNodeId !== sinkNodeId) {
//     let nodeInfo = pathInfo.sourceNodes[nextNodeId]

//   }

//   return foundNodeId
// }