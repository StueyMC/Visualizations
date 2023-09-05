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
  // const style = config.style
  const width = parseFloat(config.width)
  const height = parseFloat(config.height)
  // const animation = config.animation
  const data = config.data
  //
  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.
  //
  const links = data.links.map(link => ({ source: link.source.id, target: link.target.id, value: link.value }))
  const nodes = data.nodes.map(d => ({ ...d }))

  // Create a simulation with several forces.
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked)

  const el = d3.select('#' + config.element)
  // Create the SVG container.
  const svg = el
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;')
  // .attr('width', width + margin.left + margin.right)
  // .attr('height', height + margin.top + margin.bottom)
  // .append('g')
  // .attr('transform',
  //   'translate(' + margin.left + ',' + margin.top + ')')

  // Add a line for each link, and a circle for each node.
  const link = svg.append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll()
    .data(links/* .map(link => {return {source: link.source.id, target: link.target.id, value: link.value}}) */)
    .join('line')
    .attr('stroke-width', d => Math.sqrt(d.value))

  const node = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll()
    .data(nodes)
    .join('circle')
    .attr('r', 5)
    .attr('fill', d => d.colour)

  node.append('title')
    .text(d => d.name)

  // Add a drag behavior.
  node.call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended))

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

  // When this cell is re-run, stop the previous simulation. (This doesn’t
  // really matter since the target alpha is zero and the simulation will
  // stop naturally, but it’s a good practice.)
  // invalidation.then(() => simulation.stop());

  return svg.node()
}
