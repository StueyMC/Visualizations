import * as d3 from 'd3'
import 'd3-interpolate'

export function setUpEnvironment (config) {
  d3.select('#' + config.element).append('svg').attr('width', parseFloat(config.width)).attr('height', parseFloat(config.height))
  Array.from(arguments).slice(1).forEach(d => d3.select(d.parent).append('g').attr('id', d.id).attr('transform', d.transform))
}
export function drawDiagram (stretchedChord) {
  d3.select('#links').selectAll('*').remove()
  d3.select('#LHS').selectAll('*').remove()
  d3.select('#RHS').selectAll('*').remove()
  d3.select('#L').selectAll('*').remove()
  d3.select('#R').selectAll('*').remove()

  const innerRadius = stretchedChord._innerRadius
  const outerRadius = stretchedChord._outerRadius

  drawLinks()
  drawLHSnode()
  drawRHSnodes()
  addLHSlabel()
  addRHSlabels()

  function drawLinks () {
    d3.select('#links').selectAll().data(stretchedChord._links).enter().append('path')
      .attr('d', d => link(d))
      .style('fill', d => 'url(#' + (compareID(d) ? 'r' : 'l') + d.criticality.slice(1) + ')')
      .style('opacity', 0.8)

    function compareID (d) {
      stretchedChord._LHSnode.forEach(function (_LHSnode) {
        if (_LHSnode.id === d.source.id) {
          return true
        }
      })
      return false
    }
  }
  function drawLHSnode () {
    d3.select('#LHS').selectAll().data(stretchedChord._LHSnode).enter().append('path')
      .attr('id', d => 'n_' + d.id)
      .attr('name', d => d.name)
      .attr('d', d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      .style('fill', d => d.criticality)
      .style('stroke', d => d.stroke)
      .style('stroke-width', '2px')
      .style('opacity', 1)
      .style('cursor', 'pointer')
    // .enter().append('path')
    //   .attr('id', d => 'n_' + d.id)
    //   .attr('name', d => d.name)
    //   .attr('d', d3.arc().innerRadius(2 * stretchedChord._width / 5).outerRadius(stretchedChord._width / 2).startAngle(Math.PI + Math.acos(stretchedChord._height / stretchedChord._width)).endAngle(2 * Math.PI - Math.acos(stretchedChord._height / stretchedChord._width)))
    //   .style('fill', d => d.criticality)
    //   .style('stroke', d => d.stroke)
    //   .style('stroke-width', '2px')
    //   .style('opacity', 1)
    //   .style('cursor', 'pointer')
  }
  function drawRHSnodes () {
    d3.select('#RHS').selectAll().data(stretchedChord._RHSnodes).enter().append('path')
      .attr('id', d => 'n_' + d.id)
      .attr('name', d => d.name)
      .attr('d', d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      .style('fill', d => d.criticality)
      .style('stroke', d => d.stroke)
      .style('stroke-width', '2px')
      .style('opacity', 1)
      .style('cursor', 'pointer')
  }
  function link (link) {
    const q1 = [innerRadius * Math.sin(link.source.startAngle), -innerRadius * Math.cos(link.source.startAngle)]
    const q2 = [innerRadius * Math.sin(link.source.startAngle), -innerRadius * Math.cos(link.source.startAngle)]
    const q3 = [innerRadius * Math.sin(link.source.endAngle), -innerRadius * Math.cos(link.source.endAngle)]
    const q4 = [innerRadius * Math.sin(link.source.endAngle), -innerRadius * Math.cos(link.source.endAngle)]
    const q5 = [innerRadius * Math.sin(link.target.endAngle), -innerRadius * Math.cos(link.target.endAngle)]
    const q6 = [innerRadius * Math.sin(link.target.endAngle), -innerRadius * Math.cos(link.target.endAngle)]
    const q7 = [innerRadius * Math.sin(link.target.startAngle), -innerRadius * Math.cos(link.target.startAngle)]
    const q8 = [innerRadius * Math.sin(link.target.startAngle), -innerRadius * Math.cos(link.target.startAngle)]

    return 'M' + q2.join(' ') + 'L' + q3.join(' ') + 'L' + q4.join(' ') + 'Q 0 ' + (q4[1] + q5[1]) / 4 + ' ' + q5.join(' ') +
            'L' + q6.join(' ') + 'L' + q7.join(' ') + 'L' + q8.join(' ') + 'Q 0 ' + (q1[1] + q8[1]) / 4 + ' ' + q1.join(' ')
  }
  function addLHSlabel () {
    d3.select('#LHS').selectAll('path').each(function (d) { addLabel(d3.select(this)) })

    function addLabel (path) {
      const offset = getOffset()
      const formattedLabel = getLabelFormatted(path.attr('name'), Math.abs(offset[0]))
      const label = d3.select('#L')
        .append('text')
        .style('alignment-baseline', 'middle')
        .style('text-anchor', 'middle')

      if (!(isNaN(offset.x) || isNaN(offset.y))) {
        label.attr('transform', 'translate(' + (offset[0] / 2) + ',' + (offset[1] - (7.5 * formattedLabel.length)) + ')')
      }

      formattedLabel.forEach(d => label.append('tspan').text(d).attr('x', 0).attr('dy', 15))

      function getOffset () {
        const center = d3.arc().innerRadius(stretchedChord._width / 2).outerRadius(stretchedChord._width / 2).centroid(path.datum())

        return [center[0] * 0.85 - stretchedChord._width / 2, center[1] * 0.95]
      }
    }
  }
  function addRHSlabels () {
    d3.select('#RHS').selectAll('path').each(function (d) { addLabel(d3.select(this)) })

    function addLabel (path) {
      const offset = getOffset()
      const formattedLabel = getLabelFormatted(path.attr('name'), Math.abs(offset[0]))
      const label = d3.select('#R')
        .append('text')
        .attr('transform', 'translate(' + (offset[0] / 2) + ',' + (offset[1] - (7.5 * formattedLabel.length)) + ')')
        .style('alignment-baseline', 'middle')
        .style('text-anchor', 'middle')

      formattedLabel.forEach(d => label.append('tspan').text(d).attr('x', 0).attr('dy', 15))

      function getOffset () {
        const center = d3.arc().innerRadius(stretchedChord._width / 2).outerRadius(stretchedChord._width / 2).centroid(path.datum())

        return [center[0] * 0.85 - stretchedChord._width / 2, center[1] * 0.95]
      }
    }
  }
}

export function createGradients (stretchedChord) {
  stretchedChord._links.forEach(function (d) {
    const col = d.criticality.slice(1); const dir = d.source.id === stretchedChord._LHSnode[0].id ? 'r' : 'l'
    if (!d3.select('#' + dir + col).node()) (dir === 'l' ? leftGradient : rightGradient)(d, d3.select('#defs').append('linearGradient').attr('id', dir + col))
  })
}

export function addInteractivity (functions, stretchedChord) {
  d3.select('#LHS').selectAll('path')
    .on('mouseover', nodeMouseover(functions.updateOutput))
    .on('mouseleave', nodeMouseleave)
    .on('click', nodeClick(functions.performAction, 'Source'))

  d3.select('#RHS').selectAll('path')
    .on('mouseover', nodeMouseover(functions.updateOutput))
    .on('mouseleave', nodeMouseleave)
    .on('click', nodeClick(functions.performAction, 'Target'))

  d3.select('#links').selectAll('path')
    .on('mouseover', linkMouseover(stretchedChord, functions.updateOutput))
    .on('mouseleave', linkMouseleave)
    .on('click', linkClick(functions.performAction))
}

function rightGradient (link, grad) {
  grad.append('stop').attr('offset', '-50%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '-.5;0').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '-25%').attr('stop-color', link.criticality).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '-.25;.25').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '0%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '0;.5').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '25%').attr('stop-color', link.criticality).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '0.25;.75').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '50%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '.5;1').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '75%').attr('stop-color', link.criticality).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '.75;1.25').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '100%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '1;1.5').attr('dur', '5s').attr('repeatCount', 'indefinite')
}

