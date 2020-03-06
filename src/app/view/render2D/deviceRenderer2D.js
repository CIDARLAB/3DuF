import * as Colors from "../colors";
const DEFAULT_STROKE_COLOR = Colors.GREY_700;
const BORDER_THICKNESS = 5; // pixels
import paper from "paper";

export default class DeviceRenderer {
    static renderLayerMask(device) {
        let width = device.getXSpan();
        let height = device.getYSpan();
        let mask = new paper.Path.Rectangle({
            from: new paper.Point(0, 0),
            to: new paper.Point(width, height),
            fillColor: Colors.WHITE,
            strokeColor: null
        });
        mask.fillColor.alpha = 0.5;
        return mask;
    }

    static renderDevice(device, strokeColor = DEFAULT_STROKE_COLOR) {
        let background = new paper.Path.Rectangle({
            from: paper.view.bounds.topLeft.subtract(paper.view.size),
            to: paper.view.bounds.bottomRight.add(paper.view.size),
            fillColor: Colors.BLUE_50,
            strokeColor: null
        });
        let thickness = BORDER_THICKNESS / paper.view.zoom;
        let xspan = device.getXSpan();
        let yspan = device.getYSpan();
        let border = new paper.Path.Rectangle({
            from: new paper.Point(0, 0),
            to: new paper.Point(xspan, yspan),
            fillColor: Colors.WHITE,
            strokeColor: strokeColor,
            strokeWidth: thickness
        });

        let group = new paper.Group([background, border]);

        return group;
    }
}
