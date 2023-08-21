import * as d3 from 'd3'
// A good example:          https://www.d3indepth.com/force-layout/  https://observablehq.com/@d3/force-directed-graph
// and explained            http://www.d3noob.org/2013/03/d3js-force-directed-graph-example-basic.html
// filtering example:       http://jsfiddle.net/zhanghuancs/cuYu8/
// static tree example:     http://bl.ocks.org/d3noob/8323795
// Force hierarchy example: http://bl.ocks.org/mbostock/1138500

// TODO - why has the text shadow stopped working? only seems to work on chrome
// TODO - make this a class rather than globals.

let chartWidth = 800
let chartHeight = 600
let svg, mainGroup, force, nodes, paths, markers
let curvedLinks
let config
let radiusScale
const relSizeNode = 1
const relSizeRelationship = 0.5
const circleStrokeWidth = 3
const edgeStrokeWidth = 2
const markerSize = 5
const markerName = 'arrow'
const markerOffset = markerSize - 1

const seedRandom = function (i) {
  let mW = 123456789
  let mZ = 987654321
  const mask = 0xffffffff

  mW = (123456789 + i) & mask
  mZ = (987654321 - i) & mask

  Math.random = function () {
    // Returns number between 0 (inclusive) and 1.0 (exclusive), just like Math.random().
    mZ = (36969 * (mZ & 65535) + (mZ >> 16)) & mask
    mW = (18000 * (mW & 65535) + (mW >> 16)) & mask
    let result = ((mZ << 16) + (mW & 65535)) >>> 0
    result /= 4294967296
    return result
  }
}

/// //////////////////////////////////////////////////////////////////////////
// This is the entry point.
export function createForceLayout (_config) {
  config = _config

  // Monkey patch Math.Random so we always get the same graph.
  seedRandom(42)

  // The data shape we are looking for:
  // var dataset = {
  //         nodes: [
  //         { name: "Vision", id: "Vision", color: "red", radius: 40, strokeWidth: 3, stroke: "#000" }
  //     ], edges: [
  //         { sourceId: "Customers", targetId: "Goals", label: "", stroke: "#000", strokeWidth: 2 }
  //     ]
  // }

  const convertedData = {
    nodes: [],
    edges: []
  }

  chartWidth = parseInt(config.width, 10)
  chartHeight = parseInt(config.height, 10)
  curvedLinks = config.style['Curved Links'] === undefined ? true : config.style['Curved Links']

  createNodesFromMooDData(config.data.meta, convertedData.nodes)
  createEdgesFromMooDData(config.data.meta, convertedData.edges)

  /* Check for consistent incoming data.
    for(var i=0;i<convertedData.edges.length;i++){
        if(undefined===convertedData.nodes.find(n=>n.id===convertedData.edges[i].sourceId)){
            console.log("Missing node: "+convertedData.edges[i].sourceId)
        }

        if(undefined===convertedData.nodes.find(n=>n.id===convertedData.edges[i].targetId)){
            console.log("Missing node: "+convertedData.edges[i].targetId)
        }
    } */

  convertedData.edges = convertedData.edges.filter(e => undefined !== convertedData.nodes.find(n => n.id === e.sourceId) &&
                                                         undefined !== convertedData.nodes.find(n => n.id === e.targetId))

  createRadiusScale(convertedData.nodes)

  onDataLoaded(convertedData)
}

const createNode = function (d) {
  d.strokeWidth = circleStrokeWidth
  d.stroke = config.style['Node Line Colour']

  d.radius = 0
  if (d.size !== undefined && d.size != null) {
    d.radius = d.size
  }

  if (d.color === undefined || d.color == null) {
    d.color = config.style['Node Colour']
  }
}

function createNodesFromMooDData (meta, convertedNodes) {
  for (let i = 0; i < meta.aliases.length; i++) {
    const d = meta.aliases[i]

    // The ability to remove nodes
    if (config.style['Ignore Nodes'].find(x => x === d.name) || config.style['Ignore Nodes'].find(x => x === d.id)) {
      continue
    }

    if (d.type === 'element relationship') {
      d.size = relSizeRelationship
      d.color = config.style['Relationship Colour']
    } else {
      d.size = relSizeNode
    }
    createNode(d)
    convertedNodes.push(d)
  }
}

