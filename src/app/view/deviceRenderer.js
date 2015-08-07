var Colors = require("./colors");
var DEFAULT_STROKE_COLOR = Colors.GREY_700;
var BORDER_THICKNESS = 5; // pixels

function renderDevice(device, strokeColor = DEFAULT_STROKE_COLOR) {
    let thickness = BORDER_THICKNESS / paper.view.zoom;
    let width = device.params.getValue("width");
    let height = device.params.getValue("height");
    let border = new paper.Path.Rectangle({
        from: new paper.Point(0, 0),
        to: new paper.Point(width, height),
        fillColor: null,
        strokeColor: strokeColor,
        strokeWidth: thickness
    });
    return border;
}

module.exports.renderDevice = renderDevice;