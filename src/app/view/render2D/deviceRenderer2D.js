import * as Colors from '../colors' // pixels
import paper from 'paper'
const DEFAULT_STROKE_COLOR = Colors.GREY_700
const BORDER_THICKNESS = 5

export default class DeviceRenderer {
  static renderLayerMask (device) {
    const width = device.getXSpan()
    const height = device.getYSpan()
    const mask = new paper.Path.Rectangle({
      from: new paper.Point(0, 0),
      to: new paper.Point(width, height),
      fillColor: Colors.WHITE,
      strokeColor: null
    })
    mask.fillColor.alpha = 0.5
    return mask
  }

  static renderDevice (device, strokeColor = DEFAULT_STROKE_COLOR) {
    const background = new paper.Path.Rectangle({
      from: paper.view.bounds.topLeft.subtract(paper.view.size),
      to: paper.view.bounds.bottomRight.add(paper.view.size),
      fillColor: Colors.BLUE_50,
      strokeColor: null
    })
    const thickness = BORDER_THICKNESS / paper.view.zoom
    const xspan = device.getXSpan()
    const yspan = device.getYSpan()
    const border = new paper.Path.Rectangle({
      from: new paper.Point(0, 0),
      to: new paper.Point(xspan, yspan),
      fillColor: Colors.WHITE,
      strokeColor: strokeColor,
      strokeWidth: thickness
    })

    const group = new paper.Group([background, border])

    return group
  }
}
