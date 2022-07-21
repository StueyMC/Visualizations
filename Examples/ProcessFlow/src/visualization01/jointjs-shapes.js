import * as joint from 'jointjs'
import * as Ports from './element-port-names'
import * as Types from './element-types'

let ActorShape
let SwimlaneShape
let StartShape
let ProcessStepShape
let SubProcessShape
let ProcessShape
let DecisionShape
let VerticalLabelShape
let PhaseExtentShape
let ExternalDataShape
let DatabaseShape
let DocumentShape
let DataShape
let OtherShape
let OffPageOutputShape
let OffPageInputShape
let StepGroupShape

export function defineShapes (gridSize, elementSizes, renderSwimlaneWatermarks, verticalSwimlanes) {
  ActorShape = defineActor(renderSwimlaneWatermarks)
  SwimlaneShape = defineSwimlane()
  StartShape = defineStart()
  ProcessStepShape = defineProcessStep(gridSize, elementSizes[Types.processStep])
  SubProcessShape = defineSubProcess(gridSize, elementSizes[Types.subProcess])
  ProcessShape = defineProcess()
  DecisionShape = defineDecision()
  VerticalLabelShape = defineVerticalLabel(verticalSwimlanes)
  PhaseExtentShape = definePhaseExtent()
  ExternalDataShape = defineExternalData()
  DatabaseShape = defineDatabase()
  DocumentShape = defineDocument()
  DataShape = defineData()
  OtherShape = defineOther()
  OffPageOutputShape = defineOffPageOutput()
  OffPageInputShape = defineOffPageInput()
  StepGroupShape = defineStepGroup()
}

export function createActor (id) {
  return new ActorShape(id)
}

export function createSwimlane (id) {
  return new SwimlaneShape(id)
}

export function createStart (id) {
  return new StartShape(id)
}

export function createProcessStep (id) {
  return new ProcessStepShape(id)
}

export function createSubProcess (id) {
  return new SubProcessShape(id)
}

export function createProcess (id) {
  return new ProcessShape(id)
}

export function createDecision (id) {
  return new DecisionShape(id)
}

export function createVerticalLabel (id) {
  return new VerticalLabelShape(id)
}

export function createPhaseExtent (id) {
  return new PhaseExtentShape(id)
}

export function createExternalData (id) {
  return new ExternalDataShape(id)
}

export function createDatabase (id) {
  return new DatabaseShape(id)
}

export function createDocument (id) {
  return new DocumentShape(id)
}

export function createData (id) {
  return new DataShape(id)
}

export function createOther (id) {
  return new OtherShape(id)
}

export function createOffPageOutput (id) {
  return new OffPageOutputShape(id)
}

export function createOffPageInput (id) {
  return new OffPageInputShape(id)
}

export function createStepGroup (id) {
  return new StepGroupShape(id)
}

function defineActor (renderSwimlaneWatermarks) {
  const attrs = {
    body: {
      refWidth: 1,
      refHeight: 1,
      even: 'false'
    }
  }
  const markup = []
  if (renderSwimlaneWatermarks) {
    attrs.defs = {}
    attrs.pattern = {
      x: 0,
      y: 0,
      width: 1,
      height: 0.05
    }
    attrs.text = {
      refX: 0.5,
      y: 2,
      textVerticalAnchor: 'top',
      textAnchor: 'middle',
      class: 'actor-watermark'
    }
    attrs.watermark = {
      refWidth: 1,
      refHeight: 1,
      fillOpacity: 0
    }
    markup.push({
      tagName: 'defs',
      selector: 'defs',
      children: [{
        tagName: 'pattern',
        selector: 'pattern',
        children: [{
          tagName: 'text',
          selector: 'text'
        }]
      }]
    })
  }
  markup.push({
    tagName: 'rect',
    selector: 'body'
  })
  if (renderSwimlaneWatermarks) {
    markup.push({
      tagName: 'rect',
      selector: 'watermark'
    })
  }
  return joint.dia.Element.define('MooD.Actor', {
    attrs
  }, {
    markup
  })
}

function defineSwimlane () {
  return joint.dia.Element.define('MooD.Swimlane', {
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1,
        fillOpacity: 0
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body'
    }]
  })
}

