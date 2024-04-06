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
  // const data = config.data
  //
  // Retrieve configuration
  //

  // const inputs = config.inputs
  // const style = config.style
  // const width = parseFloat(config.width)
  // const height = parseFloat(config.height)

  if (!config.animation) {
    // Sometimes you need to draw differently when inside Business Architect. For example without animations.
  }

  const el = document.getElementById(config.element)

  const styleSheet = getStylesheet()
  console.log(JSON.stringify(styleSheet))
  const elements = getElements()
  const nodes = elements
    .filter(element => element.group === 'nodes')
    .map(node => ({ data: node.data, classes: node.classes }))
  console.log(JSON.stringify(nodes))
  const edges = elements
    .filter(element => element.group === 'edges')
    .map(edge => ({ data: edge.data, classes: edge.classes }))
  const constraints = getConstraints()

  cytoscape.use(layoutUtilities)
  cytoscape.use(fcose)
  const cy = cytoscape({
    container: el,
    ready: function () {
      // const layoutUtilities = this.layoutUtilities({
      //   desiredAspectRatio: this.width() / this.height()
      // })

      this.nodes().forEach(function (node) {
        const size = Math.random() * 40 + 30
        node.css('width', size)
        node.css('height', size)
      })

      const initialLayout = this.layout({ name: 'fcose', step: 'all', animationEasing: 'ease-out' })
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

  cy.on('tap', 'node', function (evt) {
    const node = evt.target
    console.log('tapped ' + node.id())
  })

  cy.on('mouseover', 'node', function (evt) {
    const node = evt.target
    console.log('mouseover  ' + node.id())
  })


  function getElements () {
    const elements4 = [
      { group: 'nodes', data: { id: 'n1' } },
      { group: 'nodes', data: { id: 'n2' } },
      { group: 'nodes', data: { id: 'n3' } },
      { group: 'nodes', data: { id: 'n4' } },
      { group: 'nodes', data: { id: 'n5' } },
      { group: 'nodes', data: { id: 'n6', parent: 'n24' } },
      { group: 'nodes', data: { id: 'n7', parent: 'n24' } },
      { group: 'nodes', data: { id: 'n8', parent: 'n24' } },
      { group: 'nodes', data: { id: 'n9' } },
      { group: 'nodes', data: { id: 'n10', parent: 'n28' } },
      { group: 'nodes', data: { id: 'n11', parent: 'n28' } },
      { group: 'nodes', data: { id: 'n12', parent: 'n28' } },
      { group: 'nodes', data: { id: 'n13', parent: 'n28' } },
      { group: 'nodes', data: { id: 'n14', parent: 'n28' } },
      { group: 'nodes', data: { id: 'n15' } },
      { group: 'nodes', data: { id: 'n16' } },
      { group: 'nodes', data: { id: 'n17' } },
      { group: 'nodes', data: { id: 'n18' } },
      { group: 'nodes', data: { id: 'n19' } },
      { group: 'nodes', data: { id: 'n20', parent: 'n26' } },
      { group: 'nodes', data: { id: 'n21', parent: 'n26' } },
      { group: 'nodes', data: { id: 'n22', parent: 'n27' } },
      { group: 'nodes', data: { id: 'n23', parent: 'n25' } },
      { group: 'nodes', data: { id: 'n24' } },
      { group: 'nodes', data: { id: 'n25' } },
      { group: 'nodes', data: { id: 'n26', parent: 'n30' } },
      { group: 'nodes', data: { id: 'n27', parent: 'n29' } },
      { group: 'nodes', data: { id: 'n28', parent: 'n29' } },
      { group: 'nodes', data: { id: 'n29', parent: 'n30' } },
      { group: 'nodes', data: { id: 'n30' } },
      { group: 'nodes', data: { id: 'f1', parent: 'n29' }, classes: ['fixed'] },
      { group: 'nodes', data: { id: 'f2', parent: 'n28' }, classes: ['fixed'] },
      { group: 'nodes', data: { id: 'h1' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'h2' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'h3' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'v1', parent: 'n24' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'v2', parent: 'n25' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'v3' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'v4' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'h4r' }, classes: ['alignment'] },
      { group: 'nodes', data: { id: 'r1', parent: 'n29' }, classes: ['relative'] },
      { group: 'nodes', data: { id: 'r2', parent: 'n29' }, classes: ['relative'] },
      { group: 'nodes', data: { id: 'r3' }, classes: ['relative'] },
      { group: 'edges', data: { id: 'e2', source: 'n2', target: 'n3' } },
      { group: 'edges', data: { id: 'e3', source: 'n1', target: 'n2' } },
      { group: 'edges', data: { id: 'e4', source: 'n3', target: 'v1' } },
      { group: 'edges', data: { id: 'e5', source: 'n2', target: 'v1' } },
      { group: 'edges', data: { id: 'e6', source: 'v1', target: 'n4' } },
      //  {group: 'edges', data: {id: 'e7', source: 'n5', target: 'n6'}},
      { group: 'edges', data: { id: 'e8', source: 'v1', target: 'n5' } },
      { group: 'edges', data: { id: 'e9', source: 'v1', target: 'n6' } },
      { group: 'edges', data: { id: 'e10', source: 'v1', target: 'n7' } },
      //  {group: 'edges', data: {id: 'e11', source: 'n3', target: 'n9'}},
      { group: 'edges', data: { id: 'e12', source: 'n6', target: 'n8' } },
      { group: 'edges', data: { id: 'e13', source: 'h1', target: 'n16' } },
      { group: 'edges', data: { id: 'e14', source: 'v2', target: 'n23' } },
      { group: 'edges', data: { id: 'e15', source: 'n16', target: 'n15' } },
      { group: 'edges', data: { id: 'e16', source: 'n16', target: 'h2' } },
      { group: 'edges', data: { id: 'e17', source: 'n15', target: 'n17' } },
      { group: 'edges', data: { id: 'e18', source: 'h3', target: 'v3' } },
      { group: 'edges', data: { id: 'e19', source: 'v3', target: 'n18' } },
      { group: 'edges', data: { id: 'e20', source: 'n17', target: 'n19' } },
      { group: 'edges', data: { id: 'e21', source: 'n18', target: 'n19' } },
      { group: 'edges', data: { id: 'e22', source: 'h2', target: 'n19' } },
      { group: 'edges', data: { id: 'e23', source: 'n19', target: 'h3' } },
      { group: 'edges', data: { id: 'e25', source: 'v4', target: 'n20' } },
      { group: 'edges', data: { id: 'e26', source: 'n20', target: 'n21' } },
      { group: 'edges', data: { id: 'e27', source: 'n25', target: 'f1' }, classes: ['path01'] },
      { group: 'edges', data: { id: 'e29', source: 'f1', target: 'n26' }, classes: ['path01'] },
      { group: 'edges', data: { id: 'e30', source: 'f1', target: 'r2' } },
      { group: 'edges', data: { id: 'e31', source: 'f1', target: 'r1' } },
      { group: 'edges', data: { id: 'e33', source: 'h3', target: 'v2' } },
      { group: 'edges', data: { id: 'e35', source: 'f2', target: 'n11' } },
      { group: 'edges', data: { id: 'e36', source: 'f2', target: 'n10' } },
      { group: 'edges', data: { id: 'e37', source: 'n11', target: 'n10' } },
      { group: 'edges', data: { id: 'e38', source: 'n12', target: 'n13' } },
      { group: 'edges', data: { id: 'e39', source: 'n12', target: 'n14' } },
      { group: 'edges', data: { id: 'e40', source: 'h2', target: 'n27' } },
      { group: 'edges', data: { id: 'e41', source: 'n9', target: 'r3' } },
      { group: 'edges', data: { id: 'e42', source: 'n9', target: 'h4r' } },
      { group: 'edges', data: { id: 'e43', source: 'r3', target: 'h4r' } },
      { group: 'edges', data: { id: 'e44', source: 'n11', target: 'r3' } },
      { group: 'edges', data: { id: 'e45', source: 'n14', target: 'r3' } }
    ]

    return elements4
  }

  function getConstraints () {
    const sample4Constraints = {
      fixedNodeConstraint: [
        {
          nodeId: 'f1',
          position: {
            x: -100,
            y: 0
          }
        },
        {
          nodeId: 'f2',
          position: {
            x: 300,
            y: 0
          }
        }
      ],
      alignmentConstraint: {
        horizontal: [
          [
            'h1',
            'h2',
            'h3',
            'h4r'
          ]
        ],
        vertical: [
          [
            'v1',
            'v2',
            'v3',
            'v4'
          ]
        ]
      },
      relativePlacementConstraint: [
        {
          top: 'r1',
          bottom: 'r2',
          gap: 150
        },
        {
          left: 'r3',
          right: 'h4r',
          gap: 150
        }
      ]
    }

    return sample4Constraints
  }

  function getStylesheet () {
    // define default stylesheet
    const defaultStylesheet = [
      {
        selector: 'node',
        style: {
          'background-color': '#bdd3ff',
          label: 'data(id)',
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
          'target-arrow-color': '#ffd3d4',
          'target-arrow-shape': 'triangle',
          'line-color': '#ffd3d4'
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
        selector: 'node.fixed',
        style: {
          shape: 'diamond',
          'background-color': '#9D9696'
        }
      },

      {
        selector: 'node.fixed:selected',
        style: {
          'background-color': '#33ff00'
        }
      },

      {
        selector: 'node.alignment',
        style: {
          shape: 'round-heptagon',
          'background-color': '#fef2ff'
        }
      },

      {
        selector: 'node.alignment:selected',
        style: {
          'background-color': '#33ff00'
        }
      },

      {
        selector: 'node.relative',
        style: {
          shape: 'rectangle',
          'background-color': '#fed3d1'
        }
      },

      {
        selector: 'node.relative:selected',
        style: {
          'background-color': '#33ff00'
        }
      },

      {
        selector: 'edge:selected',
        style: {
          'line-color': '#33ff00'
        }
      },

      {
        selector: 'edge.path01',
        style: {
          'line-color': '#00ff00',
          'target-arrow-color': '#00ff00',
          width: 10
        }
      }
    ]

    return defaultStylesheet
  }
}
