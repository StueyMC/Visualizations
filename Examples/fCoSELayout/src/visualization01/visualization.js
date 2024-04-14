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
  // console.log(JSON.stringify(styleSheet))
  const elements = getElements()
  const nodes = elements
    .filter(element => element.group === 'nodes')
    .map(node => ({ data: node.data, classes: node.classes }))
  // console.log(JSON.stringify(nodes))
  const edges = elements
    .filter(element => element.group === 'edges')
    .map((edge, i) => { 
      const retVal = { data: edge.data, classes: edge.classes }
      retVal.data.id = i.toString()
      return retVal
    })
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

      const layoutOptions = {
        name: 'fcose',
        step: 'all',
        animationEasing: 'ease-out',
        nodeSeparation: 300,
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: node => 36000,
        // Ideal edge (non nested) length
        idealEdgeLength: edge => 150,
        // Divisor to compute edge forces
        edgeElasticity: edge => 0.9
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

  const lesMis = [{
     group: 'nodes', data: { "id":"Myriel-id","name":"Myriel","colour": "#9467bd", "size": 40
  }},{
     group: 'nodes', data: { "id":"Napoleon-id","name":"Napoleon","colour":"#9467bd", "size": 10
  }},{
     group: 'nodes', data: { "id":"Mlle.Baptistine-id","name":"Mlle.Baptistine","colour":"#9467bd", "size": 0
  }},{
     group: 'nodes', data: { "id":"Mme.Magloire-id","name":"Mme.Magloire","colour":"#9467bd"
  }},{
     group: 'nodes', data: { "id":"CountessdeLo-id","name":"CountessdeLo","colour":"#9467bd"
  }},{
     group: 'nodes', data: { "id":"Geborand-id","name":"Geborand","colour":"#9467bd"
  }},{
     group: 'nodes', data: { "id":"Champtercier-id","name":"Champtercier","colour":"#9467bd"
  }},{
     group: 'nodes', data: { "id":"Cravatte-id","name":"Cravatte","colour":"#9467bd"
  }},{
     group: 'nodes', data: { "id":"Count-id","name":"Count","colour":"#9467bd"
  }},{
     group: 'nodes', data: { "id":"OldMan-id","name":"OldMan","colour":"#9467bd"
  }},{
     group: 'nodes', data: { "id":"Labarre-id","name":"Labarre","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Valjean-id","name":"Valjean","colour":"#ff7f0e", "size": "20"
  }},{
     group: 'nodes', data: { "id":"Marguerite-id","name":"Marguerite","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Mme.deR-id","name":"Mme.deR","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Isabeau-id","name":"Isabeau","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Gervais-id","name":"Gervais","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Tholomyes-id","name":"Tholomyes","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Listolier-id","name":"Listolier","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Fameuil-id","name":"Fameuil","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Blacheville-id","name":"Blacheville","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Favourite-id","name":"Favourite","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Dahlia-id","name":"Dahlia","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Zephine-id","name":"Zephine","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Fantine-id","name":"Fantine","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Mme.Thenardier-id","name":"Mme.Thenardier","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Thenardier-id","name":"Thenardier","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Cosette-id","name":"Cosette","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Javert-id","name":"Javert","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Fauchelevent-id","name":"Fauchelevent","colour":"#17becf"
  }},{
     group: 'nodes', data: { "id":"Bamatabois-id","name":"Bamatabois","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Perpetue-id","name":"Perpetue","colour":"#e377c2"
  }},{
     group: 'nodes', data: { "id":"Simplice-id","name":"Simplice","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Scaufflaire-id","name":"Scaufflaire","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Woman1-id","name":"Woman1","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Judge-id","name":"Judge","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Champmathieu-id","name":"Champmathieu","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Brevet-id","name":"Brevet","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Chenildieu-id","name":"Chenildieu","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Cochepaille-id","name":"Cochepaille","colour":"#ff7f0e"
  }},{
     group: 'nodes', data: { "id":"Pontmercy-id","name":"Pontmercy","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Boulatruelle-id","name":"Boulatruelle","colour":"#1f77b4"
  }},{
     group: 'nodes', data: { "id":"Eponine-id","name":"Eponine","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Anzelma-id","name":"Anzelma","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Woman2-id","name":"Woman2","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"MotherInnocent-id","name":"MotherInnocent","colour":"#17becf"
  }},{
     group: 'nodes', data: { "id":"Gribier-id","name":"Gribier","colour":"#17becf"
  }},{
     group: 'nodes', data: { "id":"Jondrette-id","name":"Jondrette","colour":"#8c564b"
  }},{
     group: 'nodes', data: { "id":"Mme.Burgon-id","name":"Mme.Burgon","colour":"#8c564b"
  }},{
     group: 'nodes', data: { "id":"Gavroche-id","name":"Gavroche","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Gillenormand-id","name":"Gillenormand","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Magnon-id","name":"Magnon","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Mlle.Gillenormand-id","name":"Mlle.Gillenormand","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Mme.Pontmercy-id","name":"Mme.Pontmercy","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Mlle.Vaubois-id","name":"Mlle.Vaubois","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Lt.Gillenormand-id","name":"Lt.Gillenormand","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Marius-id","name":"Marius","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"BaronessT-id","name":"BaronessT","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Mabeuf-id","name":"Mabeuf","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Enjolras-id","name":"Enjolras","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Combeferre-id","name":"Combeferre","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Prouvaire-id","name":"Prouvaire","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Feuilly-id","name":"Feuilly","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Courfeyrac-id","name":"Courfeyrac","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Bahorel-id","name":"Bahorel","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Bossuet-id","name":"Bossuet","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Joly-id","name":"Joly","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Grantaire-id","name":"Grantaire","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"MotherPlutarch-id","name":"MotherPlutarch","colour":"#000000"
  }},{
     group: 'nodes', data: { "id":"Gueulemer-id","name":"Gueulemer","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Babet-id","name":"Babet","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Claquesous-id","name":"Claquesous","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Montparnasse-id","name":"Montparnasse","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Toussaint-id","name":"Toussaint","colour":"#bcbd22"
  }},{
     group: 'nodes', data: { "id":"Child1-id","name":"Child1","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Child2-id","name":"Child2","colour":"#2ca02c"
  }},{
     group: 'nodes', data: { "id":"Brujon-id","name":"Brujon","colour":"#d62728"
  }},{
     group: 'nodes', data: { "id":"Mme.Hucheloup-id","name":"Mme.Hucheloup","colour":"#2ca02c"
  }},
     {
      "group": "edges", "data": { "id": "", "source": "Napoleon-id", "name":"Napoleon", "linkColour": "#2ca02c", "target": "Myriel-id", "name":"Myriel"},"value":25
    },{
      "group": "edges", "data": { "id": "", "source": "Mlle.Baptistine-id", "name":"Mlle.Baptistine", "target": "Myriel-id", "name":"Myriel", "linkColour":"#d62728"},"value":25
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Magloire-id", "name":"Mme.Magloire", "target": "Myriel-id", "name":"Myriel"},"value":25, "linkColour": "#bcbd22"
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Magloire-id", "name":"Mme.Magloire", "target": "Mlle.Baptistine-id", "name":"Mlle.Baptistine"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "CountessdeLo-id", "name":"CountessdeLo", "target": "Myriel-id", "name":"Myriel"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Geborand-id", "name":"Geborand", "target": "Myriel-id", "name":"Myriel"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Champtercier-id", "name":"Champtercier", "target": "Myriel-id", "name":"Myriel"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Cravatte-id", "name":"Cravatte", "target": "Myriel-id", "name":"Myriel"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Count-id", "name":"Count", "target": "Myriel-id", "name":"Myriel"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "OldMan-id", "name":"OldMan", "target": "Myriel-id", "name":"Myriel"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Valjean-id", "name":"Valjean", "target": "Labarre-id", "name":"Labarre"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Valjean-id", "name":"Valjean", "target": "Mme.Magloire-id", "name":"Mme.Magloire"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Valjean-id", "name":"Valjean", "target": "Mlle.Baptistine-id", "name":"Mlle.Baptistine"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Valjean-id", "name":"Valjean", "target": "Myriel-id", "name":"Myriel"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Marguerite-id", "name":"Marguerite", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.deR-id", "name":"Mme.deR", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Isabeau-id", "name":"Isabeau", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gervais-id", "name":"Gervais", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Listolier-id", "name":"Listolier", "target": "Tholomyes-id", "name":"Tholomyes"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Fameuil-id", "name":"Fameuil", "target": "Tholomyes-id", "name":"Tholomyes"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Fameuil-id", "name":"Fameuil", "target": "Listolier-id", "name":"Listolier"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Blacheville-id", "name":"Blacheville", "target": "Tholomyes-id", "name":"Tholomyes"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Blacheville-id", "name":"Blacheville", "target": "Listolier-id", "name":"Listolier"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Blacheville-id", "name":"Blacheville", "target": "Fameuil-id", "name":"Fameuil"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Favourite-id", "name":"Favourite", "target": "Tholomyes-id", "name":"Tholomyes"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Favourite-id", "name":"Favourite", "target": "Listolier-id", "name":"Listolier"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Favourite-id", "name":"Favourite", "target": "Fameuil-id", "name":"Fameuil"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Favourite-id", "name":"Favourite", "target": "Blacheville-id", "name":"Blacheville"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Dahlia-id", "name":"Dahlia", "target": "Tholomyes-id", "name":"Tholomyes"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Dahlia-id", "name":"Dahlia", "target": "Listolier-id", "name":"Listolier"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Dahlia-id", "name":"Dahlia", "target": "Fameuil-id", "name":"Fameuil"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Dahlia-id", "name":"Dahlia", "target": "Blacheville-id", "name":"Blacheville"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Dahlia-id", "name":"Dahlia", "target": "Favourite-id", "name":"Favourite"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Zephine-id", "name":"Zephine", "target": "Tholomyes-id", "name":"Tholomyes"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Zephine-id", "name":"Zephine", "target": "Listolier-id", "name":"Listolier"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Zephine-id", "name":"Zephine", "target": "Fameuil-id", "name":"Fameuil"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Zephine-id", "name":"Zephine", "target": "Blacheville-id", "name":"Blacheville"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Zephine-id", "name":"Zephine", "target": "Favourite-id", "name":"Favourite"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Zephine-id", "name":"Zephine", "target": "Dahlia-id", "name":"Dahlia"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Tholomyes-id", "name":"Tholomyes"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Listolier-id", "name":"Listolier"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Fameuil-id", "name":"Fameuil"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Blacheville-id", "name":"Blacheville"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Favourite-id", "name":"Favourite"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Dahlia-id", "name":"Dahlia"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Zephine-id", "name":"Zephine"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Marguerite-id", "name":"Marguerite"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Fantine-id", "name":"Fantine", "target": "Valjean-id", "name":"Valjean"},"value":9
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Thenardier-id", "name":"Mme.Thenardier", "target": "Fantine-id", "name":"Fantine"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Thenardier-id", "name":"Mme.Thenardier", "target": "Valjean-id", "name":"Valjean"},"value":7
    },{
      "group": "edges", "data": { "id": "", "source": "Thenardier-id", "name":"Thenardier", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":13
    },{
      "group": "edges", "data": { "id": "", "source": "Thenardier-id", "name":"Thenardier", "target": "Fantine-id", "name":"Fantine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Thenardier-id", "name":"Thenardier", "target": "Valjean-id", "name":"Valjean"},"value":12
    },{
      "group": "edges", "data": { "id": "", "source": "Cosette-id", "name":"Cosette", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Cosette-id", "name":"Cosette", "target": "Valjean-id", "name":"Valjean"},"value":31
    },{
      "group": "edges", "data": { "id": "", "source": "Cosette-id", "name":"Cosette", "target": "Tholomyes-id", "name":"Tholomyes"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Cosette-id", "name":"Cosette", "target": "Thenardier-id", "name":"Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Javert-id", "name":"Javert", "target": "Valjean-id", "name":"Valjean"},"value":17
    },{
      "group": "edges", "data": { "id": "", "source": "Javert-id", "name":"Javert", "target": "Fantine-id", "name":"Fantine"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Javert-id", "name":"Javert", "target": "Thenardier-id", "name":"Thenardier"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Javert-id", "name":"Javert", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Javert-id", "name":"Javert", "target": "Cosette-id", "name":"Cosette"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Fauchelevent-id", "name":"Fauchelevent", "target": "Valjean-id", "name":"Valjean"},"value":8
    },{
      "group": "edges", "data": { "id": "", "source": "Fauchelevent-id", "name":"Fauchelevent", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Bamatabois-id", "name":"Bamatabois", "target": "Fantine-id", "name":"Fantine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Bamatabois-id", "name":"Bamatabois", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Bamatabois-id", "name":"Bamatabois", "target": "Valjean-id", "name":"Valjean"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Perpetue-id", "name":"Perpetue", "target": "Fantine-id", "name":"Fantine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Simplice-id", "name":"Simplice", "target": "Perpetue-id", "name":"Perpetue"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Simplice-id", "name":"Simplice", "target": "Valjean-id", "name":"Valjean"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Simplice-id", "name":"Simplice", "target": "Fantine-id", "name":"Fantine"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Simplice-id", "name":"Simplice", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Scaufflaire-id", "name":"Scaufflaire", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Woman1-id", "name":"Woman1", "target": "Valjean-id", "name":"Valjean"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Woman1-id", "name":"Woman1", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Judge-id", "name":"Judge", "target": "Valjean-id", "name":"Valjean"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Judge-id", "name":"Judge", "target": "Bamatabois-id", "name":"Bamatabois"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Champmathieu-id", "name":"Champmathieu", "target": "Valjean-id", "name":"Valjean"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Champmathieu-id", "name":"Champmathieu", "target": "Judge-id", "name":"Judge"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Champmathieu-id", "name":"Champmathieu", "target": "Bamatabois-id", "name":"Bamatabois"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Brevet-id", "name":"Brevet", "target": "Judge-id", "name":"Judge"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Brevet-id", "name":"Brevet", "target": "Champmathieu-id", "name":"Champmathieu"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Brevet-id", "name":"Brevet", "target": "Valjean-id", "name":"Valjean"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Brevet-id", "name":"Brevet", "target": "Bamatabois-id", "name":"Bamatabois"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Chenildieu-id", "name":"Chenildieu", "target": "Judge-id", "name":"Judge"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Chenildieu-id", "name":"Chenildieu", "target": "Champmathieu-id", "name":"Champmathieu"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Chenildieu-id", "name":"Chenildieu", "target": "Brevet-id", "name":"Brevet"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Chenildieu-id", "name":"Chenildieu", "target": "Valjean-id", "name":"Valjean"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Chenildieu-id", "name":"Chenildieu", "target": "Bamatabois-id", "name":"Bamatabois"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Cochepaille-id", "name":"Cochepaille", "target": "Judge-id", "name":"Judge"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Cochepaille-id", "name":"Cochepaille", "target": "Champmathieu-id", "name":"Champmathieu"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Cochepaille-id", "name":"Cochepaille", "target": "Brevet-id", "name":"Brevet"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Cochepaille-id", "name":"Cochepaille", "target": "Chenildieu-id", "name":"Chenildieu"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Cochepaille-id", "name":"Cochepaille", "target": "Valjean-id", "name":"Valjean"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Cochepaille-id", "name":"Cochepaille", "target": "Bamatabois-id", "name":"Bamatabois"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Pontmercy-id", "name":"Pontmercy", "target": "Thenardier-id", "name":"Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Boulatruelle-id", "name":"Boulatruelle", "target": "Thenardier-id", "name":"Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Eponine-id", "name":"Eponine", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Eponine-id", "name":"Eponine", "target": "Thenardier-id", "name":"Thenardier"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Anzelma-id", "name":"Anzelma", "target": "Eponine-id", "name":"Eponine"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Anzelma-id", "name":"Anzelma", "target": "Thenardier-id", "name":"Thenardier"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Anzelma-id", "name":"Anzelma", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Woman2-id", "name":"Woman2", "target": "Valjean-id", "name":"Valjean"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Woman2-id", "name":"Woman2", "target": "Cosette-id", "name":"Cosette"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Woman2-id", "name":"Woman2", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "MotherInnocent-id", "name":"MotherInnocent", "target": "Fauchelevent-id", "name":"Fauchelevent"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "MotherInnocent-id", "name":"MotherInnocent", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gribier-id", "name":"Gribier", "target": "Fauchelevent-id", "name":"Fauchelevent"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Burgon-id", "name":"Mme.Burgon", "target": "Jondrette-id", "name":"Jondrette"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gavroche-id", "name":"Gavroche", "target": "Mme.Burgon-id", "name":"Mme.Burgon"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Gavroche-id", "name":"Gavroche", "target": "Thenardier-id", "name":"Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gavroche-id", "name":"Gavroche", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gavroche-id", "name":"Gavroche", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gillenormand-id", "name":"Gillenormand", "target": "Cosette-id", "name":"Cosette"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Gillenormand-id", "name":"Gillenormand", "target": "Valjean-id", "name":"Valjean"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Magnon-id", "name":"Magnon", "target": "Gillenormand-id", "name":"Gillenormand"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Magnon-id", "name":"Magnon", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mlle.Gillenormand-id", "name":"Mlle.Gillenormand", "target": "Gillenormand-id", "name":"Gillenormand"},"value":9
    },{
      "group": "edges", "data": { "id": "", "source": "Mlle.Gillenormand-id", "name":"Mlle.Gillenormand", "target": "Cosette-id", "name":"Cosette"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Mlle.Gillenormand-id", "name":"Mlle.Gillenormand", "target": "Valjean-id", "name":"Valjean"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Pontmercy-id", "name":"Mme.Pontmercy", "target": "Mlle.Gillenormand-id", "name":"Mlle.Gillenormand"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Pontmercy-id", "name":"Mme.Pontmercy", "target": "Pontmercy-id", "name":"Pontmercy"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mlle.Vaubois-id", "name":"Mlle.Vaubois", "target": "Mlle.Gillenormand-id", "name":"Mlle.Gillenormand"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Lt.Gillenormand-id", "name":"Lt.Gillenormand", "target": "Mlle.Gillenormand-id", "name":"Mlle.Gillenormand"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Lt.Gillenormand-id", "name":"Lt.Gillenormand", "target": "Gillenormand-id", "name":"Gillenormand"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Lt.Gillenormand-id", "name":"Lt.Gillenormand", "target": "Cosette-id", "name":"Cosette"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Mlle.Gillenormand-id", "name":"Mlle.Gillenormand"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Gillenormand-id", "name":"Gillenormand"},"value":12
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Pontmercy-id", "name":"Pontmercy"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Lt.Gillenormand-id", "name":"Lt.Gillenormand"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Cosette-id", "name":"Cosette"},"value":21
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Valjean-id", "name":"Valjean"},"value":19
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Tholomyes-id", "name":"Tholomyes"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Thenardier-id", "name":"Thenardier"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Eponine-id", "name":"Eponine"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Marius-id", "name":"Marius", "target": "Gavroche-id", "name":"Gavroche"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "BaronessT-id", "name":"BaronessT", "target": "Gillenormand-id", "name":"Gillenormand"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "BaronessT-id", "name":"BaronessT", "target": "Marius-id", "name":"Marius"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mabeuf-id", "name":"Mabeuf", "target": "Marius-id", "name":"Marius"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mabeuf-id", "name":"Mabeuf", "target": "Eponine-id", "name":"Eponine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mabeuf-id", "name":"Mabeuf", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Enjolras-id", "name":"Enjolras", "target": "Marius-id", "name":"Marius"},"value":7
    },{
      "group": "edges", "data": { "id": "", "source": "Enjolras-id", "name":"Enjolras", "target": "Gavroche-id", "name":"Gavroche"},"value":7
    },{
      "group": "edges", "data": { "id": "", "source": "Enjolras-id", "name":"Enjolras", "target": "Javert-id", "name":"Javert"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Enjolras-id", "name":"Enjolras", "target": "Mabeuf-id", "name":"Mabeuf"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Enjolras-id", "name":"Enjolras", "target": "Valjean-id", "name":"Valjean"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Combeferre-id", "name":"Combeferre", "target": "Enjolras-id", "name":"Enjolras"},"value":15
    },{
      "group": "edges", "data": { "id": "", "source": "Combeferre-id", "name":"Combeferre", "target": "Marius-id", "name":"Marius"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Combeferre-id", "name":"Combeferre", "target": "Gavroche-id", "name":"Gavroche"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Combeferre-id", "name":"Combeferre", "target": "Mabeuf-id", "name":"Mabeuf"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Prouvaire-id", "name":"Prouvaire", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Prouvaire-id", "name":"Prouvaire", "target": "Enjolras-id", "name":"Enjolras"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Prouvaire-id", "name":"Prouvaire", "target": "Combeferre-id", "name":"Combeferre"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Feuilly-id", "name":"Feuilly", "target": "Gavroche-id", "name":"Gavroche"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Feuilly-id", "name":"Feuilly", "target": "Enjolras-id", "name":"Enjolras"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Feuilly-id", "name":"Feuilly", "target": "Prouvaire-id", "name":"Prouvaire"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Feuilly-id", "name":"Feuilly", "target": "Combeferre-id", "name":"Combeferre"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Feuilly-id", "name":"Feuilly", "target": "Mabeuf-id", "name":"Mabeuf"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Feuilly-id", "name":"Feuilly", "target": "Marius-id", "name":"Marius"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Marius-id", "name":"Marius"},"value":9
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Enjolras-id", "name":"Enjolras"},"value":17
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Combeferre-id", "name":"Combeferre"},"value":13
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Gavroche-id", "name":"Gavroche"},"value":7
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Mabeuf-id", "name":"Mabeuf"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Eponine-id", "name":"Eponine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Feuilly-id", "name":"Feuilly"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Courfeyrac-id", "name":"Courfeyrac", "target": "Prouvaire-id", "name":"Prouvaire"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Combeferre-id", "name":"Combeferre"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Gavroche-id", "name":"Gavroche"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Courfeyrac-id", "name":"Courfeyrac"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Mabeuf-id", "name":"Mabeuf"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Enjolras-id", "name":"Enjolras"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Feuilly-id", "name":"Feuilly"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Prouvaire-id", "name":"Prouvaire"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Bahorel-id", "name":"Bahorel", "target": "Marius-id", "name":"Marius"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Marius-id", "name":"Marius"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Courfeyrac-id", "name":"Courfeyrac"},"value":12
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Gavroche-id", "name":"Gavroche"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Bahorel-id", "name":"Bahorel"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Enjolras-id", "name":"Enjolras"},"value":10
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Feuilly-id", "name":"Feuilly"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Prouvaire-id", "name":"Prouvaire"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Combeferre-id", "name":"Combeferre"},"value":9
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Mabeuf-id", "name":"Mabeuf"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Bossuet-id", "name":"Bossuet", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Bahorel-id", "name":"Bahorel"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Bossuet-id", "name":"Bossuet"},"value":7
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Gavroche-id", "name":"Gavroche"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Courfeyrac-id", "name":"Courfeyrac"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Enjolras-id", "name":"Enjolras"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Feuilly-id", "name":"Feuilly"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Prouvaire-id", "name":"Prouvaire"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Combeferre-id", "name":"Combeferre"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Mabeuf-id", "name":"Mabeuf"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Joly-id", "name":"Joly", "target": "Marius-id", "name":"Marius"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Bossuet-id", "name":"Bossuet"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Enjolras-id", "name":"Enjolras"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Combeferre-id", "name":"Combeferre"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Courfeyrac-id", "name":"Courfeyrac"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Joly-id", "name":"Joly"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Bahorel-id", "name":"Bahorel"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Feuilly-id", "name":"Feuilly"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Grantaire-id", "name":"Grantaire", "target": "Prouvaire-id", "name":"Prouvaire"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "MotherPlutarch-id", "name":"MotherPlutarch", "target": "Mabeuf-id", "name":"Mabeuf"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Gueulemer-id", "name":"Gueulemer", "target": "Thenardier-id", "name":"Thenardier"},"value":5
    },{
      "group": "edges", "data": { "id": "", "source": "Gueulemer-id", "name":"Gueulemer", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gueulemer-id", "name":"Gueulemer", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gueulemer-id", "name":"Gueulemer", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gueulemer-id", "name":"Gueulemer", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Gueulemer-id", "name":"Gueulemer", "target": "Eponine-id", "name":"Eponine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Babet-id", "name":"Babet", "target": "Thenardier-id", "name":"Thenardier"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Babet-id", "name":"Babet", "target": "Gueulemer-id", "name":"Gueulemer"},"value":6
    },{
      "group": "edges", "data": { "id": "", "source": "Babet-id", "name":"Babet", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Babet-id", "name":"Babet", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Babet-id", "name":"Babet", "target": "Javert-id", "name":"Javert"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Babet-id", "name":"Babet", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Babet-id", "name":"Babet", "target": "Eponine-id", "name":"Eponine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Thenardier-id", "name":"Thenardier"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Babet-id", "name":"Babet"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Gueulemer-id", "name":"Gueulemer"},"value":4
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Mme.Thenardier-id", "name":"Mme.Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Eponine-id", "name":"Eponine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Claquesous-id", "name":"Claquesous", "target": "Enjolras-id", "name":"Enjolras"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Babet-id", "name":"Babet"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Gueulemer-id", "name":"Gueulemer"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Claquesous-id", "name":"Claquesous"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Eponine-id", "name":"Eponine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Montparnasse-id", "name":"Montparnasse", "target": "Thenardier-id", "name":"Thenardier"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Toussaint-id", "name":"Toussaint", "target": "Cosette-id", "name":"Cosette"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Toussaint-id", "name":"Toussaint", "target": "Javert-id", "name":"Javert"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Toussaint-id", "name":"Toussaint", "target": "Valjean-id", "name":"Valjean"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Child1-id", "name":"Child1", "target": "Gavroche-id", "name":"Gavroche"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Child2-id", "name":"Child2", "target": "Gavroche-id", "name":"Gavroche"},"value":2
    },{
      "group": "edges", "data": { "id": "", "source": "Child2-id", "name":"Child2", "target": "Child1-id", "name":"Child1"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Brujon-id", "name":"Brujon", "target": "Babet-id", "name":"Babet"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Brujon-id", "name":"Brujon", "target": "Gueulemer-id", "name":"Gueulemer"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Brujon-id", "name":"Brujon", "target": "Thenardier-id", "name":"Thenardier"},"value":3
    },{
      "group": "edges", "data": { "id": "", "source": "Brujon-id", "name":"Brujon", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Brujon-id", "name":"Brujon", "target": "Eponine-id", "name":"Eponine"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Brujon-id", "name":"Brujon", "target": "Claquesous-id", "name":"Claquesous"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Brujon-id", "name":"Brujon", "target": "Montparnasse-id", "name":"Montparnasse"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Hucheloup-id", "name":"Mme.Hucheloup", "target": "Bossuet-id", "name":"Bossuet"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Hucheloup-id", "name":"Mme.Hucheloup", "target": "Joly-id", "name":"Joly"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Hucheloup-id", "name":"Mme.Hucheloup", "target": "Grantaire-id", "name":"Grantaire"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Hucheloup-id", "name":"Mme.Hucheloup", "target": "Bahorel-id", "name":"Bahorel"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Hucheloup-id", "name":"Mme.Hucheloup", "target": "Courfeyrac-id", "name":"Courfeyrac"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Hucheloup-id", "name":"Mme.Hucheloup", "target": "Gavroche-id", "name":"Gavroche"},"value":1
    },{
      "group": "edges", "data": { "id": "", "source": "Mme.Hucheloup-id", "name":"Mme.Hucheloup", "target": "Enjolras-id", "name":"Enjolras"},"value":1
    }

  ]

    return lesMis //elements4
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
