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
var EdgedRectLine = function(params){
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
      //  radius: width/2,
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

var EdgedRect = function(params){
    let length  = params["length"];
    let width = params["width"];
    let start = params["position"];
    let borderWidth = params["borderWidth"];
    let color = params["color"];
    let baseColor = params["baseColor"];
    let startX = start[0];
    let startY = start[1];
    let endX = startX + width;
    let endY = startY + length;
    //
    // if (start[0] < end[0]){
    //     startX = start[0];
    //     endX = end[0];
    // } else {
    //     startX = end[0];
    //     endX = start[0];
    // }
    // if (start[1] < end[1]){
    //     startY = start[1];
    //     endY = end[1];
    // } else {
    //     startY = end[1];
    //     endY = start[1];
    // }

    // startX -= borderWidth/2;
    // startY -= borderWidth/2;
    // endX += borderWidth/2;
    // endY += borderWidth/2;

    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);

    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
     //   radius: borderWidth/2,
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
    let pos = new paper.Point(position[0], position[1]);
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

var GroverValve = function(params){
    let minRadiusInMicrometers = 8/paper.view.zoom;
    let position = params["position"];
    let gap = params["gap"];
    let radius = params["valveRadius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let center = new paper.Point(position[0], position[1]);
   // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
    var circ = new paper.Path.Circle(center, radius);
    //circ.fillColor = color;
 //   if (String(color) == "3F51B5") {
        var cutout;
        if (orientation == "H") {
            cutout = paper.Path.Rectangle({
                from: new paper.Point(position[0] - gap / 2, position[1] - radius),
                to: new paper.Point(position[0] + gap / 2, position[1] + radius)
            });
        }
        else {
            cutout = paper.Path.Rectangle({
                from: new paper.Point(position[0] - radius, position[1] - gap / 2),
                to: new paper.Point(position[0] + radius, position[1] + gap / 2)
            });
        }
        //cutout.fillColor = "white";
        var valve = new paper.CompoundPath(circ, cutout);
        valve.fillColor = color;
        valve.fillRule = 'evenodd';
        console.log(color);
        return valve;
 //   }
 //   else {
 //       circ.FillColor = color;
 //       return circ;
 //   }
}

var CircleTarget = function(params){
    let targetRadius;
    let radius1;
    let radius2;
    if (params.hasOwnProperty("diameter")) targetRadius = params["diameter"]/2;
    else {
        if (params.hasOwnProperty("portRadius")) {
            radius1 = portRadius;
            radius2 = portRadius;
        }
        else {
            radius1 = params["radius1"];
            radius2 = params["radius2"];
            if (radius1 > radius2) targetRadius = radius1;
            else targetRadius = radius2;
        }
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

var Diamond = function(params){
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let cw = params["channelWidth"];
    let l = params["length"];
    let w = params["width"];
    let orientation = params["orientation"];
    let color = params["color"];
    let p0, p1, p2, p3, p4, p5;
    if (orientation == "V"){
        p0 = [px - cw/2, py - l/2];
        p1 = [px + cw/2, py - l/2];
        p2 = [px + w + cw/2, py];
        p3 = [px + cw/2, py + l/2];
        p4 = [px - cw/2, py + l/2];
        p5 = [px - cw/2 - w, py];
    }
    else{
        p0 = [px - l/2, py - cw/2];
        p1 = [px  - l/2, py + cw/2];
        p2 = [px, py + w + cw/2];
        p3 = [px + l/2, py + cw/2];
        p4 = [px + l/2, py - cw/2];
        p5 = [px, py - cw/2 - w];
    }
    var hex = new paper.Path();
    hex.add(new paper.Point(p0));
    hex.add(new paper.Point(p1));
    hex.add(new paper.Point(p2));
    hex.add(new paper.Point(p3));
    hex.add(new paper.Point(p4));
    hex.add(new paper.Point(p5));
    hex.closed = true;
    hex.fillColor = color;
    return hex;
}

var DiamondTarget = function(params){
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let cw = params["channelWidth"];
    let l = params["length"];
    let w = params["width"];
    let orientation = params["orientation"];
    let color = params["color"];
    let p0, p1, p2, p3, p4, p5;
    if (orientation == "V"){
        p0 = [px - cw/2, py - l/2];
        p1 = [px + cw/2, py - l/2];
        p2 = [px + w + cw/2, py];
        p3 = [px + cw/2, py + l/2];
        p4 = [px - cw/2, py + l/2];
        p5 = [px - cw/2 - w, py];
    }
    else{
        p0 = [px - l/2, py - cw/2];
        p1 = [px  - l/2, py + cw/2];
        p2 = [px, py + w + cw/2];
        p3 = [px + l/2, py + cw/2];
        p4 = [px + l/2, py - cw/2];
        p5 = [px, py - cw/2 - w];
    }
    var hex = new paper.Path();
    hex.add(new paper.Point(p0));
    hex.add(new paper.Point(p1));
    hex.add(new paper.Point(p2));
    hex.add(new paper.Point(p3));
    hex.add(new paper.Point(p4));
    hex.add(new paper.Point(p5));
    hex.closed = true;
    hex.fillColor = color;
    hex.fillColor.alpha = 0.5;
    hex.strokeColor = "#FFFFFF";
    hex.strokeWidth = 3 / paper.view.zoom;
    if(hex.strokeWidth > w/2) hex.strokeWidth = w/2;
    //console.log(Math.ceil(Math.log2(7)));
    return hex;
}

var Mixer = function(params){
    position = params["position"];
    bendSpacing = params["bendSpacing"];
    numBends = params["numberOfBends"];
    channelWidth = params["channelWidth"];
    bendLength = params["bendLength"];
    orientation = params["orientation"];
    let color = params["color"];
    var serpentine = new paper.Path();
    let startX, startY;
    if (orientation == "V"){
        startX = position[0] + 0.5*bendLength;
        startY = position[1];
        serpentine.add(new paper.Point(startX, startY));
        for (i = 0; i < numBends; i++) {
            serpentine.add(new paper.Point(startX + 0.5*bendLength, startY + 2*i*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX + 0.5*bendLength, startY + (2*i+1)*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX - 0.5*bendLength, startY + (2*i+1)*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX - 0.5*bendLength, startY + (2*i+2)*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX + channelWidth, startY + (2*i+2)*(bendSpacing + channelWidth)));
        }
    }
    else {
        startX = position[0];
        startY = position[1] + 0.5*bendLength;
        serpentine.add(new paper.Point(startX, startY));
        for (i = 0; i < numBends; i++) {
            serpentine.add(new paper.Point(startX + 2*i*(bendSpacing + channelWidth) , startY - 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+1)*(bendSpacing + channelWidth), startY - 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+1)*(bendSpacing + channelWidth), startY + 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+2)*(bendSpacing + channelWidth), startY + 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+2)*(bendSpacing + channelWidth), startY - channelWidth));
        }
    }
    serpentine.strokeColor = color;
    serpentine.strokeWidth = channelWidth;
    return serpentine;
}