function createEdgesFromMooDData (meta, convertedData) {
  for (let i = 0; i < meta.aliases.length; i++) {
    const alias = meta.aliases[i]

    // Add in links from relationships to their targets.
    if (alias.allowed_aliases !== undefined) {
      for (let a = 0; a < alias.allowed_aliases.length; a++) {
        const targetAlias = alias.allowed_aliases[a]
        convertedData.push({ sourceId: alias.id, targetId: targetAlias.id, label: '', stroke: config.style['Edge Colour'], strokeWidth: edgeStrokeWidth })
      }
    }

    // Add in links from an alias to the relationship alias.
    if (alias.fields !== undefined) {
      for (let j = 0; j < alias.fields.length; j++) {
        const field = alias.fields[j]
        if (field.relationship_alias_id !== null) {
          convertedData.push({ sourceId: alias.id, targetId: field.relationship_alias_id, label: '', stroke: config.style['Edge Colour'], strokeWidth: 2 })
        }
      }
    }
  }
}

function createRadiusScale (nodes) {
  let minRadius = Math.min.apply(Math, nodes.map(n => n.radius))
  let maxRadius = Math.max.apply(Math, nodes.map(n => n.radius))

  if (isNaN(minRadius)) { minRadius = 0 }
  if (isNaN(maxRadius)) { maxRadius = 0 }

  radiusScale = d3.scaleLinear()
    .domain([minRadius, maxRadius])
    .range([config.style['Min Node Size'], config.style['Max Node Size']])
}

function NodeRadius (node) { if (isNaN(node.radius)) { node.radius = 0 }; return radiusScale(node.radius) }
function NodeColor (node) { return node.color }
function NodeImage (node) { return node.image }

function onDataLoaded (dataset) {
  CreateChart(dataset, tick)

  mainGroup = svg.append('svg:g')

  paths = mainGroup.append('svg:g')
    .attr('fill', 'none')
    .selectAll('path')
    .data(force.force('link').links())
    .enter().append('svg:path')
  // .attr("class", function (d) { return "link " + d.type; })
    .style('stroke', function (e) { return e.stroke })
    .style('stroke-width', function (e) { return e.strokeWidth })
    .style('marker-end', function (d) {
      return typeof (markers) === 'undefined'
        ? null
        : 'url(#' + markerName + ')'
    }) // Works on Chrome, removes links from IE.

  nodes = mainGroup.append('svg:g')
    .selectAll('circle')
    .data(force.nodes())
    .enter().append('svg:circle')
    .attr('r', function (d, i) { return NodeRadius(d) })
    .style('fill', function (d, i) { return NodeColor(d) })
    .style('stroke-width', function (d) { return d.strokeWidth })
    .style('stroke', function (d) { return d.stroke })
  // MAYBE? .attr("text", function (d) { return d.text; })
    .call(drag(force))

  // MJD TODO doesn't work
  // nodes.on("dblclick",function(d){ alert("node was double clicked"); })

  const text = mainGroup.append('svg:g')
    .selectAll('g')
    .data(force.nodes())
    .enter().append('svg:g')
    .attr('class', 'nodeText')

  // A copy of the text with a thick white stroke for legibility.
  text.append('svg:text')
    .attr('x', 0)
    .attr('y', '.31em')
    .attr('class', 'shadow')
    .attr('color', '#f00')
    .attr('text-anchor', 'middle')
  // .attr("width", function (d) { return d.radius; })
    .text(function (d) { return d.name })

  text.append('svg:text')
    .attr('x', 0)
    .attr('y', '.31em')
    .attr('text-anchor', 'middle')
  // .attr("width", function (d) { return d.radius; })
    .text(function (d) { return d.name })

  if (config.style['Show Icons'] === true) {
    text.append('svg:image')
    // .attr("width",16)
    // .attr("height",16)
      .attr('href', function (d, i) { return NodeImage(d) })
  }

  // We don't want to see the initial animation (e.g. when inside Business Architect)
  for (let i = 0; i < 200; ++i) force.tick()

  const minZoom = 0.1
  const maxZoom = 5
  const zoom = d3.zoom().scaleExtent([minZoom, maxZoom])

  zoom.on('zoom', function (event) {
    // Panning and zooming
    mainGroup.attr('transform', event.transform)
  })

  // zoom.on("dblclick.zoom", null)

  svg.call(zoom)
  // svg.style("cursor","move")

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick () {
    // keep in bounding box? http://mbostock.github.io/d3/talk/20110921/bounding.html
    // nodes.attr("cx", function (d) { return d.x = Math.max(NodeRadius(d), Math.min(chartWidth - NodeRadius(d), d.x)); })
    //    .attr("cy", function (d) { return d.y = Math.max(NodeRadius(d), Math.min(chartHeight - NodeRadius(d), d.y)); })
    // nodes.attr("cx", function (d) { return d.x = Math.max(NodeRadius(d), d.x); })
    //     .attr("cy", function (d) { return d.y = Math.max(NodeRadius(d), d.y); })

    nodes.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')' })

    paths.attr('d', function (d) {
      const dx = d.target.x - d.source.x
      const dy = d.target.y - d.source.y
      const pathLength = Math.sqrt(dx * dx + dy * dy)

      // x and y distances from center to outside edge of target circle
      const offsetX = (dx * (radiusScale(d.target.radius) + circleStrokeWidth / 2)) / pathLength
      const offsetY = (dy * (radiusScale(d.target.radius) + circleStrokeWidth / 2)) / pathLength

      // Path from centre of source circle to edge of target circle
      if (curvedLinks) {
        return 'M' + d.source.x + ',' + d.source.y + 'A' + pathLength + ',' + pathLength + ' 0 0 1,' + (d.target.x - offsetX) + ',' + (d.target.y - offsetY)
      } else {
        return 'M' + d.source.x + ',' + d.source.y + 'A0,0 0 0 1,' + (d.target.x - offsetX) + ',' + (d.target.y - offsetY)
      }
    })

    text.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })

    // AdjustScrollbar()
  }
}

