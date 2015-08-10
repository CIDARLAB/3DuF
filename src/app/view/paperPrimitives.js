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

var RoundedChamber = function(start, end, borderWidth){
    let startX;
    let startY;
    let endX;
    let endY;

    if (start[0] < end[0]){
        startX = start[0];
        endX = end[0];
    } else {
        startX = end[0];
        endX = start[0];
    }
    if (start[1] < end[1]){
        startY = start[1];
        endY = end[1];
    } else {
        startY = end[1];
        endY = start[1];
    }

    startX -= borderWidth/2;
    startY -= borderWidth/2;
    endX += borderWidth/2;
    endY += borderWidth/2;

    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);

    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: borderWidth/2
    });
    return rec;
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
module.exports.RoundedChamber = RoundedChamber;