var MixerTarget = function(params){
    position = params["position"];
    bendSpacing = params["bendSpacing"];
    numBends = params["numberOfBends"];
    channelWidth = params["channelWidth"];
    bendLength = params["bendLength"];
    orientation = params["orientation"];
    let color = params["color"];
    var serpentine = new paper.Path();
    let startX, startY;
    if (orientation == "V"){
        startX = position[0] + 0.5*bendLength;
        startY = position[1];
        serpentine.add(new paper.Point(startX, startY));
        for (i = 0; i < numBends; i++) {
            serpentine.add(new paper.Point(startX + 0.5*bendLength, startY + 2*i*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX + 0.5*bendLength, startY + (2*i+1)*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX - 0.5*bendLength, startY + (2*i+1)*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX - 0.5*bendLength, startY + (2*i+2)*(bendSpacing + channelWidth)));
            serpentine.add(new paper.Point(startX + channelWidth, startY + (2*i+2)*(bendSpacing + channelWidth)));
        }
    }
    else {
        startX = position[0];
        startY = position[1] + 0.5*bendLength;
        serpentine.add(new paper.Point(startX, startY));
        for (i = 0; i < numBends; i++) {
            serpentine.add(new paper.Point(startX + 2*i*(bendSpacing + channelWidth) , startY - 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+1)*(bendSpacing + channelWidth), startY - 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+1)*(bendSpacing + channelWidth), startY + 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+2)*(bendSpacing + channelWidth), startY + 0.5*bendLength));
            serpentine.add(new paper.Point(startX + (2*i+2)*(bendSpacing + channelWidth), startY - channelWidth));
        }
    }
    serpentine.strokeColor = color;
    serpentine.strokeColor.alpha = 0.5;
    serpentine.strokeWidth = channelWidth;
    return serpentine;
}