/* var AdjustScrollbar = function(){
    // Update the svg width/height so we get an appropriate scroll bar.
    var bbox = svg.node().getBBox()
    svg.attr("width",Math.max(bbox.x+bbox.width,chartWidth))
    svg.attr("height",Math.max(bbox.y+bbox.height,chartHeight))
} */

function CreateChart (dataset, onTick) {
  // transform from ids to nodes.
  const hashLookup = []
  dataset.nodes.forEach(function (d, i) {
    hashLookup[d.id] = d
  })

  dataset.edges.forEach(function (d, i) {
    d.source = hashLookup[d.sourceId]
    d.target = hashLookup[d.targetId]
  })

  force = d3.forceSimulation()
    .nodes(dataset.nodes)
    .force('link', d3.forceLink()
      .id(function (d) { return d.id })
      .distance(config.style['Min Link Length'])
      .iterations(1)
      .strength(1)
      .links(dataset.edges))
    .force('charge', d3.forceManyBody()
      .strength(-750)
      .distanceMin(1)
      .distanceMax(1000)
    )
    .force('collide', d3.forceCollide()
      .strength(0.7)
      .radius(function (d) { return radiusScale(d.radius) + config.style['Node Stand Off'] })
      .iterations(1)
    )
    .force('center', d3.forceCenter()
      .x(chartWidth * 0.5)
      .y(chartHeight * 0.5)
    )
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .on('tick', onTick)

  force.alpha(0.5).restart()

  svg = d3.select('#' + config.element)
    .append('svg:svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)

  addArrowHeads()
}

// This has stopped working.
function addArrowHeads () {
  // Add in a marker for arrow heads (TODO only works on Chrome)
  // But seem to appear on IE when we filter something out and then in (but in the wrong place)
  // There are several posts confirming this.

  if (navigator.appName === 'Microsoft Internet Explorer') {
    return // Taken from http://msdn.microsoft.com/en-us/library/ie/ms537509(v=vs.85).aspx
  }

  markers = svg.append('svg:defs')
    .append('svg:marker')
    .attr('id', markerName)
    .attr('viewBox', '0 -' + markerSize / 2 + ' ' + markerSize + ' ' + markerSize)
    .attr('refX', markerOffset)
    .attr('refY', 0)
    .attr('markerWidth', markerSize)
    .attr('markerHeight', markerSize)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-' + markerSize / 2 + 'L' + markerSize + ',0L0,' + markerSize / 2)
    .attr('fill', config.style['Edge Colour'])
}

function drag (simulation) {
  function dragStarted (event) {
    if (!event.active) simulation.alphaTarget(0.01).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
    // Prevent panning when we click on a node.
    // event.sourceEvent.stopPropagation()
  }

  function dragged (event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragEnded (event) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }

  return d3.drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded)
}
