var RoundedRectLine = function(params){
    let start = params["start"];
    let end = params["end"];
    let color = params["color"];
    let width = params["width"];
    let baseColor = params["baseColor"];
    let startPoint = new paper.Point(start[0], start[1]);
    let endPoint = new paper.Point(end[0], end[1]);
    let vec = endPoint.subtract(startPoint);
    let rec = paper.Path.Rectangle({
        size: [vec.length + width, width],
        point: start,
        radius: width/2,
        fillColor: color
    });
    rec.translate([-width/2, -width / 2]);
    rec.rotate(vec.angle, start);
    return rec;
}

var RoundedRect = function(params){
    let start = params["start"];
    let end = params["end"];
    let borderWidth = params["borderWidth"];
    let color = params["color"];
    let baseColor = params["baseColor"];
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
        radius: borderWidth/2,
        fillColor: color
    });
    return rec;
}

var GradientCircle = function(params){
    let position = params["position"];
    let radius1 = params["radius1"];
    let radius2 = params["radius2"];
    let color1 = params["color"];
    let color2 = params["baseColor"];
    let pos = new paper.Point(position);
    let ratio = radius2 / radius1;
    let targetRatio;
    let targetRadius;
    if (ratio > 1) {
        targetRatio = 1;
        targetRadius = radius2;
    }
    else {
        targetRatio = ratio;
        targetRadius = radius1;
    }
    let outerCircle = new paper.Path.Circle(pos, targetRadius);
    outerCircle.fillColor = {
        gradient: {
            stops: [[color1, targetRatio], [color2, targetRatio]],
            radial: true
        },
        origin: pos,
        destination: outerCircle.bounds.rightCenter
    };
    return outerCircle;
}

var CircleTarget = function(params){
    let targetRadius;
    if (params.hasOwnProperty("diameter")) targetRadius = params["diameter"]/2;
    else {
        let radius1 = params["radius1"];
        let radius2 = params["radius2"];
        if (radius1 > radius2) targetRadius = radius1;
        else targetRadius = radius2;
    }
    let minSize = 8; //pixels
    let minSizeInMicrometers = 8/paper.view.zoom;
    let position = params["position"];
    let color = params["color"];
    let pos = new paper.Point(position[0], position[1]);
    if (targetRadius < minSizeInMicrometers) targetRadius = minSizeInMicrometers;
    let circ = new paper.Path.Circle(pos, targetRadius);
    circ.fillColor = color
    circ.fillColor.alpha = .5;
    circ.strokeColor = "#FFFFFF";
    circ.strokeWidth = 3 / paper.view.zoom;
    if(circ.strokeWidth > targetRadius/2) circ.strokeWidth = targetRadius/2;
    return circ;
}

module.exports.RoundedRectLine = RoundedRectLine;
module.exports.GradientCircle = GradientCircle;
module.exports.RoundedRect = RoundedRect;
module.exports.CircleTarget = CircleTarget;
