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
  const showNodeLabelSeparation = config.style['Show Label Node Separation'] || 100
  //
  // Handle inputs and changes to inputs
  //
  const superInputChanged = config.functions.inputChanged
  config.functions.inputChanged = inputChanged
  const showNodeLabelsNone = 1
  const showNodeLabelsAll = 2
  const showNodeLabelsNear = 3
  let showNodeLabelsCode = config.inputs.showLabels || showNodeLabelsNone // default to don't show any labels
  let showAllNodeLabels = showLabels(showNodeLabelsCode)
  const nodeLabelClass = 'node-label'
  const showLabelTextClass = 'show'
  const hideLabelTextClass = 'hide'
  const labelVisibilityClass = {
    true: showLabelTextClass,
    false: hideLabelTextClass
  }
  let title
  //
  // Node styling
  //
  const nodeStrokeWidth = 0
  const nodeStroke = '#aaa'
  //
  // Link styling
  //
  const linkStrokeOpacity = 0.6
  const useMarker = config.style['Link Arrow'] === undefined ? false : config.style['Link Arrow']
  //
  // Arrow markers for target end of links
  //
  const markerSize = 5
  const markerName = 'arrow'
  const markerOffset = useMarker ? markerSize - 0 : 0
  //
  // Link Distance configuration
  //
  const linkDistance = style['Link Distance'] || 30
  const busyNodeLinkThreshold = config.style['Busy Node Link Threshold'] === undefined ? 6 : config.style['Busy Node Link Threshold']
  const busyNodeLinkDistanceMultiplier = config.style['Busy Node Link Distance Multiplier'] === undefined ? 3 : config.style['Busy Node Link Distance Multiplier']

  const curvedLinks = config.style['Curved Links'] === undefined ? false : config.style['Curved Links']

  try {
    //
    // Build a lookup for Nodes
    //
    const nodeMap = {}
    data.nodes.forEach(node => {
      nodeMap[node.id] = createNode(node.id, node.name, node.colour, node.size)
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
      .map(link => createLink(
        nodeMap[link.source.id],
        nodeMap[link.target.id],
        Math.sqrt(link.value),
        linkColour(link, style)))
    const nodes = data.nodes.map(d => nodeMap[d.id])
    // Add indicator for node is linked
    links.forEach(link => {
      link.source.linkCount++
      link.target.linkCount++
    })
    //
    // Add separator nodes on links between busy nodes
    //
    const separatorLinks = []
    links.forEach(link => {
      if (link.source.linkCount > busyNodeLinkThreshold && link.target.linkCount > busyNodeLinkThreshold) {
        // //
        // // Create separator node based on source node
        // //
        // const separatorNodeId = link.id + '-separator'
        // const separatorNode = createNode(separatorNodeId, link.source.name, link.source.colour, link.source.size)
        // separatorNode.linkCount = 2
        // nodeMap[separatorNodeId] = separatorNode
        // nodes.push(separatorNode)
        // //
        // // Create link from separator node to target
        // //
        // separatorLinks.push(createLink(
        //   separatorNode,
        //   link.target,
        //   link.strokeWidth,
        //   link.colour))
        // //
        // // Update original link to be from source to separator node
        // //
        // link.target = separatorNode
        link.distance = busyNodeLinkDistanceMultiplier * link.distance
      }
    })
    //
    // Add any separator links to the link array
    //
    separatorLinks.forEach(link => {
      links.push(link)
    })

    // console.log('Nodes: ' + JSON.stringify(nodes))
    // console.log('Links: ' + JSON.stringify(links))
    // console.log('Style: ' + JSON.stringify(style))

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
      // .force('center', d3.forceCenter(width / 2, height / 2))
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

    if (useMarker) {
      addArrowHeads(svg, links)
    }

    // Add a line for each link
    const link = svg.append('g')
      .attr('stroke-opacity', linkStrokeOpacity)
      .selectAll('path')
      .data(simulation.force('link').links())
      .enter().append('svg:path')
      .attr('stroke', d => d.colour)
      .attr('fill', 'none')
      .attr('stroke-width', d => d.strokeWidth)
      .style('marker-end', function (d) {
        return useMarker
          ? 'url(#' + linkMarkerId(d) + ')'
          : null
      })

    // Add a circle for each node.
    const node = svg.append('g')
      .attr('stroke', nodeStroke)
      .attr('stroke-width', nodeStrokeWidth)
      .selectAll()
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.colour)
      .on('mouseover', nodeMouseover)
      .on('mouseout', nodeMouseout)
      .on('click', nodeClick)

    // Add a title for each node.
    title = svg.append('g')
      .selectAll()
      .data(nodes)
      .enter()
      .append('text')
      .classed(nodeLabelClass, true)
      .classed(labelVisibilityClass[showAllNodeLabels], true)
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

    // Create a node data object
    /**
     * Create a node data object
     * @param {*} id
     * @param {*} name
     * @param {*} colour
     * @param {*} size
     * @returns Node object
     */
    function createNode (id, name, colour, size) {
      return {
        id,
        originalId: id,
        name,
        colour,
        strokeWidth: nodeStrokeWidth,
        stroke: nodeStroke,
        radius: circleRadius(size, style),
        linkCount: 0
      }
    }
    //
    /**
     *
     * @param {Object} source
     * @param {Object} target
     * @param {integer} strokeWidth
     * @param {*} colour
     * @returns
     */
    function createLink (source, target, strokeWidth, colour) {
      return {
        id: source.id + target.id,
        source,
        target,
        strokeWidth,
        colour,
        distance: linkDistance + source.radius + target.radius
      }
    }
    // Determine radius of circle
    function circleRadius (size, style) {
      const minRadius = style['Node Minimum Radius'] || 5
      const maxRadius = style['Node Maximum Radius'] || 500
      return size ? Math.min(Math.max(size, minRadius), maxRadius) : minRadius
    }
    //
    // Repositioning strength of node depending on whether the node is linked
    //
    // The strength determines how much to increment the node’s x-velocity: (x - node.x) × strength.
    // For example, a value of 0.1 indicates that the node should move a tenth of the way from its current x-position
    // to the target x-position with each application.
    // Higher values moves nodes more quickly to the target position, often at the expense of other forces or constraints.
    // A value outside the range [0,1] is not recommended.
    // See https://github.com/d3/d3-force#positioning
    //
    // Linked nodes have a zero strength so rely on other forces alone
    //
    function nodeRepositionStrength (node, style) {
      const linkedStrength = style['Linked Node Cluster Repositioning Strength']
      const unlinkedStrength = style['Unlinked Node Cluster Repositioning Strength']
      return node.linkCount
        ? linkedStrength || (linkedStrength === 0 ? 0 : 0.1)
        : unlinkedStrength || (unlinkedStrength === 0 ? 0 : 0.1)
    }

    // Force centre X coordinate for node depending on whether the node is linked
    // Linked nodes are positioned in the centred
    function nodeForceCentreX (node, style) {
      const xPos = style['Unlinked Node Cluster x']
      return node.linkCount ? style.width / 2 : xPos || (xPos === 0 ? 0 : 100)
    }

    // The charge for all nodes depending on whether the node is linked
    // Unlinked nodes attract each other
    function nodeCharge (node, style) {
      const linkedStrength = style['Linked Node Force Strength']
      const unlinkedStrength = style['Unlinked Node Force Strength']
      return node.linkCount
        ? linkedStrength || (linkedStrength === 0 ? 0 : -40)
        : unlinkedStrength || (unlinkedStrength === 0 ? 0 : 1)
    }

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked () {
      link.attr('d', function (d) {
        const dx = d.target.x - d.source.x
        const dy = d.target.y - d.source.y
        const pathLength = Math.sqrt(dx * dx + dy * dy)

        // x and y distances from center to outside edge of target circle
        // Also move back to start of marker to avoid thick lines appearing underneath point of arrow
        const effectiveRadius = d.target.radius + markerOffset * d.strokeWidth + nodeStrokeWidth / 2
        const offsetX = (Math.abs((dx / pathLength) * effectiveRadius) - 0.5) * Math.sign(dx)
        const offsetY = (Math.abs((dy / pathLength) * effectiveRadius) - 0.5) * Math.sign(dy)

        // Path from centre of source circle to edge of target circle
        if (curvedLinks) {
          const curveRadius = pathLength * (effectiveRadius / d.target.radius)
          return 'M' + d.source.x + ',' + d.source.y +
           'A' + curveRadius + ',' + curveRadius + ' 0 0 1,' + (d.target.x - offsetX) + ',' + (d.target.y - offsetY)
        } else {
          return 'M' + d.source.x + ',' + d.source.y + 'A0,0 0 0 1,' + (d.target.x - offsetX) + ',' + (d.target.y - offsetY)
        }
      })

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      title
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    }

    function separation (centreX, centreY, x, y) {
      const dx = centreX - x
      const dy = centreY - y
      return Math.sqrt(dx * dx + dy * dy)
    }

    function nodeMouseover (event, hoverNode) {
      if (showNodeLabelsCode === showNodeLabelsNear) {
        //
        // If show label mode is to show labels near current node
        // make nearby node labels visible
        //
        title
          .filter(d => separation(hoverNode.x, hoverNode.y, d.x, d.y) < showNodeLabelSeparation)
          .classed(labelVisibilityClass.false, false)
          .classed(labelVisibilityClass.true, true)
      }
      if (showNodeLabelsCode === showNodeLabelsNone) {
        //
        // If show label mode is to hide all labels
        // then add a tooltip for the current node
        //
        node
          .filter(d => d.id === hoverNode.id)
          .append('title')
          .text(d => d.name)
      }
      config.functions.updateOutput('hoverNode', hoverNode.originalId)
    }

    function nodeMouseout (event, hoverNode) {
      if (showNodeLabelsCode === showNodeLabelsNear) {
        //
        // If show label mode is to show labels near current node
        // make all node labels invisible
        // current node may have been dragged so previously nearby nodes
        // may not be nearby any more
        //
        title
          .classed(labelVisibilityClass.true, false)
          .classed(labelVisibilityClass.false, true)
      }
      if (showNodeLabelsCode === showNodeLabelsNone) {
        //
        // If show label mode is to hide all labels
        // then remove tooltip from the current node
        //
        node
          .filter(d => d.id === hoverNode.id)
          .selectChild()
          .remove()
      }
    }

    function nodeClick (event, d) {
      config.functions.performAction('Node Click', d.originalId, event)
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

  /**
   *
   * @param {*} svg The SVG element to append the marker definitions to
   * @param {*} links The array of links containing colour definition
   * @returns
   */
  function addArrowHeads (svg, links) {
    const markerPathName = markerName + 'Path'
    const defs = svg.append('svg:defs')
    defs.append('svg:path')
      .attr('id', markerPathName)
      .attr('d', 'M0,-' + markerSize / 2 + 'L' + markerSize + ',0L0,' + markerSize / 2)
    const markerTemplate = defs
      .append('svg:marker')
      .attr('id', markerName)
      .attr('viewBox', '0 -' + markerSize / 2 + ' ' + markerSize + ' ' + markerSize)
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('markerWidth', markerSize)
      .attr('markerHeight', markerSize)
      .attr('markerUnits', 'strokeWidth')
      .attr('orient', 'auto')
      .attr('opacity', linkStrokeOpacity)
    markerTemplate
      .append('svg:use')
      .attr('href', '#' + markerPathName)
    const colouredMarkers = {}
    links.forEach(link => {
      const markerId = linkMarkerId(link)
      if (!colouredMarkers[markerId]) {
        const cloneMarker = markerTemplate.node().cloneNode(true)
        cloneMarker.id = markerId
        cloneMarker.setAttribute('fill', link.colour)
        defs.node().appendChild(cloneMarker)
        colouredMarkers[markerId] = cloneMarker
      }
    })

    return defs
  }

  /**
   * Return the identity of the marker definition for the link
   * @param {*} link Definition of link
   * @returns the identity of the marker definition for the link
   */
  function linkMarkerId (link) {
    return markerName + '_' + link.colour.toString()
  }
  /**
   * Handle change to input.
   * Show / hide node labels
   * @param {String} name name of input
   * @param {*} value number
   */
  function inputChanged (name, value) {
    try {
      if (superInputChanged !== inputChanged) {
        superInputChanged(name, value)
      }
      console.log('Input Changed - name: ' + name + ', value: ' + value)

      if (name === 'showLabels') {
        showAllNodeLabels = showLabels(value)
        showNodeLabelsCode = value
        title
          .classed(labelVisibilityClass[!showAllNodeLabels], false)
          .classed(labelVisibilityClass[showAllNodeLabels], true)
      }
    } catch (e) {
      const errorMessage = e.name + ': ' + e.message
      //
      // Report error to MooD BA
      //
      config.functions.errorOccurred(errorMessage)
    }
  }

  /**
   * Converts numeric input value into Boolean to workaround
   * bug in MooD that will not change an input back to its initial value.
   * Thus for Boolean with only two values, after changing once it
   * will not change it back
   * @param {integer} inputValue Value input to visualisation
   * @returns Whether to show labels (true) or not (false)
   */
  function showLabels (inputValue) {
    return inputValue === showNodeLabelsAll
  }
}
