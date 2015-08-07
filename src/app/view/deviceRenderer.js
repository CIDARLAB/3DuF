var Colors = require("./colors");
var DEFAULT_STROKE_COLOR = Colors.GREY_700;
var BORDER_THICKNESS = 5; // pixels

function renderDevice(device, strokeColor = DEFAULT_STROKE_COLOR) {
    let background = new paper.Path.Rectangle({
        from: paper.view.bounds.topLeft,
        to: paper.view.bounds.bottomRight,
        fillColor: Colors.GREY_200,
        strokeColor: null
    })
    let thickness = BORDER_THICKNESS / paper.view.zoom;
    let width = device.params.getValue("width");
    let height = device.params.getValue("height");
    let border = new paper.Path.Rectangle({
        from: new paper.Point(0, 0),
        to: new paper.Point(width, height),
        fillColor: Colors.WHITE,
        strokeColor: strokeColor,
        strokeWidth: thickness
    });

    let group = new paper.Group([background, border]);

    return group;
}

module.exports.renderDevice = renderDevice;