//
// From https://ivis-at-bilkent.github.io/cytoscape.js-fcose/
//
// H. Balci and U. Dogrusoz, “fCoSE: A Fast Compound Graph Layout Algorithm with Constraint Support,” in IEEE Transactions on Visualization and Computer Graphics, 28(12), pp. 4582-4593, 2022.
// U. Dogrusoz, E. Giral, A. Cetintas, A. Civril and E. Demir, “A Layout Algorithm For Undirected Compound Graphs”, Information Sciences, 179, pp. 980-994, 2009.
//
//
// Entry function declaration
//
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import layoutUtilities from 'cytoscape-layout-utilities'

/**
 *
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
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
  //
  // Retrieve configuration
  //

  // const inputs = config.inputs
  // const style = config.style
  // const width = parseFloat(config.width)
  // const height = parseFloat(config.height)
  const superInputChanged = config.functions.inputChanged
  config.functions.inputChanged = inputChanged

  /**
 * Handle change to input.
 * There is only a single input which controls which nodes are highlighted
 * @param {String} name name of input
 * @param {*} value GUID(s) (string or array)
 */
  function inputChanged (name, value) {
    try {
      if (superInputChanged !== inputChanged) {
        superInputChanged(name, value)
      }
      console.log('Input Changed - name: ' + name + ', value: ' + value)

      if (name === 'showLabels') {
        const code = value
      }
    } catch (e) {
      const errorMessage = e.name + ': ' + e.message
      //
      // Report error to MooD BA
      //
      config.functions.errorOccurred(errorMessage)
    }
  }


  
  if (!config.animation) {
    // Sometimes you need to draw differently when inside Business Architect. For example without animations.
  }

  try {

    const el = document.getElementById(config.element)

    const styleSheet = getStylesheet()
    // console.log(JSON.stringify(styleSheet))

    const parentMap = {}
    if (Array.isArray(data.parents)) {
      data.parents.forEach(mapping => {
        parentMap[mapping.child.id] = mapping.parent.id
      })
    }

    if (!Array.isArray(data.nodes)) {
      throw new Error('Node data is not an array')
    }
    const nodes = data.nodes
      .map(node => {
        const retVal = { data: node }
        if (parentMap[node.id]) {
          retVal.data.parent = parentMap[node.id]
        }
        return retVal
      })
    // console.log(JSON.stringify(nodes))

    if (!Array.isArray(data.links)) {
      throw new Error('Edge data is not an array')
    }
    const edges = data.links
      .map(edge => ({ data: {
        id: edge.id,
        source: edge.source.id,
        target: edge.target.id,
        width: edge.width,
        colour: edge.linkColour || edge.source.linkColour || edge.target.linkColour }} ))
    // console.log(JSON.stringify(edges))

    const constraints = getConstraints()

    cytoscape.use(layoutUtilities)
    cytoscape.use(fcose)
    const cy = cytoscape({
      container: el,
      ready: function () {
        // const layoutUtilities = this.layoutUtilities({
        //   desiredAspectRatio: this.width() / this.height()
        // })

        // this.nodes().forEach(function (node) {
        //   const size = node.attr().size || 30 //|| Math.random() * 40 + 30
        //   node.css('width', size)
        //   node.css('height', size)
        // })

        // var defaultOptions = {

        // const keys = []
        // for (let key in this.edges()[0]) {
        //   keys.push({"key": key, "type": typeof(this.edges()[0][key])})
        // }
        // console.log("Keys: " + JSON.stringify(keys.sort((a, b) => a.key < b.key ? 1 : -1))) //.filter(a => a.type !== "function")))
        // console.log(JSON.stringify(this.edges()[0].attr()))
        // console.log("Connections: " + this.nodes()[0].connectedEdges().length)
        // console.log("Size: " + JSON.stringify(this.nodes()[0].size()))


        const layoutOptions = {
          name: 'fcose',
          step: 'all',
          animationEasing: 'ease-out',
          nodeSeparation: 300,
          quality: "proof",
          // Node repulsion (non overlapping) multiplier
          nodeRepulsion: node => 4500 + node.connectedEdges().length * 4000,
          // Ideal edge (non nested) length
          idealEdgeLength: edge => 150,
          // Divisor to compute edge forces
          edgeElasticity: edge => 0.99
        }
        const initialLayout = this.layout( layoutOptions )
        // initialLayout.pon('layoutstart').then(function( event ){
        //   // constraints.fixedNodeConstraint = JSON.parse(JSON.stringify(sample_constraints.fixedNodeConstraint));
        //   // clearConstraintListTable();
        //   // fillConstraintListTableFromConstraints();
        // });
        initialLayout.run()
      },
      layout: { name: 'preset' },
      style: styleSheet,
      elements: {
        nodes,
        edges
      },
      fixedNodeConstraint: constraints.fixedNodeConstraint,
      alignmentConstraint: constraints.alignmentConstraint,
      relativePlacementConstraint: constraints.relativePlacementConstraint
      // pixelRatio: 1.0
      // wheelSensitivity: 0.3
    })

    // cy.layoutUtilities("get").setOption("randomize", finalOptions.randomize);

    cy.on('tap', 'node', function (event) {
      const node = event.target
      config.functions.performAction('Node Click', node.id(), {})
    })

    cy.on('mouseover', 'node', function (event) {
      const node = event.target
      config.functions.updateOutput('hoverNode', node.id())
    })

    cy.on('mouseover', 'edge', function (event) {
      const edge = event.target
      config.functions.updateOutput('hoverLink', edge.id())
    })

    cy.on('tap', 'edge', function (event) {
      const edge = event.target
      config.functions.performAction('Link Click', edge.id(), {})
    })
  } catch (e) {
    const errorMessage = e.name + ': ' + e.message
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }


  function getConstraints () {
    const noConstraints = {
      fixedNodeConstraint: [],
      alignmentConstraint: {
        horizontal: [],
        vertical: []
        },
      relativePlacementConstraint: []
    }

    const sample4Constraints = {
      fixedNodeConstraint: [
        {
          nodeId: 'f1-id',
          position: {
            x: -100,
            y: 0
          }
        },
        {
          nodeId: 'f2-id',
          position: {
            x: 300,
            y: 0
          }
        }
      ],
      alignmentConstraint: {
        horizontal: [
          [
            'h1-id',
            'h2-id',
            'h3-id',
            'h4r-id'
          ]
        ],
        vertical: [
          [
            'v1-id',
            'v2-id',
            'v3-id',
            'v4-id'
          ]
        ]
      },
      relativePlacementConstraint: [
        {
          top: 'r1-id',
          bottom: 'r2-id',
          gap: 150
        },
        {
          left: 'r3-id',
          right: 'h4r-id',
          gap: 150
        }
      ]
    }

    return noConstraints //sample4Constraints
  }


  function getStylesheet () {
    const nodeLabel = (node) => node.attr().name || node.id
    const nodeShape = (node) => node.attr().shape || 'ellipse'
    const nodeSize = (node) => node.attr().size || 40
    const nodeColour = (node) => node.attr().colour || '#bdd3ff'
    const edgeColour = (edge) => edge.attr().colour || '#ffd3d4'
    const edgeWidth = (edge) => edge.attr().width || 1
  
    // define default stylesheet
    const defaultStylesheet = [
      {
        selector: 'node',
        style: {
          'background-color': nodeColour,
          width: nodeSize,
          height: nodeSize,
          shape: nodeShape,
          label: nodeLabel,
          // 'text-valign': 'center',
          'background-opacity': 0.7
        }
      },

      {
        selector: ':parent',
        style: {
          //      'background-opacity': 0.333,
          'background-color': '#e8ffe8',
          'border-color': '#DADADA',
          //      'border-width': 3,
          'text-valign': 'bottom'
        }
      },

      {
        selector: 'edge',
        style: {
          'curve-style': 'unbundled-bezier',
          'target-arrow-shape': 'triangle',
          'line-color': edgeColour,
          'target-arrow-color': edgeColour,
          width: edgeWidth

        }
      },

      {
        selector: 'node:selected',
        style: {
          'background-color': '#33ff00',
          'border-color': '#22ee00'
        }
      },

      {
        selector: 'edge:selected',
        style: {
          'line-color': '#33ff00'
        }
      }
    ]

    return defaultStylesheet
  }
}
