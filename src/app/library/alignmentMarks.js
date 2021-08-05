import Template from './template'
import paper from 'paper'

export default class AlignmentMarks extends Template {
  constructor () {
    super()
  }

  __setupDefinitions () {
    this.__unique = {
      position: 'Point'
    }

    this.__heritable = {
      componentSpacing: 'Float',
      width: 'Float',
      length: 'Float',
      height: 'Float'
    }

    this.__defaults = {
      width: 4000,
      length: 4000,
      height: 250
    }

    this.__units = {
      width: '&mu;m',
      length: '&mu;m',
      height: '&mu;m'
    }

    this.__minimum = {
      width: 10,
      length: 10,
      height: 10
    }

    this.__maximum = {
      width: 200000,
      length: 200000,
      height: 1200
    }

    this.__placementTool = 'multilayerPositionTool'

    this.__toolParams = {
      position: 'position'
    }

    this.__featureParams = {
      position: 'position',
      width: 'width',
      length: 'length'
    }

    this.__targetParams = {
      width: 'width',
      length: 'length'
    }

    this.__renderKeys = ['FLOW', 'CONTROL']

    this.__mint = 'ALIGNMENT MARKS'
  }

  render2D (params, key) {
    if (key === 'FLOW') {
      return this.__drawFlow(params)
    } else if (key === 'CONTROL') {
      return this.__drawControl(params)
    }
  }

  render2DTarget (key, params) {
    const position = params.position
    const width = params.width
    const length = params.length
    const color = params.color
    const center = new paper.Point(position[0], position[1])
    const ret = new paper.CompoundPath()
    const topleftpoint = new paper.Point(position[0] - width, position[1] - length)
    const bottomrightpoint = new paper.Point(position[0] + width, position[1] + length)

    const topleftrect = new paper.Path.Rectangle(topleftpoint, center)

    ret.addChild(topleftrect)

    const bottomrightrect = new paper.Path.Rectangle(position, bottomrightpoint)

    ret.addChild(bottomrightrect)

    const topmiddlepoint = new paper.Point(position[0], position[1] - length)
    const middlerightpoint = new paper.Point(position[0] + width, position[1])
    const middleleftpoint = new paper.Point(position[0] - width, position[1])
    const bottommiddlepoint = new paper.Point(position[0], position[1] + length)

    const toprightrect = new paper.Path.Rectangle(topmiddlepoint, middlerightpoint)

    ret.addChild(toprightrect)

    const bottomleftrect = new paper.Path.Rectangle(middleleftpoint, bottommiddlepoint)

    ret.addChild(bottomleftrect)

    ret.fillColor = color

    ret.fillColor.alpha = 0.5

    return ret
  }

  __drawFlow (params) {
    const position = params.position
    const width = params.width
    const length = params.length
    const color = params.color
    const center = new paper.Point(position[0], position[1])
    const ret = new paper.CompoundPath()
    const topleftpoint = new paper.Point(position[0] - width, position[1] - length)
    const bottomrightpoint = new paper.Point(position[0] + width, position[1] + length)

    const topleftrect = new paper.Path.Rectangle(topleftpoint, center)

    ret.addChild(topleftrect)

    const bottomrightrect = new paper.Path.Rectangle(position, bottomrightpoint)

    ret.addChild(bottomrightrect)

    ret.fillColor = color
    return ret
  }

  __drawControl (params) {
    const position = params.position
    const width = params.width
    const length = params.length
    const color = params.color
    const here = new paper.Point(position[0], position[1])
    const ret = new paper.CompoundPath()
    const topmiddlepoint = new paper.Point(position[0], position[1] - length)
    const middlerightpoint = new paper.Point(position[0] + width, position[1])
    const middleleftpoint = new paper.Point(position[0] - width, position[1])
    const bottommiddlepoint = new paper.Point(position[0], position[1] + length)

    const toprightrect = new paper.Path.Rectangle(topmiddlepoint, middlerightpoint)

    ret.addChild(toprightrect)

    const bottomleftrect = new paper.Path.Rectangle(middleleftpoint, bottommiddlepoint)

    ret.addChild(bottomleftrect)

    ret.fillColor = color
    return ret
  }
}