function leftGradient (link, grad) {
  grad.append('stop').attr('offset', '0%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '0;-.5').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '25%').attr('stop-color', link.criticality).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '.25;-.25').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '50%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '.5;0').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '75%').attr('stop-color', link.criticality).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '.75;.25').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '100%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '1;.5').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '125%').attr('stop-color', link.criticality).attr('stop-opacity', '1')
    .append('animate').attr('attributeName', 'offset').attr('values', '1.25;.75').attr('dur', '5s').attr('repeatCount', 'indefinite')
  grad.append('stop').attr('offset', '150%').attr('stop-color', link.criticality).attr('stop-opacity', '0.7')
    .append('animate').attr('attributeName', 'offset').attr('values', '1.5;1').attr('dur', '5s').attr('repeatCount', 'indefinite')
}

function getLabelFormatted (label, lineLength) {
  d3.select('svg').append('text').attr('id', 'temp')

  let line = []; const lines = []
  let labels = label
  if (typeof labels === 'undefined') {
    return
  } else if (typeof labels === 'string') {
    labels = labels.split(' ')
  } else if (Array.isArray(labels) === false) {
    return
  }

  labels.forEach(function (word) {
    if (d3.select('#temp').text([line, word].flat().join(' ')).node().getComputedTextLength() <= lineLength) line.push(word)
    else {
      if (line.length > 0) lines.push(line.join(' '))
      if (d3.select('#temp').text(word).node().getComputedTextLength() > lineLength) {
        word = word.split('').reduce((total, amount) =>
          d3.select('#temp').text(total[total.length - 1] + amount).node().getComputedTextLength() <= lineLength ? total.slice(0, total.length - 1).concat(total[total.length - 1] + amount) : total.concat(amount),
        [''])
        lines.push(...word.slice(0, word.length - 1))
        word = word[word.length - 1]
      }
      line = [word]
    }
  })

  d3.select('#temp').remove()

  return lines.concat(line.join(' '))
}

