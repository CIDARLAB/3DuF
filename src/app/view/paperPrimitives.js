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

module.exports.RoundedRect = RoundedRect;
module.exports.Circle = Circle;