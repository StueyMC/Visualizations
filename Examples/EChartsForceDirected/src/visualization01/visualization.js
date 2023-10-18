//
// Refer to the following guide on importing packages to keep the bundle size to a minimum:
// https://apache.github.io/echarts-handbook/en/basics/import#importing-required-charts-and-components-to-have-minimal-bundle
//
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
// Import charts, all suffixed with Chart
import { GraphChart } from 'echarts/charts'
// Import the Canvas renderer
// Note that introducing the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers'

// Import the tooltip and legend components
// all suffixed with Component
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'

import {
  LabelLayout
} from 'echarts/features'
// Features like Universal Transition and Label Layout
// import { LabelLayout, UniversalTransition } from 'echarts/features'

// Register the required components
echarts.use([
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GraphChart,
  CanvasRenderer,
  LabelLayout
])

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

//
// Entry function declaration
//

/**
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
  // const inputs = config.inputs
  // const style = config.style
  const seriesData = {}
  const flatData = []
  const superInputChanged = config.functions.inputChanged
  let chart
  let option
  try {
    // Monkey patch Math.Random so we always get the same graph.
    seedRandom(42)

    const containerWidth = parseFloat(config.width)
    const containerHeight = parseFloat(config.height)

    config.functions.inputChanged = inputChanged

    // buildData(config.data, seriesData, flatData)

    // const treeDepth = config.inputs.maxDepth || 2
    // console.log('Initial depth = ' + treeDepth)
    // expand(flatData, treeDepth)

    const el = document.getElementById(config.element)
    //
    // This based on the ECharts Radial Tree chart - https://echarts.apache.org/examples/en/editor.html?c=tree-radial
    //
    chart = echarts.init(el, null, { renderer: 'canvas', width: containerWidth, height: containerHeight })

    const graph = config.data
    const nodes = graph.nodes.map(function(node) {
      return {
        id: node.id,
        x: 0,
        y: 0,
        fixed: false,
        name: node.name,
        symbolSize: node.symbolSize,
        value: node.value,
        category: node.category
      }
    })
    const links = graph.links
    const categories = graph.categories
    graph.nodes.forEach(function (node) {
      node.label = {
        show: node.symbolSize > 30
      };
    });
    option = {
      title: {
        text: 'Les Miserables',
        subtext: 'Default layout',
        top: 'bottom',
        left: 'right'
      },
      tooltip: {},
      legend: [
        {
          // selectedMode: 'single',
          data: graph.categories.map(function (a) {
            return a.name;
          })
        }
      ],
      animationDuration: 1500, //3500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          name: 'Les Miserables',
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          categories: categories,
          roam: false,
          label: {
            position: 'right',
            formatter: '{b}'
          },
          lineStyle: {
            color: 'source',
            curveness: 0.1
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 10
            }
          },
          edgeSymbol: ['none', 'arrow'], // start and end of link line markers. Alternative is 'circle'
          force: {
            initLayout: 'force',
            repulsion: 0.1 ,
            gravity: 10 ,
            edgeLength: 0.55 ,
            layoutAnimation: false
            // friction: 0.1
          }
        }
      ]
    };
    chart.setOption(option)
  } catch (e) {
    //
    // Write error message to the canvas
    //
    const el = document.getElementById(config.element)
    let errorMessage = e.name + ': ' + e.message
    if ('stack' in e) {
      errorMessage += '\n\nStack:\n' + e.stack
    }
    if ('lineNumber' in e && 'fileName' in e) {
      errorMessage += 'At ' + e.fileName + ':' + e.lineNumber
    }

    const errorEl = document.createElement('text')
    errorEl.style.margin = 'auto'
    errorEl.style.textAlign = 'center'
    errorEl.style.display = 'block'
    errorEl.innerText = errorMessage
    el.appendChild(errorEl)
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }

  /**
   * Handle change to input.
   * Maximum tree depth
   * @param {String} name name of input
   * @param {*} value number
   */
  function inputChanged (name, value) {
    superInputChanged(name, value)
    console.log('name: ' + name + ', value: ' + value)

    let newDepth

    if (name === 'maxDepth') {
      // ensure depth is between 1 and 4
      newDepth = Math.max(Math.min(value, 4), 1)
      expand(flatData, newDepth)
      collapse(flatData, newDepth)
      chart.setOption(option)
    }

    return true
  }
}

/**
 * Extract the data passed in to the visualization and transform into tree series data
 * @param {*} moodData Data from MooD
 * @param {*} seriesData The object to be populated with data for the tree chart
 * @param {*} flatData An array that will be populated with all the nodes in the chart
 * @return {*} tree series data
 */
function buildData (moodData, seriesData, flatData) {
  const nodeDictionary = {}
  function flatNode (nodeParam, levelParam) {
    return {
      node: nodeParam,
      level: levelParam
    }
  }

  function hierarchicalNode (link) {
    const node = { name: link.target.name }
    if (link.target.value) {
      node.value = link.target.value
    }
    return node
  }

  function processLink (link, level) {
    const seriesNode = hierarchicalNode(link)
    nodeDictionary[link.target.key] = seriesNode
    const parentNode = nodeDictionary[link.source.key]
    if (!parentNode) {
      throw new Error('The parent of Node: "' + link.target.name + '" is not known')
    }
    if (parentNode.children === undefined) {
      parentNode.children = []
    }
    parentNode.children.push(seriesNode)
    flatData.push(flatNode(seriesNode, level))
  }

  seriesData.name = moodData.rootNode.name
  seriesData.children = []

  nodeDictionary[moodData.rootNode.key] = seriesData
  flatData.push(flatNode(seriesData, 0, false))

  //
  // Process array data in data properties level<N>Relationship
  //
  let key
  const linkLevelPropertyPrefix = 'level'
  for (key in moodData) {
    if (Object.prototype.hasOwnProperty.call(moodData, key) &&
       key.startsWith(linkLevelPropertyPrefix)) {
      const level = parseInt(key.substring(5))
      if (Array.isArray(moodData[key])) {
        moodData[key].forEach(link => processLink(link, level))
      } else {
        throw new Error('Data for ' + key + ' is not an array')
      }
    }
  }

  return seriesData
}

function collapse (flatData, maxLevel) {
  flatData.filter(node => node.level >= maxLevel).forEach(function (node) { node.node.collapsed = true })
}

function expand (flatData, maxLevel) {
  flatData.filter(node => node.level < maxLevel).forEach(function (node) { node.node.collapsed = false })
}