function linkMouseover (stretchedChord, updateOutput) {
  return function (d) {
    const center = -(Math.cos(d.source.endAngle) + Math.cos(d.target.endAngle) + Math.cos(d.source.startAngle) + Math.cos(d.target.startAngle)) * 0.07125 * stretchedChord._width

    d3.select('#labels').append('rect').attr('transform', 'translate(0,' + center + ')')
    d3.select('#labels').append('text').text(d.bw)
      .attr('id', 'bandwidth').attr('transform', 'translate(0,' + center + ')')
      .style('alignment-baseline', 'middle').style('text-anchor', 'middle')

    const node = d3.select('#bandwidth').node().getBBox()

    d3.select('#labels').append('rect').attr('transform', 'translate(0,' + center + ')')
      .style('x', -node.width / 2 - 2).style('y', -node.height / 2 - 2).style('rx', 4)
      .style('width', node.width + 4).style('height', node.height + 4)
      .style('fill', '#f2f2f2').style('opacity', 0.9)
      .style('stroke', '#a2a2a2').style('stroke-width', '1px')
      .lower()

    updateOutput('hoverLink', d.id)
  }
}

function linkMouseleave () {
  d3.select('#bandwidth').remove()
  d3.select('#labels').select('rect').remove()
}

function linkClick (performAction) {
  return function (d) {
    performAction('Chord Click', d.id, d3.event)
  }
}

function nodeMouseover (updateOutput) {
  return function (d) {
    d3.select('#links').selectAll('path').style('opacity', l => l.source.id === d.id ? 1 : 0.2)
    updateOutput('hoverNode', d.id)
  }
}

function nodeMouseleave () {
  d3.select('#links').selectAll('path').style('opacity', 0.8)
}

function nodeClick (performAction, from) {
  return function (d) {
    performAction(from + ' Click', d.id, d3.event)
  }
}