var Tree = function(params) {
    position  = params["position"];
    cw = params["flowChannelWidth"];
    orientation = params["orientation"];
    spacing = params["spacing"];
    leafs = params["leafs"];
    color = params["color"];
    width = params["width"];
    startX = position[0];
    startY = position[1];
    var pathList = [];
    var inNodes = [];
    var currentPath = new paper.Path();

    if (orientation == "V") {
        for (i = 0; i < leafs; i++) {
            inNodes.push(new paper.Point(startX, startY + i*(cw + spacing)));
        }
        while (inNodes.length > 1) {
            var outNodes = [];
            for (i = 0; i < inNodes.length; i += 2) {
                currentPath.add(inNodes[i]);
                currentPath.add(new paper.Point(inNodes[i].x + 3*cw, inNodes[i].y));
                currentPath.add(new paper.Point(inNodes[i+1].x + 3*cw, inNodes[i+1].y));
                currentPath.add(new paper.Point(inNodes[i+1]));
                outNodes.push(new paper.Point((inNodes[i].x + 3*cw, inNodes[i].y + inNodes[i+1].y)/2));
            }

            pathList.push(currentPath);
            currentPath = new paper.Path();
            inNodes = outNodes;
        }
        pathList.push(new paper.Point(width, pathList[pathList.length-1].y));
    }
    else {
        for (i = 0; i < leafs; i++) {
            inNodes.push(new paper.Point(startX + i * (cw + spacing), startY));
        }
        while (inNodes.length > 1) {
            var outNodes = [];
            for (i = 0; i < inNodes.length; i += 2) {
                currentPath.add(inNodes[i]);
                currentPath.add(new paper.Point(inNodes[i].x, inNodes[i].y + 3 * cw));
                currentPath.add(new paper.Point(inNodes[i + 1].x, inNodes[i + 1].y + 3 * cw));
                currentPath.add(new paper.Point(inNodes[i + 1]));
                outNodes.push(new paper.Point((inNodes[i].x + inNodes[i + 1].x) / 2, inNodes[i].y + 3 * cw));
            }

            pathList.push(currentPath);
            currentPath = new paper.Path();
            inNodes = outNodes;
        }
    }
    tree_path = new paper.CompoundPath(pathList);
    tree_path.strokeColor = color;
    tree_path.strokeWidth = cw;

    return tree_path;
}

var TreeTarget = function(params) {
    position  = params["position"];
    cw = params["flowChannelWidth"];
    orientation = params["orientation"];
    spacing = params["spacing"];
    leafs = params["leafs"];
    color = params["color"];
    startX = position[0];
    startY = position[1];
    var pathList = [];
    var inNodes = [];
    var currentPath = new paper.Path();

    if (orientation == "V") {
        for (i = 0; i < leafs; i++) {
            inNodes.push(new paper.Point(startX, startY + i*(cw + spacing)));
        }
        while (inNodes.length > 1) {
            var outNodes = [];
            for (i = 0; i < inNodes.length; i += 2) {
                currentPath.add(inNodes[i]);
                currentPath.add(new paper.Point(inNodes[i].x + 3*cw, inNodes[i].y));
                currentPath.add(new paper.Point(inNodes[i+1].x + 3*cw, inNodes[i+1].y));
                currentPath.add(new paper.Point(inNodes[i+1]));
                outNodes.push(new paper.Point((inNodes[i].x + 3*cw, inNodes[i].y + inNodes[i+1].y)/2));
            }

            pathList.push(currentPath);
            currentPath = new paper.Path();
            inNodes = outNodes;
        }
    }
    else {
        for (i = 0; i < leafs; i++) {
            inNodes.push(new paper.Point(startX + i * (cw + spacing), startY));
        }
        while (inNodes.length > 1) {
            var outNodes = [];
            for (i = 0; i < inNodes.length; i += 2) {
                currentPath.add(inNodes[i]);
                currentPath.add(new paper.Point(inNodes[i].x, inNodes[i].y + 3 * cw));
                currentPath.add(new paper.Point(inNodes[i + 1].x, inNodes[i + 1].y + 3 * cw));
                currentPath.add(new paper.Point(inNodes[i + 1]));
                outNodes.push(new paper.Point((inNodes[i].x + inNodes[i + 1].x) / 2, inNodes[i].y + 3 * cw));
            }

            pathList.push(currentPath);
            currentPath = new paper.Path();
            inNodes = outNodes;
        }
    }
    tree_path = new paper.CompoundPath(pathList);
    tree_path.strokeColor = color;
    tree_path.strokeColor.alpha = 0.5;
    tree_path.strokeWidth = cw;

    return tree_path;
};

