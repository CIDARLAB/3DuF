var Colors = require("./colors");

var RoundedRect = function(start, end, width){
    let startPoint = new paper.Point(start[0], start[1]);
    let endPoint = new paper.Point(end[0], end[1]);
    let vec = endPoint.subtract(startPoint);
    let rec = paper.Path.Rectangle({
        size: [vec.length + width, width],
        point: start,
        radius: width/2
    });
    rec.translate([-width/2, -width / 2]);
    rec.rotate(vec.angle, start);
    return rec;
}

var Circle = function(position, radius){
    let pos = new paper.Point(position);
    let circ = new paper.Path.Circle(pos, radius);
    return circ;
}

var GradientCircle = function(position, radius1, radius2, color1, color2){
    let pos = new paper.Point(position);
    let ratio = radius2 / radius1;
    let outerCircle = Circle(position, radius1);
    outerCircle.fillColor = {
        gradient: {
            stops: [[color2, ratio], [color1, ratio]],
            radial: true
        },
        origin: pos,
        destination: outerCircle.bounds.rightCenter
    };
    return outerCircle;
}

var CircleTarget = function(position, radius, color = Colors.BLUE_300){
    if (radius < 8 / paper.view.zoom) radius = 8 / paper.view.zoom;
    let circ = Circle(position, radius);
    circ.fillColor = color
    circ.fillColor.alpha = .5;
    circ.strokeColor = Colors.WHITE;
    circ.strokeWidth = 3 / paper.view.zoom;
    if(circ.strokeWidth > radius/2) circ.strokeWidth = radius/2;
    return circ;
}

module.exports.RoundedRect = RoundedRect;
module.exports.Circle = Circle;
module.exports.CircleTarget = CircleTarget;
module.exports.GradientCircle = GradientCircle;