//
// I/O Ports
//
const ioPortMarkup = '<circle r="1" fill-opacity="0" fill="red" />'
const portInLeft = {
  id: Ports.ioInputPort,
  group: 'inLeft',
  markup: ioPortMarkup
}

const portOutRight = {
  id: Ports.ioOutputPort,
  group: 'outRight',
  markup: ioPortMarkup
}
//
// Process Flow input ports
//
const flowInPortMarkup = '<circle r="1" fill-opacity="0" fill="green" />'
const portFlowInUpperLeft = {
  id: Ports.flowInUpperLeftPort,
  group: 'flowInUpperLeft',
  markup: flowInPortMarkup
}

const portFlowInLowerLeft = {
  id: Ports.flowInLowerLeftPort,
  group: 'flowInLowerLeft',
  markup: flowInPortMarkup
}

const portFlowInTop = {
  id: Ports.flowInTopPort,
  group: 'flowInTop',
  markup: flowInPortMarkup
}

const portFlowInUpperRight = {
  id: Ports.flowInUpperRightPort,
  group: 'flowInUpperRight',
  markup: flowInPortMarkup
}

const portFlowInLowerRight = {
  id: Ports.flowInLowerRightPort,
  group: 'flowInLowerRight',
  markup: flowInPortMarkup
}
//
// Process Flow output ports
//
const flowOutPortMarkup = '<circle r="1" fill-opacity="0" fill="blue" />'
const portFlowOutUpperLeft = {
  id: Ports.flowOutUpperLeftPort,
  group: 'flowOutUpperLeft',
  markup: flowOutPortMarkup
}

const portFlowOutLowerLeft = {
  id: Ports.flowOutLowerLeftPort,
  group: 'flowOutLowerLeft',
  markup: flowOutPortMarkup
}

const portFlowOutBottom = {
  id: Ports.flowOutBottomPort,
  group: 'flowOutBottom',
  markup: flowOutPortMarkup
}

const portFlowOutUpperRight = {
  id: Ports.flowOutUpperRightPort,
  group: 'flowOutUpperRight',
  markup: flowOutPortMarkup
}

const portFlowOutLowerRight = {
  id: Ports.flowOutLowerRightPort,
  group: 'flowOutLowerRight',
  markup: flowOutPortMarkup
}
//
// Process Flow input/output (shared) ports
//
const flowSharedPortMarkup = '<circle r="1" fill-opacity="0" fill="green" />'

const portFlowCentreLeft = {
  id: Ports.flowCentreLeftPort,
  group: 'flowLeft',
  markup: flowSharedPortMarkup
}

const portFlowCentreRight = {
  id: Ports.flowCentreRightPort,
  group: 'flowRight',
  markup: flowSharedPortMarkup
}

