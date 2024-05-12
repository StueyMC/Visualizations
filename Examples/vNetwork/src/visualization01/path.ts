import * as vNG from "v-network-graph"
import { Edge } from "./edge"
import { Node } from "./node"

interface NodeMap {
  [name: string]: Node
}

interface SubPath {
  orderedEdgeIds: string[],
  isLoop: boolean
}

export class Path {
  readonly id: string
  readonly nodes: NodeMap
  readonly originalEdgeOrder: string[]
  protected startNode: Node | undefined
  protected readonly vNGpath: vNG.Path

  constructor(path: vNG.Path, edges: vNG.Edges) {
    this.id = path.id || "unknown"
    this.vNGpath = path
    this.nodes = {}
    this.originalEdgeOrder = path.edges.map(edgeId => edgeId)
    path.edges.forEach(edgeId => {
      if (!edges[edgeId]) {
        throw new DOMException("Path " + this.id + " has unknown edge " + edgeId)
      }
      const newEdge = new Edge(edgeId, edges[edgeId])
      this.getNode(newEdge.source).addEdge(newEdge)
      this.getNode(newEdge.target).addEdge(newEdge)
    })
  }

  protected getNode(nodeId: string): Node {
    if (!this.nodes[nodeId]) {
      this.nodes[nodeId] = new Node(nodeId)
    }
    return this.nodes[nodeId]
  }

  public node(nodeId: string): Node {
    if (!this.nodes[nodeId]) {
      throw new DOMException("Unknown node " + nodeId + " on path " + this.id)
    }
    return this.nodes[nodeId]
  }

  protected validSourceNode(): Node | undefined {
    let returnNode: Node |undefined
    const sourceNodes = Object.values(this.nodes)
    .filter(node => node.isValidPathSource())
    if (sourceNodes.length === 1) {
      returnNode = sourceNodes[0]
    } else if (sourceNodes.length > 1) {
      throw new DOMException("Path " + this.id + " has " + sourceNodes.length + " source nodes")
    }
    return returnNode
  }

  protected validSinkNode(): Node | undefined {
    let returnNode: Node |undefined
    const sinkNodes = Object.values(this.nodes)
    .filter(node => node.isValidPathSink())
    if (sinkNodes.length === 1) {
      returnNode = sinkNodes[0]
    } else if (sinkNodes.length > 1) {
      throw new DOMException("Path " + this.id + " has " + sinkNodes.length + " sink nodes")
    }
    return returnNode
  }

  /**
   * Check to see if the path is valid, i.e. there is a route starting at a node
   * that can traverse each of the edges once and only once to reach a node at the
   * end of the path. Validation is performed using a set of rules without traversing
   * the path. Sets the startNode property to the node to start the path at
   * @returns an undefined value if valid or a string describing the fault if invalid 
   */
  public validate(): string | undefined {
    let report: string | undefined
    try {
      const sourceNode = this.validSourceNode()
      const sinkNode = this.validSinkNode()
      const unbalancedNodes = Object.values(this.nodes)
      .filter(node => node.isUnbalanced())
      if (sourceNode && sinkNode) { // both sink and source nodes
        if (unbalancedNodes.length === 2 &&
          unbalancedNodes[0].flowMismatch() + unbalancedNodes[1].flowMismatch() === 0) {
            // start path at source node
            this.startNode = sourceNode
        } else {
          throw new DOMException("Path " + this.id + " has invalid branches in it")
        }
      } else if (sourceNode) { // source but no sink
        if (unbalancedNodes.length === 2 &&
          unbalancedNodes[0].flowMismatch() + unbalancedNodes[1].flowMismatch() === 0) {
          // start path at source node
          this.startNode = sourceNode
        } else {
          throw new DOMException("Path " + this.id + " has invalid branches in it")
        }
      } else if (sinkNode) { // sink but no source
        if (unbalancedNodes.length === 2 &&
          unbalancedNodes[0].flowMismatch() + unbalancedNodes[1].flowMismatch() === 0) {
          // the path is a loop with a branch out towards the sink node
          // start path at node in loop where the path branches out to the sink
          this.startNode = unbalancedNodes[0]
        } else {
          throw new DOMException("Path " + this.id + " has invalid branches in it")
        }
      } else { // no source nor sink nodes
        if (unbalancedNodes.length === 0) {
          // with no source nor sink nodes the path is a loop
          // start path at arbitary node
          this.startNode = Object.values(this.nodes)[0]
        } else {
          throw new DOMException("Path " + this.id + " has invalid branches in it")
        }
      }
    } catch (e) {
      report = e.name + ': ' + e.message
    }
  
    return report
  }