var CellTrapL = function(params) {
    let orientation = (params["orientation"] == "V");
    let position = params["position"];
    let chamberLength = params["chamberLength"];
    let numChambers = params["numChambers"];
    let chamberWidth = params["chamberWidth"];
    let feedingChannelWidth = params["feedingChannelWidth"];
    let chamberSpacing = params["chamberSpacing"];
    let color = params["color"];
    let x = position[0];
    let y = position[1];
    let chamberList = [];
    var rec;
    var traps;
    var channels;

    if (orientation) {
        for (i = 0; i < numChambers/2; i++) {
            rec = paper.Path.Rectangle({
                size: [2*chamberLength + feedingChannelWidth, chamberWidth],
                point: [x, y + i*(chamberWidth + chamberSpacing)],
                fillColor: color
            });
            chamberList.push(rec);
        }
        channels = paper.Path.Rectangle({
            point: [x + chamberLength, y],
            size: [feedingChannelWidth, numChambers/2*(chamberWidth + chamberSpacing)],
            fillColor: color
        });
        chamberList.push(channels);
    }
    else {
        for (i = 0; i < numChambers/2; i++) {
            rec = paper.Path.Rectangle({
                size: [chamberWidth, 2*chamberLength + feedingChannelWidth],
                point: [x + i*(chamberWidth + chamberSpacing), y],
                fillColor: color
            });
            chamberList.push(rec);
        }
        channels = paper.Path.Rectangle({
            point: [x, y + chamberLength],
            size: [numChambers/2*(chamberWidth + chamberSpacing), feedingChannelWidth],
            fillColor: color
        });
        chamberList.push(channels);
    }
    traps = new paper.CompoundPath(chamberList);
    traps.fillColor = color;
    return traps;
};

var CellTrapLTarget = function(params) {
    let orientation = (params["orientation"] == "V");
    let position = params["position"];
    let chamberLength = params["chamberLength"];
    let numChambers = params["numChambers"];
    let chamberWidth = params["chamberWidth"];
    let feedingChannelWidth = params["feedingChannelWidth"];
    let chamberSpacing = params["chamberSpacing"];
    let color = params["color"];
    let x = position[0];
    let y = position[1];

    let chamberList = [];
    var rec;
    var traps;
    var channels;

    if (orientation) {
        for (i = 0; i < numChambers/2; i++) {
            rec = paper.Path.Rectangle({
                size: [2*chamberLength + feedingChannelWidth, chamberWidth],
                point: [x, y + i*(chamberWidth + chamberSpacing)],
                fillColor: color
            });
            chamberList.push(rec);
        }
        channels = paper.Path.Rectangle({
            point: [x + chamberLength, y],
            size: [feedingChannelWidth, numChambers/2*(chamberWidth + chamberSpacing)],
            fillColor: color
        });
        chamberList.push(channels);
    }
    else {
        for (i = 0; i < numChambers/2; i++) {
            rec = paper.Path.Rectangle({
                size: [chamberWidth, 2*chamberLength + feedingChannelWidth],
                point: [x + i*(chamberWidth + chamberSpacing), y],
                fillColor: color
            });
            chamberList.push(rec);
        }
        channels = paper.Path.Rectangle({
            point: [x, y + chamberLength],
            size: [numChambers/2*(chamberWidth + chamberSpacing), feedingChannelWidth],
            fillColor: color
        });
        chamberList.push(channels);
    }
    traps = new paper.CompoundPath(chamberList);
    traps.fillColor = color;
    traps.fillColor.alpha = 0.5;
    return traps;
};