function defineStart () {
  return joint.dia.Element.define('MooD.Start', {
    ports: {
      groups: {
        flowInTop: {
          position: {
            name: 'absolute',
            args: { x: '50%', y: 0 }
          }
        },
        flowOutBottom: {
          position: {
            name: 'absolute',
            args: { x: '50%', y: '100%' }
          }
        }
      },
      items: [
        portFlowInTop,
        portFlowOutBottom
      ]
    },
    attrs: {
      body: {
        rx: 20,
        refRy: '50%',
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

// Return port group definitions for process type shapes
// Calculate vertical positions of flow in and out ports to
// align with the grid if the shape is tall enough
function processPortGroups (gridSize, elementSize) {
  let offsets
  if (elementSize.height > 2 * gridSize) {
    offsets = {
      upperInY: elementSize.height / 2 - 2 * gridSize,
      upperOutY: elementSize.height / 2 - gridSize,
      lowerInY: elementSize.height / 2 + 2 * gridSize,
      lowerOutY: elementSize.height / 2 + gridSize
    }
  } else {
    offsets = {
      upperInY: Math.floor(elementSize.height * 0.63),
      upperOutY: Math.floor(elementSize.height * 0.38),
      lowerInY: Math.floor(elementSize.height * 0.7),
      lowerOutY: Math.floor(elementSize.height * 0.3)
    }
  }
  const groups = {
    inLeft: {
      position: {
        name: 'absolute',
        args: { x: 0, y: '50%' }
      }
    },
    flowInUpperLeft: {
      position: {
        name: 'absolute',
        args: { x: 0, y: offsets.upperInY }
      }
    },
    flowInLowerLeft: {
      position: {
        name: 'absolute',
        args: { x: 0, y: offsets.lowerInY }
      }
    },
    flowInTop: {
      position: {
        name: 'absolute',
        args: { x: '50%', y: 0 }
      }
    },
    flowInUpperRight: {
      position: {
        name: 'absolute',
        args: { x: '100%', y: offsets.upperInY }
      }
    },
    flowInLowerRight: {
      position: {
        name: 'absolute',
        args: { x: '100%', y: offsets.lowerInY }
      }
    },
    outRight: {
      position: {
        name: 'absolute',
        args: { x: '100%', y: '50%' }
      }
    },
    flowOutUpperLeft: {
      position: {
        name: 'absolute',
        args: { x: 0, y: offsets.upperOutY }
      }
    },
    flowOutLowerLeft: {
      position: {
        name: 'absolute',
        args: { x: 0, y: offsets.lowerOutY }
      }
    },
    flowOutBottom: {
      position: {
        name: 'absolute',
        args: { x: '50%', y: '100%' }
      }
    },
    flowOutUpperRight: {
      position: {
        name: 'absolute',
        args: { x: '100%', y: offsets.upperOutY }
      }
    },
    flowOutLowerRight: {
      position: {
        name: 'absolute',
        args: { x: '100%', y: offsets.lowerOutY }
      }
    }
  }

  return groups
}

function processPortItems () {
  const items = [
    portInLeft,
    portFlowInUpperLeft,
    portFlowInLowerLeft,
    portFlowInTop,
    portFlowInUpperRight,
    portFlowInLowerRight,
    portOutRight,
    portFlowOutUpperLeft,
    portFlowOutLowerLeft,
    portFlowOutBottom,
    portFlowOutUpperRight,
    portFlowOutLowerRight
  ]

  return items
}

export function defineSubProcess (gridSize, elementSize) {
  const portGroups = processPortGroups(gridSize, elementSize)
  const portItems = processPortItems()
  // Add groups for side flow ports

  return joint.dia.Element.define('MooD.SubProcess', {
    ports: {
      groups: portGroups,
      items: portItems
    },
    attrs: {
      body: {
        refX: 0,
        refWidth: 1,
        refHeight: 1
      },
      inner: {
        refX: 0.1,
        refWidth: 0.8,
        refHeight: 1
      },
      label: {
        refWidth: 0.8,
        refHeight: 1,
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'rect',
      selector: 'inner',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineProcess () {
  // Add groups for side flow ports

  return joint.dia.Element.define('MooD.Process', {
    attrs: {
      body: {
        refX: 0,
        refWidth: 1,
        refHeight: 1
      },
      inner: {
        refX: 0.1,
        refWidth: 0.8,
        refHeight: 1
      },
      label: {
        refWidth: 0.8,
        refHeight: 1,
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'rect',
      selector: 'inner',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineProcessStep (gridSize, elementSize) {
  const portGroups = processPortGroups(gridSize, elementSize)
  const portItems = processPortItems()
  // Add groups for side flow ports

  return joint.dia.Element.define('MooD.ProcessStep', {
    ports: {
      groups: portGroups,
      items: portItems
    },
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5,
        fontSize: ''
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineDecision () {
  return joint.dia.Element.define('MooD.Decision', {
    ports: {
      groups: {
        inLeft: {
          position: {
            name: 'absolute',
            args: { x: '10%', y: '40%' }
          }
        },
        flowLeft: {
          position: {
            name: 'absolute',
            args: { x: 0, y: '50%' }
          }
        },
        flowInTop: {
          position: {
            name: 'absolute',
            args: { x: '50%', y: 0 }
          }
        },
        flowRight: {
          position: {
            name: 'absolute',
            args: { x: '100%', y: '50%' }
          }
        },
        outRight: {
          position: {
            name: 'absolute',
            args: { x: '90%', y: '40%' }
          }
        },
        flowOutBottom: {
          position: {
            name: 'absolute',
            args: { x: '50%', y: '100%' }
          }
        }
      },
      items: [
        portInLeft,
        portFlowCentreLeft,
        portFlowInTop,
        portFlowCentreRight,
        portOutRight,
        portFlowOutBottom
      ]
    },
    attrs: {
      path: {
        refDResetOffset:
                  'M 50 0 L 100 50 ' +
                  'L 50 100 ' +
                  'L 0 50 z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refWidth: 0.95,
        refHeight: 0.95,
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineVerticalLabel (verticalSwimlanes) {
  const labelDefaults = {
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5
      },
      title: {
      }
    }
  }
  const labelProtoProps = {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      groupSelector: 'bodyGroup'
    }, {
      tagName: 'text',
      selector: 'label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  }    
  if (verticalSwimlanes) {
    labelDefaults.attrs.label.transform = 'rotate(-90)'
  }
  return joint.dia.Element.define('MooD.VLabel', labelDefaults, labelProtoProps)
}

export function definePhaseExtent () {
  return joint.dia.Element.define('MooD.PhaseExtent', {
    attrs: {
      path: {
        refDResetOffset:
                  'L 100 0'
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup'
    }]
  })
}

export function defineExternalData () {
  return joint.dia.Element.define('MooD.ExternalData', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 20 0 L 100 0 ' +
                  'A 20 20 0 0 0 100 40 ' +
                  'L 20 40 ' +
                  'A 20 20 0 0 1 20 0'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.4,
        refY: 0.5,
        refWidth: 0.8
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineDatabase () {
  return joint.dia.Element.define('MooD.Database', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 20 0 L 100 0 ' +
                  'A 20 20 0 0 0 100 40 ' +
                  'A 20 20 0 0 0 100 0 ' +
                  'A 20 20 0 0 0 100 40 ' +
                  'L 20 40 ' +
                  'A 20 20 0 0 1 20 0'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.35,
        refY: 0.5,
        refWidth: 0.8
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineDocument () {
  return joint.dia.Element.define('MooD.Document', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 0 0 L 100 0 ' +
                  'L 100 30 ' +
                  'C 80 30 85 30 60 35 ' +
                  'S 15 45 0 40 ' +
                  'L 0 0'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.4,
        refWidth: 1.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineData () {
  return joint.dia.Element.define('MooD.Data', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 20 0 L 100 0 ' +
                  'L 80 40 ' +
                  'L 0 40 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.5,
        refWidth: 1.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineOther () {
  return joint.dia.Element.define('MooD.Other', {
    attrs: {
      path: {
        refDResetOffset:
                  'M 0 10 L 100 0 ' +
                  'L 100 40 ' +
                  'L 0 40 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.6,
        refWidth: 1.0
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-io'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-io-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineOffPageOutput () {
  return joint.dia.Element.define('MooD.OffPageOutput', {
    attrs: {
      path: {
        refDResetOffset:
                  'L 100 0 ' +
                  'L 100 30 ' +
                  'L 50 40 ' +
                  'L 0 30 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.33,
        refWidth: 1.0,
        refHeight: 0.75
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineOffPageInput () {
  return joint.dia.Element.define('MooD.OffPageInput', {
    attrs: {
      path: {
        refDResetOffset:
                  'L 100 0 ' +
                  'L 100 40 ' +
                  'L 50 30 ' +
                  'L 0 40 ' +
                  'Z'
      },
      label: {
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refX: 0.5,
        refY: 0.33,
        refWidth: 1.0,
        refHeight: 0.75
      },
      title: {
      }
    }
  }, {
    markup: [{
      tagName: 'path',
      selector: 'body',
      groupSelector: 'bodyGroup',
      className: 'mood-graph-step'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-label'
    }, {
      tagName: 'title',
      selector: 'title'
    }]
  })
}

export function defineStepGroup () {
  return joint.dia.Element.define('MooD.StepGroup', {
    attrs: {
      body: {
        refWidth: 1,
        refHeight: 1
      },
      label: {
        textVerticalAnchor: 'bottom',
        textAnchor: 'start',
        refX: '0%',
        refY: '0%',
        refWidth: 1.0
      }
    }
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
      className: 'mood-graph-step-group'
    }, {
      tagName: 'text',
      selector: 'label',
      className: 'mood-graph-step-group-label'
    }]
  })
}
