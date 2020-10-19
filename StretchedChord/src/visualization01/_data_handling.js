export class StretchedChord {
  constructor (config) {
    if (!config.inputs.LHSnode) {
      config.functions.errorOccurred("The input for the 'Left Hand Side' is required to render properly.")
    }

    const StretchedChord = this
    const g = 0.005
    const sum = (accumulator, currentValue) => accumulator + currentValue

    StretchedChord._width = parseFloat(config.width)
    StretchedChord._height = parseFloat(config.height)
    StretchedChord._arcThickness = config.style.arcThickness
    StretchedChord._outerRadius = StretchedChord._width / 2
    StretchedChord._innerRadius = StretchedChord._outerRadius - StretchedChord._arcThickness
    StretchedChord._flowPeriod = config.style.flowPeriod
    StretchedChord._flowOpacity = config.style.flowOpacity

    this.dataChanged = function dataChanged () {

      function returnIDExists (d) {
        for (var l = 0; l < StretchedChord._LHSnode.length; l++) {
          if (StretchedChord._LHSnode[l].id === d) {
            return true
          }
        }
        return false
      }

      function findNode (_NodeID) {
        for (var _n = 0; _n < StretchedChord._LHSnode.length; _n++) {
          if (StretchedChord._LHSnode[_n].id === _NodeID) {
            return StretchedChord._LHSnode[_n]
          }
        }
        for (_n = 0; _n < StretchedChord._RHSnodes.length; _n++) {
          if (StretchedChord._RHSnodes[_n].id === _NodeID) {
            return StretchedChord._RHSnodes[_n]
          }
        }
        return -1
      }

      function findLinkIndex (_LinkID, _Array) {
        for (var _l = 0; _l < _Array.length; _l++) {
          if (_LinkID === _Array[_l].id) {
            return _l
          }
        }
        return -1
      }

      // Copy RHS nodes from configuration data
      StretchedChord._RHSnodes = config.data.nodes
        .filter(d => !returnIDExists(d.id))
        .map(d => (d))
      // Copy links from configuration data
      StretchedChord._links = config.data.links
        .map(d => (d))

      var _totalLinkBandwidth = 0
      var _totalRHSNodeBandwidth = 0
      var _totalLHSNodeBandwidth = 0

      // Calculate the total bandwith requirement of each RHS node
      // as the sum of the bandwidths of each link to or from the node
      StretchedChord._RHSnodes.forEach(function (node) {
        node.bw = StretchedChord._links
          .filter(link => node.id === (returnIDExists(link.source.id) ? link.target.id : link.source.id))
          .map(link => link.bw)
          .reduce(sum, 0)
        node.lastLinkEndAngle = 0
        node.sourceLinks = []
        node.targetLinks = []
        _totalRHSNodeBandwidth += node.bw
      })

      // Calculate the total bandwith requirement of the LHS node
      // as the sum of the bandwidths of each link to or from the node.
      StretchedChord._LHSnode.forEach(function (node) {
        node.bw = StretchedChord._links
          .filter(link => node.id === link.source.id)
          .map(link => link.bw)
          .reduce(sum, 0)
        node.lastLinkEndAngle = 0
        node.sourceLinks = []
        node.targetLinks = []
        _totalLHSNodeBandwidth += node.bw
      })

      StretchedChord._links.forEach(function (l) {
        _totalLinkBandwidth += l.bw
        findNode(l.source.id).sourceLinks.push(l)
        findNode(l.target.id).targetLinks.push(l)
      })


      // StretchedChord._LHSnode[0].bw = StretchedChord._links
      //   .filter(link => StretchedChord._LHSnode[0].id === link.source.id || StretchedChord._LHSnode[0].id === link.target.id)
      //   .map(link => link.bw)
      //   .reduce(sum, 0)

      StretchedChord._LHSnode.forEach(function (d, i, a) {
        d.startAngle = i === 0 ? -Math.acos(StretchedChord._height / StretchedChord._width) : (a[i - 1].endAngle + g)
        d.endAngle = d.startAngle - ((Math.PI - 2 * Math.acos(StretchedChord._height / StretchedChord._width) - (g * (a.length - 1))) * (d.bw / _totalLHSNodeBandwidth))
        d.criticality = config.style.nodeColour
        d.stroke = config.style.nodeBorderColour
      })

      StretchedChord._RHSnodes.forEach(function (d, i, a) {
        d.startAngle = i === 0 ? Math.acos(StretchedChord._height / StretchedChord._width) : (a[i - 1].endAngle + g)
        d.endAngle = d.startAngle + ((Math.PI - 2 * Math.acos(StretchedChord._height / StretchedChord._width) - (g * (a.length - 1))) * ((d.bw / _totalRHSNodeBandwidth)))

        //go through this and make it so that it takes into account the start and end angle of current
        //LHS node instead of just adding onto the end
        //something along the lines of
        // start angle = node last end angle + offset
        // end angle = node last end angle + ( ( node end angle - node start angle ) * ( link bandwidth / node bandwidth )

        //loop through all links that are connected to node
        //if first link of node then start angle = node start angle
        //else start angle = connected LHSnode end angle

        

        function calculateAngles (_SourceNode, _TargetNode, e, j, b) {
          e.source.startAngle = _SourceNode.startAngle
          e.target.startAngle = _TargetNode.startAngle
          e.source.endAngle = _SourceNode.endAngle
          e.target.endAngle = _TargetNode.endAngle

          var _SourceIndex = findLinkIndex(e.id, _SourceNode.sourceLinks)
          var _TargetIndex = findLinkIndex(e.id, _TargetNode.targetLinks)

          if (_SourceIndex === -1 || _TargetIndex === -1) {
            console.log('Source or Target missing')
          } else {
            if (_SourceIndex === 0) {
              e.source.startAngle = _SourceNode.startAngle
            } else {
              e.source.startAngle = _SourceNode.sourceLinks[_SourceIndex - 1].source.endAngle
            }

            if (_TargetIndex === 0) {
              e.target.startAngle = _TargetNode.startAngle
            } else {
              e.target.startAngle = _TargetNode.targetLinks[_TargetIndex - 1].target.endAngle
            }
          }

          // e[e.target.id === d.id ? 'target' : 'source'].startAngle = j === 0
          //   ? d.startAngle
          //   : returnIDExists(b[j - 1].target.id)
          //     ? b[j - 1].source.endAngle
          //     : b[j - 1].target.endAngle
          
          // e[e.target.id === d.id ? 'source' : 'target'].startAngle = i === 0 && j === 0
          //   ? 2 * Math.PI - Math.acos(StretchedChord._height / StretchedChord._width)
          //   : j === 0
          //     ? Math.min(...StretchedChord._links
          //       .filter(d => d.source.id === a[i - 1].id || d.target.id === a[i - 1].id)
          //       .map(d => returnIDExists(d.target.id) ? d.target.endAngle : d.source.endAngle))
          //     : returnIDExists(b[j - 1].target.id) ? b[j - 1].target.endAngle : b[j - 1].source.endAngle

          e[e.target.id === d.id ? 'target' : 'source'].endAngle = e[e.target.id === d.id ? 'target' : 'source'].startAngle + (d.endAngle - d.startAngle) * e.bw / d.bw
          e[e.target.id === d.id ? 'source' : 'target'].endAngle = e[e.target.id === d.id ? 'source' : 'target'].startAngle - ((Math.PI - 2 * Math.acos(StretchedChord._height / StretchedChord._width)) * e.bw / _totalLinkBandwidth)
        }

        StretchedChord._links.filter(l => l.source.id === d.id || l.target.id === d.id).forEach(function (e, j, b) {
          if (e.source.id === d.id) {
            calculateAngles(d, findNode(e.target.id), e, j, b)
          } else {
            calculateAngles(findNode(e.source.id), d, e, j, b)
          }
        })

        // StretchedChord._links.filter(l => l.source.id === d.id || l.target.id === d.id).forEach(function (e, j, b) {
        //   e[e.target.id === d.id ? 'target' : 'source'].startAngle = j === 0
        //     ? d.startAngle
        //     : returnIDExists(b[j - 1].target.id)
        //       ? b[j - 1].source.endAngle
        //       : b[j - 1].target.endAngle
        //   e[e.target.id === d.id ? 'source' : 'target'].startAngle = i === 0 && j === 0
        //     ? 2 * Math.PI - Math.acos(StretchedChord._height / StretchedChord._width)
        //     : j === 0
        //       ? Math.min(...StretchedChord._links
        //         .filter(d => d.source.id === a[i - 1].id || d.target.id === a[i - 1].id)
        //         .map(d => returnIDExists(d.target.id) ? d.target.endAngle : d.source.endAngle))
        //       : returnIDExists(b[j - 1].target.id) ? b[j - 1].target.endAngle : b[j - 1].source.endAngle

        //   e[e.target.id === d.id ? 'target' : 'source'].endAngle = e[e.target.id === d.id ? 'target' : 'source'].startAngle + (d.endAngle - d.startAngle) * e.bw / d.bw
        //   e[e.target.id === d.id ? 'source' : 'target'].endAngle = e[e.target.id === d.id ? 'source' : 'target'].startAngle - ((Math.PI - 2 * Math.acos(StretchedChord._height / StretchedChord._width)) * e.bw / _totalLinkBandwidth)
        // })

        d.criticality = config.style.nodeColour
        d.stroke = config.style.nodeBorderColour
      })
    }

    this.sourceChanged = function sourceChanged (value) {
      if (typeof StretchedChord._LHSnode === 'undefined') {
        StretchedChord._LHSnode = []
      }
      // Only handle source, aka LHS, as a single element: a string not an array
      if (typeof value === 'string' && value.length > 0) {
        StretchedChord._LHSnode = [Object.assign(config.data.nodes.find(d => d.id === value) || {}, { bw: 0 })]

        StretchedChord.dataChanged()
      } else if (Array.isArray(value) && value.length > 0) {
        for (var l = 0; l < value.length; l++) {
          if (!StretchedChord._LHSnode.includes(value[l])) {
            var _value = Object.assign(config.data.nodes.find(d => d.id === value[l]) || {}, { bw: 0 })
            StretchedChord._LHSnode.push(_value)
          }
        }
        StretchedChord.dataChanged()
      }
    }

    this.initialise = function initialise () {
      StretchedChord.sourceChanged(config.inputs.LHSnode)
    }
  }
}
