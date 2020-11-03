export class StretchedChord {
  constructor (config) {
    const StretchedChord = this

    StretchedChord._width = parseFloat(config.width)
    StretchedChord._height = parseFloat(config.height)
    StretchedChord._arcThickness = config.style.arcThickness
    StretchedChord._arcCentreSeparation = config.style.arcCentreSeparation
    StretchedChord._labelMargin = config.style.labelMargin
    StretchedChord._labelFontSize = config.style.labelFontSize
    StretchedChord._labelFontFamily = config.style.labelFontFamily
    StretchedChord._labelOffsetFactor = 0.6

    const arcHeight = StretchedChord._height - config.style.headerHeight - config.style.footerHeight
    const arcWidth = StretchedChord._width - StretchedChord._arcCentreSeparation - 2 * StretchedChord._labelMargin
    const maxDimension = Math.max(arcHeight, arcWidth)
    const minDimension = Math.min(arcHeight, arcWidth)
    //
    // Constrain arc angle by viewing area aspect ratio
    // Only a square view will display a full sem-circle
    //
    StretchedChord._arcStartAngle = 2 * Math.atan(maxDimension / minDimension) - Math.PI / 2
    //
    // Calculate the radius of the arc to fit the size of the view area
    //
    StretchedChord._outerRadius = minDimension / 2 /
      (1 - Math.cos(Math.PI / 2 - StretchedChord._arcStartAngle)) *
      arcHeight / maxDimension
    //
    // Calculate the horizontal offset of the LHS arc centre from centre of view area
    // The RHS arc centre offset is -1 * this
    //
    const arcCentreOffset = StretchedChord._labelMargin + StretchedChord._outerRadius - StretchedChord._width / 2
    StretchedChord.arcCentreOffset = () => arcCentreOffset

    StretchedChord._innerRadius = StretchedChord._outerRadius - StretchedChord._arcThickness

    const nodeSeparationAngle = config.style.nodeSeparation / StretchedChord._innerRadius
    StretchedChord.nodeSeparationAngle = () => nodeSeparationAngle

    StretchedChord._flowPeriod = config.style.flowPeriod
    StretchedChord._flowOpacity = config.style.flowOpacity
    //
    // Calculate offsets from centre of view area to left boundary of label areas
    // The LHS boundary would need to change to right boundary if right aligning LHS labels
    //
    const lhsLabelOffset = arcCentreOffset - StretchedChord._arcThickness / 2 - StretchedChord._labelMargin * 0.9 - StretchedChord._outerRadius * (1 - StretchedChord._labelOffsetFactor)
    StretchedChord.lhsLabelOffset = () => lhsLabelOffset
    const rhsLabelOffset = -arcCentreOffset + StretchedChord._arcThickness / 2 + StretchedChord._outerRadius * (1 - StretchedChord._labelOffsetFactor)
    StretchedChord.rhsLabelOffset = () => rhsLabelOffset

    this.dataChanged = function dataChanged () {
      // store nodes in a dictionary for fast lookup
      var _NodeDict = {}

      // Copy RHS nodes from configuration data
      StretchedChord._RHSnodes = config.data.RHSnodes.map(function (node) {
        // setup node details and add it to the node dictionary for use with links
        node.size = 0
        node.sizeIn = 0
        node.sizeOut = 0
        node.lastLinkEndAngle = 0
        node.lhs = false
        _NodeDict[node.id] = _NodeDict[node.id] === undefined ? node : _NodeDict[node.id]
        return node
      })

      // Copy LHS nodes from configuration data
      StretchedChord._LHSnodes = config.data.LHSnodes.map(function (node) {
        // setup node details and add it to the node dictionary for use with links
        node.size = 0
        node.sizeIn = 0
        node.sizeOut = 0
        node.lastLinkEndAngle = 0
        node.lhs = true
        _NodeDict[node.id] = _NodeDict[node.id] === undefined ? node : _NodeDict[node.id]
        return node
      })

      var _totalLinkBandwidth = 0

      // Copy links from configuration data and sort them in RHSnode order
      StretchedChord._links = config.data.links.sort(function (a, b) {
        // arrange links based on node IDs to allow for better connection/less crossing
        var _AID = _NodeDict[a.target.id] === undefined ? undefined : _NodeDict[a.target.id].lhs === false ? a.target.id : a.source.id
        var _BID = _NodeDict[b.target.id] === undefined ? undefined : _NodeDict[b.target.id].lhs === false ? b.target.id : b.source.id
        return (_AID === undefined || _BID === undefined) ? 0 : _AID.localeCompare(_BID)
      }).map(function (l) {
        // lookup source and target nodes
        l._sourceNode = _NodeDict[l.source.id]
        l._targetNode = _NodeDict[l.target.id]

        // make sure both nodes aren't left hand side
        if (l._sourceNode !== undefined && l._targetNode !== undefined && l._sourceNode.lhs !== l._targetNode.lhs) {
          // update total bandwidth
          _totalLinkBandwidth += l.size

          // add onto node bandwidths
          l._sourceNode.size += l.size
          l._sourceNode.sizeOut += l.size
          l._targetNode.size += l.size
          l._targetNode.sizeIn += l.size
          return l
        }

        // finally filter out all nulls
        return null
      }).filter(l => (l != null))

      function calculateLinkAngles (_link, _SourceOrTarget) {
        // if first link on node then start at node start
        var _Node = _SourceOrTarget === 'source' ? _link._sourceNode : _link._targetNode

        if (_Node.lastLinkEndAngle === 0) {
          _link[_SourceOrTarget].startAngle = _Node.startAngle
        } else {
          _link[_SourceOrTarget].startAngle = _Node.lastLinkEndAngle
        }

        // calculate link end position and update the last position on Node
        _link[_SourceOrTarget].endAngle = _link[_SourceOrTarget].startAngle + ((_Node.endAngle - _Node.startAngle) * (_link.size / _Node.size))
        _Node.lastLinkEndAngle = _link[_SourceOrTarget].endAngle
      }

      // setup variables for node size calculations
      var _TotalLeftSize = (Math.PI - 2 * StretchedChord._arcStartAngle - (StretchedChord.nodeSeparationAngle() * (StretchedChord._LHSnodes.length - 1)))
      var _TotalRightSize = (Math.PI - 2 * StretchedChord._arcStartAngle - (StretchedChord.nodeSeparationAngle() * (StretchedChord._RHSnodes.length - 1)))
      var _MinimumSizeRight = (config.style.minimumNodeSizePercentage / 100)
      var _MinimumSizeLeft = (config.style.minimumNodeSizePercentage / 100)

      var _TotalLeftBandwidth = 0
      var _TotalRightBandwidth = 0
      var _LHSAngleLeftAfterMinimum = 1
      var _RHSAngleLeftAfterMinimum = 1

      function calculateNodeSizing (_Node, _vars) {
        // store current node percentage size for easier typing
        var _nodeBWPercentage = _Node.size / _totalLinkBandwidth

        // check if node is left hand side
        if (_Node.lhs) {
          // check if node size is less than minimum
          if (_nodeBWPercentage * _LHSAngleLeftAfterMinimum < _MinimumSizeLeft) {
            _vars.leftTooSmall++
          } else {
            // add node to bandwidth calculations
            _TotalLeftBandwidth += _Node.size
          }
        } else {
          if (_nodeBWPercentage * _RHSAngleLeftAfterMinimum < _MinimumSizeRight) {
            _vars.rightTooSmall++
          } else {
            _TotalRightBandwidth += _Node.size
          }
        }
      }

      // decrease minimum sizes while
      function checkSizeCalculations () {
        // store past variables between loops
        var _vars = {
          oldLeftTooSmall: 0,
          oldRightTooSmall: 0,
          leftTooSmall: 0,
          rightTooSmall: 0
        }

        do {
          // dynamically resize minimum size by 1% until it either
          // fails because it's smaller than 0.1% or succeeds
          if (_vars.leftTooSmall * _MinimumSizeLeft > 1) {
            do {
              _MinimumSizeLeft *= 0.99
            } while (_vars.leftTooSmall * _MinimumSizeLeft > 1 && _MinimumSizeLeft > 0.001)
            _MinimumSizeLeft = _MinimumSizeLeft * _vars.leftTooSmall > 1 ? 0 : _MinimumSizeLeft
          }

          // do the same for the right side
          if (_vars.rightTooSmall * _MinimumSizeRight > 1) {
            do {
              _MinimumSizeRight *= 0.99
            } while (_vars.rightTooSmall * _MinimumSizeRight > 1 && _MinimumSizeRight > 0.001)
            _MinimumSizeRight = _MinimumSizeRight * _vars.rightTooSmall > 1 ? 0 : _MinimumSizeRight
          }

          // calculate remaining total size modifier
          _LHSAngleLeftAfterMinimum = 1 - (_vars.leftTooSmall * _MinimumSizeLeft)
          _RHSAngleLeftAfterMinimum = 1 - (_vars.rightTooSmall * _MinimumSizeRight)

          // update past loop variables
          _vars.oldLeftTooSmall = _vars.leftTooSmall
          _vars.oldRightTooSmall = _vars.rightTooSmall
          _vars.leftTooSmall = 0
          _vars.rightTooSmall = 0

          // reset variables used during this loop
          _TotalLeftBandwidth = 0
          _TotalRightBandwidth = 0;

          // check minimum sizes are fine with every node
          [StretchedChord._LHSnodes, StretchedChord._RHSnodes].forEach(arrayArray => (arrayArray.forEach(function (node) { calculateNodeSizing(node, _vars) })))
        } while (_vars.leftTooSmall !== _vars.oldLeftTooSmall || _vars.rightTooSmall !== _vars.oldRightTooSmall)
      }

      function calculateNodeAngles (_Node, _Index, _NodeArray) {
        // check if node is on the right or left side
        var _offset = _Node.lhs === true ? -1 : 1
        var _nodeSize = 0

        // check if node is on the left
        if (_Node.lhs) {
          // check if node size is less than minimum
          if (_Node.size / _totalLinkBandwidth * _LHSAngleLeftAfterMinimum < _MinimumSizeLeft) {
            // set node size to be minimum
            _nodeSize = _TotalLeftSize * _MinimumSizeLeft
          } else {
            // set node size to be modified based on available size
            _nodeSize = ((_Node.size / _TotalLeftBandwidth) * _LHSAngleLeftAfterMinimum) * _TotalLeftSize
          }
        } else {
          // do the same for the right side
          if (_Node.size / _totalLinkBandwidth * _RHSAngleLeftAfterMinimum < _MinimumSizeRight) {
            _nodeSize = _TotalRightSize * _MinimumSizeRight
          } else {
            _nodeSize = ((_Node.size / _TotalRightBandwidth) * _RHSAngleLeftAfterMinimum) * _TotalRightSize
          }
        }

        // setup start and end angle
        _Node.startAngle = _Index === 0 ? _offset * StretchedChord._arcStartAngle : (_NodeArray[_Index - 1].endAngle + (_offset * StretchedChord.nodeSeparationAngle()))
        _Node.endAngle = _Node.startAngle + (_offset * _nodeSize)

        // apply any colouring to the node
        _Node.colour = config.style.nodeColour
        _Node.stroke = config.style.nodeBorderColour
      }

      checkSizeCalculations();
      [StretchedChord._LHSnodes, StretchedChord._RHSnodes].forEach(arrayArray => (arrayArray.forEach(function (node, index, array) { calculateNodeAngles(node, index, array) })))

      // Do one final sort on the links to arrange them so that
      // the chord is linked from top down I.E top left to top right
      StretchedChord._links.sort(function (a, b) {
        var _aSource = a._sourceNode.lhs === true ? a._sourceNode : a._targetNode
        var _bSource = b._sourceNode.lhs === true ? b._sourceNode : b._targetNode
        if (_aSource.startAngle > _bSource.startAngle) { return -1 }
        if (_aSource.startAngle < _bSource.startAngle) { return 1 }
        return 0
      })

      // calculate start and end angle for links
      StretchedChord._links.forEach(function (l) {
        calculateLinkAngles(l, 'source')
        calculateLinkAngles(l, 'target')
      })
    }

    this.sourceChanged = function sourceChanged (value) {
      StretchedChord.dataChanged()
    }

    this.initialise = function initialise () {
      StretchedChord.sourceChanged()
    }
  }
}
