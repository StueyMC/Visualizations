//
//    Entry function declaration
//
// import * as d3 from "d3"
import * as Data from './process-data'
import { Diagram } from './diagram'
import * as Types from './element-types'
import * as Highlight from './highlighter'
/**
 *
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
  //
  // Get package version number
  //
  const packageVersion = config.version
  //
  // Retrieve configuration
  //
  const inputs = config.inputs
  const style = config.style
  const width = parseFloat(config.width)
  const height = parseFloat(config.height)
  //  var animation = config.animation
  const data = config.data

  let diagram = null
  let process
  let highlighter

  const diagramConfig = {
    config,
    handleClickEvent: handleClickEvents,
    otherOffPageConnector
  }

  const superInputChanged = config.functions.inputChanged
  config.functions.inputChanged = inputChanged
  /**
   * Return details of the partner off page connector, i.e. the id of the off page at the other
   * end of the flow from an off page connector.
   * If the element is not an off page connector the function returns undefined
   * @param {Data} element Data element
   * @returns object containing Graph.GraphCell of partner off page connector element and an indicator of
   * whether other connector is an output or input connector
   */
  function otherOffPageConnector (element) {
    let retVal
    if (element instanceof Data.Step) {
      const flow = process.getLinkSet().getFlow(element.originalId())
      if (element.type() === Types.offPageInput) {
        retVal = {
          element: flow.outputConnector().graphElement(),
          input: false
        }
      } else if (element.type() === Types.offPageOutput) {
        let otherElement
        if (flow.inputConnector()) {
          otherElement = flow.inputConnector()
        } else {
          // Multiple flows merged into a single off page input connector
          // Find the flow into the target that has the off page input connector
          otherElement = flow.target().inFlows().filter(flow => flow.inputConnector())[0].inputConnector()
        }
        retVal = {
          element: otherElement.graphElement(),
          input: true
        }
      }
    }
    return retVal
  }
  /**
   * Handle change to input.
   * There is only a single input which controls which nodes are highlighted
   * @param {String} name name of input
   * @param {*} value GUID(s) (string or array)
   */
  function inputChanged (name, value) {
    superInputChanged(name, value)

    if (name === 'highlightNode') {
      if (!highlighter) {
        config.functions.errorOccurred('handleHighlighting is not initialised')
        return false
      }

      highlighter.changeHighlight(value)
    }

    return true
  }

  function handleClickEvents (eventData) {
    try {
      const element = eventData.element
      const id = element.originalId()
      const isNavigable = !process.testNavigation() || element.navigable()

      if (!isNavigable) {
        if (!(element instanceof Data.Phase)) { // Highlighting not implemented on phases
          config.functions.performAction('Non-navigable Node Click', id, eventData.event)
        }
      } else if (element instanceof Data.Step) { // process step
        config.functions.performAction('Process Step Click', id, eventData.event)
      } else if (element instanceof Data.Information) {
        if (element.type() === Types.process) {
          config.functions.performAction('Process Click', element.originalId(), eventData.event)
        } else {
          config.functions.performAction('Process I/O Click', element.originalId(), eventData.event)
        }
      } else if (element instanceof Data.Actor) { // swimlane
        config.functions.performAction('Actor Click', id, eventData.event)
      } else if (element instanceof Data.Swimlane) { // swimlane
        config.functions.performAction('Actor Click', id, eventData.event)
      } else if (element instanceof Data.Phase) {
        config.functions.performAction('Phase Click', id, eventData.event)
      } else if (element instanceof Data.Flow) {
        config.functions.performAction('Link Click', id, eventData.event)
      } else if (element instanceof Data.IOLink) {
        config.functions.performAction('I/O Link Click', id, eventData.event)
      } else if (element instanceof Data.StepGroup) {
        config.functions.performAction('Activity Group Click', id, eventData.event)
      } else { // error
        throw new Error('Process Flow Custom Visualization: No valid click handler for element')
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
   * Set navigability of a process flow diagram element
   * @param {bool} isNavigable Indicates if element has a model to navigate to
   * @param {string} id Identifier of element
   * @param {Data.*} element Element object
   * @param {string} elementTypeName Name of the type of the element
   */
  function setElementNavigable (isNavigable, id, element, elementTypeName) {
    if (element) {
      // console.log('Set navigable for ' + elementTypeName + ' "' + element.name() + '" to ' + JSON.stringify(isNavigable))
      element.setNavigable(isNavigable)
    } else {
      console.log('Could not find ' + elementTypeName + ' with "' + id + '" to set navigability to ' + JSON.stringify(isNavigable))
    }
  }
  /**
   * Set navigability of a step
   * @param {bool} isNavigable Indicates if step has a model to navigate to
   * @param {string} id Identifier of step
   */
  function setStepNavigable (isNavigable, id) {
    setElementNavigable(isNavigable, id, process.getStepSet().getStep(id), 'step')
  }
  /**
   * Set navigability of an actor
   * @param {bool} isNavigable Indicates if actor has a model to navigate to
   * @param {string} id Identifier of actor
   */
  function setActorNavigable (isNavigable, id) {
    setElementNavigable(isNavigable, id, process.getActorSet().getActor(id), 'actor')
  }
  /**
   * Set navigability of an Information item
   * @param {bool} isNavigable Indicates if Information has a model to navigate to
   * @param {string} id Identifier of Information
   */
  function setInfoNavigable (isNavigable, id) {
    setElementNavigable(isNavigable, id, process.getInformationSet().getInformation(id).original, 'information')
  }
  /**
   * Set navigability of a Phase
   * @param {bool} isNavigable Indicates if Phase has a model to navigate to
   * @param {string} id Identifier of Phase
   */
  function setPhaseNavigable (isNavigable, id) {
    setElementNavigable(isNavigable, id, process.getPhaseSet().getPhase(id), 'phase')
  }
  /**
   * Set navigability of a Flow
   * @param {bool} isNavigable Indicates if Flow has a model to navigate to
   * @param {string} id Identifier of Flow
   */
  function setFlowNavigable (isNavigable, id) {
    setElementNavigable(isNavigable, id, process.getLinkSet().getFlow(id), 'flow')
  }
  /**
   * Set navigability of an I/O Link
   * @param {bool} isNavigable Indicates if link has a model to navigate to
   * @param {string} id Identifier of link
   */
  function setLinkNavigable (isNavigable, id) {
    setElementNavigable(isNavigable, id, process.getLinkSet().getLink(id), 'link')
  }
  /**
   * Set navigability of a Step Group
   * @param {bool} isNavigable Indicates if step group has a model to navigate to
   * @param {string} id Identifier of step group
   */
  function setGroupNavigable (isNavigable, id) {
    setElementNavigable(isNavigable, id, process.getStepGroupSet().getStepGroup(id), 'step group')
  }
  /**
   * Determine which elements are navigable. This is designed to be executed on a timeout after the
   * process flow has been fully rendered
   */
  function determineNavigability () {
    if (process.testNavigation()) {
      const testNavigationAction = 'Test Navigation'
      const actions = [
        {
          typeName: 'Process Step',
          ids: process.getStepSet().steps().map(step => step.originalId()),
          callback: setStepNavigable
        },
        {
          typeName: 'Actor',
          ids: process.getActorSet().actors().map(actor => actor.originalId()),
          callback: setActorNavigable
        },
        {
          typeName: 'Information',
          ids: process.getInformationSet().informationArray().map(infoLibrary => infoLibrary.original.originalId()),
          callback: setInfoNavigable
        },
        {
          typeName: 'Phase',
          ids: process.getPhaseSet().phases().map(phase => phase.originalId()),
          callback: setPhaseNavigable
        },
        {
          typeName: 'Flow',
          ids: process.getLinkSet().flows().map(flow => flow.originalId()),
          callback: setFlowNavigable
        },
        {
          typeName: 'Input Link',
          ids: process.getLinkSet().inputs().map(input => input.originalId()),
          callback: setLinkNavigable
        },
        {
          typeName: 'Output Link',
          ids: process.getLinkSet().outputs().map(output => output.originalId()),
          callback: setLinkNavigable
        },
        {
          typeName: 'Step Group',
          ids: process.getStepGroupSet().stepGroups().map(output => output.originalId()),
          callback: setGroupNavigable
        }
      ]
      actions.forEach(function (action) {
        // console.log('Call hasAction for ' + action.typeName + '(' + testNavigationAction + ') with ' + action.ids.length + ' ids')
        if (action.ids.length > 0) {
          config.functions.hasAction(testNavigationAction, action.ids, action.callback)
        }
      })
    }
  }

  try {
    process = new Data.Process(data, style.disableIOSwimlanes)
    //
    // Test change of state
    //
    const editable = config.state.editable
    const state = config.state.value
    if (editable) {
      console.log('State: ' + JSON.stringify(state))
      let newState
      try {
        newState = JSON.parse(state)
      } catch (e) {
        const errorMessage = 'Error parsing state - ' + e.name + ': ' + e.message
        console.error(errorMessage)
        config.functions.errorOccurred(errorMessage)
      }
      // if (typeof state !== 'object' || Array.isArray(state) || state === null) {
      //   newState = {}
      // }
      if (!newState[process.id()]) {
        newState[process.id()] = {}
      }
      const processState = newState[process.id()]
      processState.name = process.name()
      processState.packageVersion = packageVersion
      config.functions.updateState(JSON.stringify(newState))
    }
    //
    // End of change of state testing
    //
    diagram = new Diagram(process, style, width, height, diagramConfig)
    highlighter = new Highlight.Highlighter(process)
    const drawingReport = diagram.draw()

    if (typeof config.functions.updateSize === 'function') {
      config.functions.updateSize(diagram.width(), diagram.height())
      console.log('Updated size to ' + diagram.width() + ' x ' + diagram.height())
    }

    if (!config.animation && drawingReport) {
      // If rendering the diagram in BA rather than the web
      const mainEl = document.getElementById(config.element)
      let warningEl
      if (drawingReport.failedLinks && drawingReport.failedLinks.length > 0) {
        //
        // If there are links that couldn't be drawn properly
        // display a warning above the process header
        //
        warningEl = document.createElement('text')
        warningEl.style.margin = 'auto'
        warningEl.style.textAlign = 'center'
        warningEl.style.display = 'block'
        warningEl.innerText = 'Warning, failed to route the following links:'
        mainEl.insertBefore(warningEl, mainEl.childNodes[0])
        drawingReport.failedLinks.forEach(function (linkId) {
          const lineBreakEl = document.createElement('br')
          const flow = process.getLinkSet().getFlow(linkId)
          const textEl = document.createElement('text')
          if (flow) {
            textEl.innerText += '"' + flow.source().name() + '" to "' + flow.target().name() + '"'
          } else {
            textEl.innerText += linkId
          }
          warningEl.append(lineBreakEl)
          warningEl.append(textEl)
        })
      }
      if (drawingReport.portConflicts.length > 0) {
        //
        // If there are input and output flow port conflicts
        // display a warning above the process header
        //
        warningEl = document.createElement('text')
        warningEl.style.margin = 'auto'
        warningEl.style.textAlign = 'center'
        warningEl.style.display = 'block'
        warningEl.innerText = 'Warning, flow conflicts:'
        mainEl.insertBefore(warningEl, mainEl.childNodes[0])
        drawingReport.portConflicts.forEach(function (errorMessage) {
          const lineBreakEl = document.createElement('br')
          const textEl = document.createElement('text')
          textEl.innerText += errorMessage
          warningEl.append(lineBreakEl)
          warningEl.append(textEl)
        })
      }
    }

    //
    // Highlight nodes defined in input
    //
    if (inputs.highlightNode && inputs.highlightNode !== '') {
      inputChanged('highlightNode', inputs.highlightNode)
    }
    //
    // Determine if primary actions are available for nodes
    //
    window.setTimeout(function () { determineNavigability() }, 500)
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
}
