/**
 * @jest-environment jsdom
 */

import { visualization } from '../visualization'
import * as Data from '../process-data'
import { Diagram } from '../diagram'
 
//const { testEnvironment } = require('../../../jest.config')

jest.mock('../process-data')
jest.mock('../diagram')

var mockErrorOccurred = jest.fn(e => e)
var mockInputChanged = jest.fn((name, value) => {})
var mockDataChanged = jest.fn((data) => {})
var mockUpdateState = jest.fn((state) => {})

const config = {
  version: '2.6.1',
  width: '1500px',
  height: '600px',
  element: 'visualisation01_element_guid',
  functions: {
    errorOccurred: mockErrorOccurred,
    inputChanged: mockInputChanged,
    dataChanged: mockDataChanged,
    updateState: mockUpdateState
  },
  data :
  {
    "process": {"id": "55-786B4C023FBE4FF0884ABAAA1B16C640", "name": "BP 150 - Managing Support Impacts in Response to Design Change", "version": "1.0"}, 
  },
  inputs : {
    "highlightNode": ""
  },
  style: {
     "horizontalStepsAllowed": true,
     "horizontalDecisionsAllowed": true,
     "renderProcessHeader": false,
     "renderSwimlaneWatermarks": false,
     "gridSize": 10,
     "verticalStepSeparation": 40,
     "verticalIOSeparation": 10,
     "stepStandoff": 10,
     "ioStandoff": 5,
     "linkLabelStandoff": 70,
     "processHeaderHeight": 20,
     "swimlaneWatermarkSpacing": 600,
     "inputSwimlaneLabel": "Inputs",
     "outputSwimlaneLabel": "Outputs",
     "disableIOSwimlanes": true,
     "phaseLabelWidth": 40,
     "stepGroupPadding": 15,
     "elementSizes": {
         "Process Step": {"width": 100, "height": 60},
         "Decision": {"width": 100, "height": 100},
         "Off Page Input": {"width": 100, "height": 60},
         "Off Page Output": {"width": 100, "height": 60},
         "Sub Process": {"width": 100, "height": 60},
         "Process": {"width": 100, "height": 30},
         "Start": {"width": 100, "height": 40},
         "End": {"width": 100, "height": 40},
         "Document / Form": {"width": 100, "height": 40},
         "External Data": {"width": 100, "height": 40},
         "Database / Application": {"width": 100, "height": 40},
         "Data": {"width": 100, "height": 40},
         "Other": {"width": 100, "height": 40}
     }
  },
  state: {
    value: "{\"dummy\": {\"x\": 1}}",
    editable: false
  }
}
//
// Get package version number
//
const packageVersion = config.version

describe('Visualisation', () => {
    const mockDiagramHeight = jest.fn().mockReturnValue(123)
    const mockDiagramDraw = jest.fn()
    const mockProcessId = jest.fn().mockReturnValue('Process Id')
    const mockProcessName = jest.fn().mockReturnValue('Process Name')
    const mockDataProcess = 'Data.Process object'
    beforeAll(() => {
        Diagram.mockImplementation(() => {
          return {
            height: mockDiagramHeight,
            draw: mockDiagramDraw
            }
          })
      })
    beforeAll(() => {
        Data.Process.mockImplementation(() => {
            return {
              id: mockProcessId,
              name: mockProcessName,
              value: mockDataProcess
            }
        })
    })
    beforeEach(() => jest.clearAllMocks())
  
    it('Successful create', () => {
      document.body.innerHTML =
              '<div id="visualisation01_element_guid"></div>'
  
      visualization(config)
  
      expect(mockErrorOccurred).not.toHaveBeenCalled()
      expect(mockProcessId).not.toHaveBeenCalled()
      expect(mockProcessName).not.toHaveBeenCalled()
      expect(mockUpdateState).not.toHaveBeenCalled()
      expect(Data.Process).toHaveBeenCalledWith(config.data, config.style.disableIOSwimlanes)
      expect(Diagram).toHaveBeenCalledWith(Data.Process.mock.results[0].value, config.style, 1500, 600, Diagram.mock.calls[0][4])
      expect(mockDiagramHeight).toHaveBeenCalledTimes(0)
      expect(mockDiagramDraw).toHaveBeenCalledTimes(1)

      
    //   var element = document.getElementById('visualisation01_element_guid' + '_procHeader')
    //   expect(element).not.toBeNull()
    })

    it('Successful create, editable state', () => {
      document.body.innerHTML =
              '<div id="visualisation01_element_guid"></div>'
  
      config.state.editable = true

      visualization(config)
  
      expect(mockErrorOccurred).not.toHaveBeenCalled()
      expect(mockProcessId).toHaveBeenCalled()
      expect(mockProcessName).toHaveBeenCalled()
      const expectedStateValue = JSON.parse(config.state.value)
      expectedStateValue[mockProcessId.mock.results[0].value] = {
        name: mockProcessName.mock.results[0].value,
        packageVersion
      }
      expect(mockUpdateState).toHaveBeenCalledWith(JSON.stringify(expectedStateValue))
      expect(Data.Process).toHaveBeenCalledWith(config.data, config.style.disableIOSwimlanes)
      expect(Diagram).toHaveBeenCalledWith(Data.Process.mock.results[0].value, config.style, 1500, 600, Diagram.mock.calls[0][4])
      expect(mockDiagramHeight).toHaveBeenCalledTimes(0)
      expect(mockDiagramDraw).toHaveBeenCalledTimes(1)

      
    //   var element = document.getElementById('visualisation01_element_guid' + '_procHeader')
    //   expect(element).not.toBeNull()
    })

})
  