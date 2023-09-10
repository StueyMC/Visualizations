//
//    Entry function declaration
//
import * as d3 from 'd3'
/**
 *
 * @param {object} config MooD visualisation config object
 */
export function createForceLayout (config) {
  //
  // Retrieve graph configuration
  //
  // const inputs = config.inputs
  const style = config.style
  const width = parseFloat(config.width)
  const height = parseFloat(config.height)
  style.width = width
  style.height = height
  // const animation = config.animation
  const data = config.data

  try {
    //
    // Build a lookup for Nodes
    //
    const nodeMap = {}
    data.nodes.forEach(node => {
      nodeMap[node.id] = {
        name: node.name,
        radius: circleRadius(node, style),
        isLinked: false
      }
    })
    // Add indicator for node is linked
    data.links.forEach(link => {
      nodeMap[link.source.id].isLinked = true
      nodeMap[link.target.id].isLinked = true
    })
    if (!style['Ignore Unknown Nodes']) {
      //
      // Check all the links for a missing node
      //
      data.links.forEach(link => {
        if (!nodeMap[link.source.id]) {
          throw new Error('Source node for link between "' + link.source.name + '" and "' + link.target.name + '" is not in Nodes data')
        }
        if (!nodeMap[link.target.id]) {
          throw new Error('Target node for link between "' + link.source.name + '" and "' + link.target.name + '" is not in Nodes data')
        }
      })
    }
    //
    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    //
    const links = data.links
      .filter(link => nodeMap[link.source.id] && nodeMap[link.target.id])
      .map(link => ({
        source: link.source.id,
        target: link.target.id,
        value: link.value,
        colour: linkColour(link, style),
        distance: (style['Link Distance'] || 30) + nodeMap[link.source.id].radius + nodeMap[link.target.id].radius
      }))
    const nodes = data.nodes.map(d => ({
      id: d.id,
      name: d.name,
      colour: d.colour,
      radius: circleRadius(d, style),
      isLinked: nodeMap[d.id].isLinked
    }))

    // console.log('Nodes: ' + JSON.stringify(nodes))
    // console.log('Links: ' + JSON.stringify(links))
    // console.log('Style: ' + JSON.stringify(style))

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(d => nodeCharge(d, style)))
      .force('collision', d3.forceCollide().radius(function (d) { return d.radius }))
      .force('x', d3.forceX().x(d => nodeForceCentreX(d, style)).strength(d => nodeRepositionStrength(d, style)))
      .force('y', d3.forceY().y(height / 2).strength(d => nodeRepositionStrength(d, style)))
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.distance))
      .on('tick', ticked)

    const el = d3.select('#' + config.element)
    // Create the SVG container.
    const svg = el
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')

    // Add a line for each link
    const link = svg.append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll()
      .data(links)
      .join('line')
      .attr('stroke', d => d.colour)
      .attr('stroke-width', d => Math.sqrt(d.value))

    // Add a circle for each node.
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll()
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.colour)

    node.append('title')
      .text(d => d.name)

    // Add a drag behavior.
    node.call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))

    // Determine colour for link
    function linkColour (link, style) {
      return link.linkColour || link.source.linkColour || link.target.linkColour || style['Link Colour']
    }

    // Determine radius of circle
    function circleRadius (node, style) {
      const minRadius = style['Node Minimum Radius'] || 5
      const maxRadius = style['Node Maximum Radius'] || 500
      return node.size ? Math.min(Math.max(node.size, minRadius), maxRadius) : minRadius
    }
    // 
    // Repositioning strength of node depending on whether the node is linked
    //
    // The strength determines how much to increment the node’s x-velocity: (x - node.x) × strength.
    // For example, a value of 0.1 indicates that the node should move a tenth of the way from its current x-position
    // to the target x-position with each application.
    // Higher values moves nodes more quickly to the target position, often at the expense of other forces or constraints.
    // A value outside the range [0,1] is not recommended.
    //
    // Linked nodes have a zero strength so rely on other forces alone
    //
    function nodeRepositionStrength (node, style) {
      return node.isLinked ? 0.0 : style['Unlinked Node Cluster Repositioning Strength'] || 0.1
    }

    // Force centre X coordinate for node depending on whether the node is linked
    // Linked nodes are positioned in the centred
    function nodeForceCentreX (node, style) {
      return node.isLinked ? style.width / 2 : style['Unlinked Node Cluster x'] || 100
    }

    // The charge for all nodes depending on whether the node is linked
    // Unlinked nodes attract each other
    function nodeCharge (node, style) {
      return node.isLinked ? style['Linked Node Force Strength'] || -40 : style['Unlinked Node Force Strength']
    }

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked () {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted (event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    // Update the subject (dragged node) position during drag.
    function dragged (event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended (event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }
  } catch (e) {
    const errorMessage = e.name + ': ' + e.message
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }
}