var DropletGen = function(params) {
    let pos = params["position"];
    let color = params["color"];
    let A = params["orificeSize"];
    let B = 4.8*A;
    let C = 6.71*A;
    let D = 2.09*A;
    let E = 4.85*A;
    //var vertices = [];
    let v1, v2, v3, v4, v5, v6, v7, v8, v9, v10;
    v1 = [pos[0] - D/2, pos[1] - A/2];
    v2 = [pos[0] - A/2, pos[1] - E/2];
    v3 = [pos[0] + A/2, pos[1] - E/2];
    v4 = [pos[0] + D/2, pos[1] - A/2];
    v5 = [pos[0] + D/2 + C, pos[1] - B/2];
    v6 = [pos[0] + D/2 + C, pos[1] + B/2];
    v7 = [pos[0] + D/2, pos[1] + A/2];
    v8 = [pos[0] + A/2, pos[1] + E/2];
    v9 = [pos[0] - A/2, pos[1] + E/2];
    v10 = [pos[0] - D/2, pos[1] + A/2];

    var decahedron = new paper.Path();
    decahedron.add(new paper.Point(v1));
    decahedron.add(new paper.Point(v2));
    decahedron.add(new paper.Point(v3));
    decahedron.add(new paper.Point(v4));
    decahedron.add(new paper.Point(v5));
    decahedron.add(new paper.Point(v6));
    decahedron.add(new paper.Point(v7));
    decahedron.add(new paper.Point(v8));
    decahedron.add(new paper.Point(v9));
    decahedron.add(new paper.Point(v10));
    decahedron.closed = true;
    decahedron.fillColor = color;
    //decahedron.strokeColor = "#FFFFFF";
    //decahedron.strokeWidth = 3 / paper.view.zoom;
    return decahedron;
};

var DropletGenTarget = function(params) {
    let pos = params["position"];
    let color = params["color"];
    let A = params["orificeSize"];
    let B = 4.8*A;
    let C = 6.71*A;
    let D = 2.09*A;
    let E = 4.85*A;
    //var vertices = [];
    let v1, v2, v3, v4, v5, v6, v7, v8, v9, v10;
    v1 = [pos[0] - D/2, pos[1] - A/2];
    v2 = [pos[0] - A/2, pos[1] - E/2];
    v3 = [pos[0] + A/2, pos[1] - E/2];
    v4 = [pos[0] + D/2, pos[1] - A/2];
    v5 = [pos[0] + D/2 + C, pos[1] - B/2];
    v6 = [pos[0] + D/2 + C, pos[1] + B/2];
    v7 = [pos[0] + D/2, pos[1] + A/2];
    v8 = [pos[0] + A/2, pos[1] + E/2];
    v9 = [pos[0] - A/2, pos[1] + E/2];
    v10 = [pos[0] - D/2, pos[1] + A/2];

    var decahedron = new paper.Path();
    decahedron.add(new paper.Point(v1));
    decahedron.add(new paper.Point(v2));
    decahedron.add(new paper.Point(v3));
    decahedron.add(new paper.Point(v4));
    decahedron.add(new paper.Point(v5));
    decahedron.add(new paper.Point(v6));
    decahedron.add(new paper.Point(v7));
    decahedron.add(new paper.Point(v8));
    decahedron.add(new paper.Point(v9));
    decahedron.add(new paper.Point(v10));
    decahedron.closed = true;
    decahedron.fillColor = color;
    decahedron.fillColor.alpha = 0.5;
    //decahedron.strokeColor = "#FFFFFF";
    //decahedron.strokeWidth = 3 / paper.view.zoom;
    return decahedron;
}

module.exports.RoundedRectLine = RoundedRectLine;
module.exports.EdgedRectLine = EdgedRectLine;
module.exports.GradientCircle = GradientCircle;
module.exports.RoundedRect = RoundedRect;
module.exports.EdgedRect = EdgedRect;
module.exports.CircleTarget = CircleTarget;
module.exports.GroverValve = GroverValve;
module.exports.Diamond = Diamond;
module.exports.DiamondTarget = DiamondTarget;
module.exports.Mixer = Mixer;
module.exports.MixerTarget = MixerTarget;
module.exports.EdgedRect = EdgedRect;
module.exports.Tree = Tree;
module.exports.TreeTarget = TreeTarget;
module.exports.CellTrapL = CellTrapL;
module.exports.CellTrapLTarget = CellTrapLTarget;
module.exports.DropletGen = DropletGen;
module.exports.DropletGenTarget = DropletGenTarget;
