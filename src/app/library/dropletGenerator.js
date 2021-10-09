import Template from './template'
import paper from 'paper'
import ComponentPort from '../core/componentPort'

export default class DropletGenerator extends Template {
  constructor () {
    super()
  }

  __setupDefinitions () {
    this.__unique = {
      position: 'Point'
    }

    this.__heritable = {
      componentSpacing: 'Float',
      orificeSize: 'Float',
      orificeLength: 'Float',
      oilInputWidth: 'Float',
      waterInputWidth: 'Float',
      outputWidth: 'Float',
      outputLength: 'Float',
      height: 'Float',
      rotation: 'Float'
    }

    this.__defaults = {
      componentSpacing: 1000,
      orificeSize: 0.2 * 1000,
      orificeLength: 0.4 * 1000,
      oilInputWidth: 0.8 * 1000,
      waterInputWidth: 0.6 * 1000,
      outputWidth: 0.6 * 1000,
      outputLength: 0.6 * 1000,
      height: 250,
      rotation: 0
    }

    this.__units = {
      componentSpacing: 'μm',
      orificeSize: 'μm',
      height: 'μm',
      orificeLength: 'μm',
      oilInputWidth: 'μm',
      waterInputWidth: 'μm',
      outputWidth: 'μm',
      outputLength: 'μm',
      rotation: '°'
    }

    this.__minimum = {
      componentSpacing: 0,
      orificeSize: 10,
      orificeLength: 10,
      oilInputWidth: 10,
      waterInputWidth: 10,
      outputWidth: 10,
      outputLength: 10,
      height: 10,
      rotation: 0
    }

    this.__maximum = {
      componentSpacing: 10000,
      orificeSize: 2000,
      orificeLength: 2000,
      oilInputWidth: 2000,
      waterInputWidth: 2000,
      outputWidth: 2000,
      outputLength: 2000,
      height: 1200,
      rotation: 360
    }

    this.__featureParams = {
      componentSpacing: 'componentSpacing',
      position: 'position',
      orificeSize: 'orificeSize',
      orificeLength: 'orificeLength',
      oilInputWidth: 'oilInputWidth',
      waterInputWidth: 'waterInputWidth',
      outputWidth: 'outputWidth',
      outputLength: 'outputLength',
      height: 'height',
      rotation: 'rotation'
    }

    this.__targetParams = {
      componentSpacing: 'componentSpacing',
      orificeSize: 'orificeSize',
      orificeLength: 'orificeLength',
      oilInputWidth: 'oilInputWidth',
      waterInputWidth: 'waterInputWidth',
      outputWidth: 'outputWidth',
      outputLength: 'outputLength',
      height: 'height',
      rotation: 'rotation'
    }

    this.__placementTool = 'componentPositionTool'

    this.__toolParams = {
      position: 'position'
    }

    this.__renderKeys = ['FLOW']

    this.__mint = 'NOZZLE DROPLET GENERATOR'
  }

  getPorts (params) {
    const orificeSize = params.orificeSize
    const orificeLength = params.orificeLength
    const oilInputWidth = params.oilInputWidth
    const waterInputWidth = params.waterInputWidth
    const outputWidth = params.outputWidth
    const outputLength = params.outputLength

    const ports = []

    // Oil Top
    ports.push(new ComponentPort(oilInputWidth / 2, -waterInputWidth / 2, '1', 'FLOW'))

    // Out
    ports.push(new ComponentPort(oilInputWidth + orificeLength + outputLength, 0, '2', 'FLOW'))

    // Oil Bottom
    ports.push(new ComponentPort(oilInputWidth / 2, waterInputWidth / 2, '3', 'FLOW'))

    // Input
    ports.push(new ComponentPort(0, 0, '4', 'FLOW'))

    return ports
  }

  render2D (params, key = 'FLOW') {
    const pos = params.position
    const x = pos[0]
    const y = pos[1]
    const color = params.color
    const orificeSize = params.orificeSize
    const orificeLength = params.orificeLength
    const oilInputWidth = params.oilInputWidth
    const waterInputWidth = params.waterInputWidth
    const outputWidth = params.outputWidth
    const outputLength = params.outputLength
    const rotation = params.rotation

    const ret = new paper.Path()

    const p1 = new paper.Point(x, y - waterInputWidth / 2)

    const p2 = new paper.Point(p1.x + oilInputWidth, p1.y)

    const p3 = new paper.Point(p2.x, p2.y + (waterInputWidth / 2 - orificeSize / 2))

    const p4 = new paper.Point(p3.x + orificeLength, p3.y)

    const p5 = new paper.Point(p4.x, p4.y - (outputWidth / 2 - orificeSize / 2))

    const p6 = new paper.Point(p5.x + outputLength, p5.y)

    const p7 = new paper.Point(p6.x, p6.y + outputWidth)

    const p8 = new paper.Point(p7.x - outputLength, p7.y)

    const p9 = new paper.Point(p8.x, p8.y - (outputWidth / 2 - orificeSize / 2))

    const p10 = new paper.Point(p9.x - orificeLength, p9.y)

    const p11 = new paper.Point(p10.x, p10.y + (waterInputWidth / 2 - orificeSize / 2))

    const p12 = new paper.Point(p11.x - oilInputWidth, p11.y)

    ret.add(p1)
    ret.add(p2)
    ret.add(p3)
    ret.add(p4)
    ret.add(p5)
    ret.add(p6)
    ret.add(p7)
    ret.add(p8)
    ret.add(p9)
    ret.add(p10)
    ret.add(p11)
    ret.add(p12)

    // Rotate the geometry
    ret.rotate(-rotation, new paper.Point(pos[0], pos[1]))

    ret.closed = true
    ret.fillColor = color
    return ret
  }

  render2DTarget (key, params) {
    const render = this.render2D(params, key)
    render.fillColor.alpha = 0.5
    return render
  }
}