  public orderEdges(): string | undefined {
    let report: string | undefined
    if (!this.startNode) {
      throw new DOMException("Path " + this.id + ": orderEdges called on invalid or unvalidate path")
    }
    const orderedPath = this.findPath(this.startNode, this.startNode, undefined)
    if (orderedPath.orderedEdgeIds.length !== this.originalEdgeOrder.length) {
      report = "Path " + this.id + " is not contiguous"
    } else {
      this.vNGpath.edges = orderedPath.orderedEdgeIds
    }
  
    return report
  }

  protected findPath(startNode: Node, endOfLoopNode: Node, initialEdge: Edge | undefined): SubPath {
    // console.log("Entry to findPath: (" + startNode.id + ", " + endOfLoopNode.id + ", " + initialEdge?.id)
    const path: SubPath = {orderedEdgeIds: [], isLoop: false}
    let currentNode: Node = startNode
    let atEndOfPath: boolean = false
  
    if (initialEdge) {
      // console.log("Initial edge id: " + initialEdge.id)
      path.orderedEdgeIds.push(initialEdge.id)
    }
  
    while (!atEndOfPath) {
      // console.log("Current Node Id: " + currentNode.id)
  
      if (currentNode.untraversedEdges().length === 0 ) {
        // console.log("Ending path at node " + currentNode.id)
        atEndOfPath = true
      } else if (currentNode.untraversedEdges().length === 1) {
        //
        // Single edge out of the current node
        //
        const edge = currentNode.untraversedEdges()[0]
        // console.log("Add edge: " + edge.id)
        path.orderedEdgeIds.push(edge.id)
        currentNode = this.node(edge.target)
        edge.traverse()
        if (currentNode.id === endOfLoopNode.id) {
          atEndOfPath = true
          path.isLoop = true
        }
      } else {
        //
        // Branch in the path
        // Need to traverse loops before heading for sink node
        //
        // console.log("Branch at node: " + currentNode.id)
        let finalPath: string[] = []
        let newNode: Node | undefined
        currentNode.untraversedEdges().forEach(edge => {
          // console.log("Processing edge: " + edge.id)
          const nextNode = this.node(edge.target)
          edge.traverse()
          if (nextNode.id === currentNode.id) {
            // Add single edge loop to current sub path
            // console.log("Single node loop, edgeId: " + edge.id)
            path.orderedEdgeIds.push(edge.id)
          } else {
            // build new sub path from edge so that
            // final sub-path can be added after loop sub-paths
            const subPath = this.findPath(nextNode, currentNode, edge)
            if (subPath.isLoop) {
              // console.log("Add subpath:" + JSON.stringify(subPath.orderedEdgeIds))
              path.orderedEdgeIds = path.orderedEdgeIds.concat(subPath.orderedEdgeIds)
            } else {
              // console.log("Final path: " + JSON.stringify(subPath.orderedEdgeIds))
              finalPath = subPath.orderedEdgeIds
              newNode = nextNode
            }
          }
        })
        // console.log("Add final path node: " + JSON.stringify(finalPath))
        path.orderedEdgeIds = path.orderedEdgeIds.concat(finalPath)
        if (!newNode) {
          throw new DOMException("Path " + this.id + " has invalid branches in it")
        }
        currentNode = newNode
      }
    }
  
    // console.log("Sub-path" + JSON.stringify(path))
    return path
  }  
}