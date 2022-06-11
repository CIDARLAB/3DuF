import * as Colors from "../colors"; // pixels
import paper from "paper";
import Device from "@/app/core/device";
const DEFAULT_STROKE_COLOR = Colors.GREY_700;
const BORDER_THICKNESS = 5;

export default class DeviceRenderer {
    static renderLayerMask(device: Device) {
        const width = device.getXSpan();
        const height = device.getYSpan();
        let fillColor = new paper.Color(Colors.WHITE);
        fillColor.alpha = 0.5;
        const mask = new paper.Path.Rectangle({
            from: new paper.Point(0, 0),
            to: new paper.Point(width, height),
            fillColor: fillColor,
            strokeColor: null
        });
        return mask;
    }

    static renderDevice(device: Device, strokeColor = DEFAULT_STROKE_COLOR) {
        const background = new paper.Path.Rectangle({
            from: paper.view.bounds.topLeft.subtract(new paper.Point(paper.view.size)),
            to: paper.view.bounds.bottomRight.add(new paper.Point(paper.view.size)),
            fillColor: new paper.Color(Colors.BLUE_50),
            strokeColor: null
        });
        const thickness = BORDER_THICKNESS / paper.view.zoom;
        const xspan = device.getXSpan();
        const yspan = device.getYSpan();
        const border = new paper.Path.Rectangle({
            from: new paper.Point(0, 0),
            to: new paper.Point(xspan, yspan),
            fillColor: Colors.WHITE,
            strokeColor: strokeColor,
            strokeWidth: thickness
        });

        const group = new paper.Group([background, border]);

        return group;
    }
}
