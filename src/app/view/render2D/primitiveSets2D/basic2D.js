import paper from 'paper';

function drawStraightConnection(compoundpath, startpoint, endpoint, channelWidth){
    //edit the points
    let vec = endpoint.subtract(startpoint);
    let rec = new paper.Path.Rectangle({
        point: startpoint,
        radius: channelWidth/2,
        size: [vec.length + channelWidth, channelWidth]
    });
    rec.translate([-channelWidth/2, -channelWidth/2]);
    rec.rotate(vec.angle, startpoint);

    compoundpath.addChild(rec);
}

var Connection = function(params){
    let start = params["start"];
    let end = params["end"];
    let color = params["color"];
    let width = params["width"];
    let wayPoints = params["wayPoints"];
    let channelWidth = params["channelWidth"];
    let segments = params["segments"];
    let connectionpath = new paper.CompoundPath();
    let startpoint, endpoint;

    let p1, p2;

    for(let i in segments){
        let segment = segments[i];
        p1 = segment[0];
        p2 = segment[1];
        startpoint = new paper.Point(p1[0], p1[1]);
        endpoint = new paper.Point(p2[0], p2[1]);
        drawStraightConnection(connectionpath, startpoint, endpoint, channelWidth);
    }

    connectionpath.fillColor = color;
    return connectionpath;
};


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
        fillColor: color,
        strokeWidth: 0
    });
    rec.translate([-width/2, -width / 2]);
    rec.rotate(vec.angle, start);
    return rec;
};

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
        size: [vec.length, width],
        point: start,
        //  radius: width/2,
        fillColor: color,
        strokeWidth: 0
    });
    rec.translate([0, -width / 2]);
    rec.rotate(vec.angle, start);
    return rec;
};

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
        fillColor: color,
        strokeWidth: 0
    });
    return rec;
};

var CrossHairsTarget = function(params){
    let thickness = params["channelWidth"]/5;
    let length = params["channelWidth"];
    let x = params["position"][0];
    let y = params["position"][1];
    let color = params["color"];
    var chair = new paper.Path.Rectangle(x - length/2, y - thickness/2, length, thickness);
    chair = chair.unite(new paper.Path.Rectangle(x - thickness/2, y - length/2, thickness, length));
    chair.fillColor = color;
    chair.fillColor.alpha = 0.5;
    return chair;
};

var EdgedRect = function(params){
    let length  = params["length"];
    let width = params["width"];
    let start = params["position"];
    let borderWidth = params["borderWidth"];
    let color = params["color"];
    let baseColor = params["baseColor"];
    let startX = start[0] - width/2;
    let startY = start[1] - length/2;
    let endX = startX + width;
    let endY = startY + length;

    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);

    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        //   radius: borderWidth/2,
        fillColor: color,
        strokeWidth: 0
    });
    return rec;
};

var EdgedRectTarget = function(params){
    let length  = params["length"];
    let width = params["width"];
    let start = params["position"];
    let borderWidth = params["borderWidth"];
    let color = params["color"];
    let baseColor = params["baseColor"];
    let startX = start[0] - width/2;
    let startY = start[1] - length/2;
    let endX = startX + width;
    let endY = startY + length;

    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);

    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        //   radius: borderWidth/2,
        fillColor: color,
        strokeWidth: 0
    });
    rec.fillColor.alpha = 0.5;
    return rec;
};

var GradientCircle = function(params){
    let position = params["position"];
    let radius = params["portRadius"];
    let color1 = params["color"];
    let pos = new paper.Point(position[0], position[1]);
    let outerCircle = new paper.Path.Circle(pos, radius);
    outerCircle.fillColor = color1;
    return outerCircle;
};

var GroverValve = function(params){
    let position = params["position"];
    let gap = params["gap"];
    let radius = params["valveRadius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let rotation = params["rotation"];

    let center = new paper.Point(position[0], position[1]);
    // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
    let circ = new paper.Path.Circle(center, radius);
    //circ.fillColor = color;
    //   if (String(color) == "3F51B5") {
    let cutout = paper.Path.Rectangle({
            from: new paper.Point(position[0] - radius, position[1] - gap / 2),
            to: new paper.Point(position[0] + radius, position[1] + gap / 2)
        });
    //cutout.fillColor = "white";
    let valve = circ.subtract(cutout);
    valve.rotate(rotation, center);
    valve.fillColor = color;
    return valve;
};

var GroverValve_control = function(params){
    // let rotation = params["rotation"];
    let position = params["position"];
    let gap = params["gap"];
    let radius = params["valveRadius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let center = new paper.Point(position[0], position[1]);
    // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
    var circ = new paper.Path.Circle(center, radius);
    circ.fillColor = color;
    return circ;
};
//************************************
const Pump = function(params){

    let rec;
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let l = params["length"];
    let w = params["width"];
    let color = params["color"];
    let rotation = params["rotation"];
    let spacing = params["spacing"];
    let channelwidth = params["flowChannelWidth"];

    let startX = px - w / 2;
    let startY = py - l / 2;
    let endX = px + w / 2;
    let endY = py + l / 2;

    let ret = new paper.CompoundPath();

    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);


    rec = paper.Path.Rectangle({
        from: new paper.Point(px - channelwidth/2, py - spacing - l/2),
        to: new paper.Point(px + channelwidth/2, py + spacing + l/2),
    });

    ret.addChild(rec);

    ret.fillColor = color;
    return ret.rotate(rotation, px, py);

};

const Pump_control = function(params){
    let rec;
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let l = params["length"];
    let w = params["width"];
    let color = params["color"];
    let rotation = params["rotation"];
    let spacing = params["spacing"];

    let startX = px - w / 2;
    let startY = py - l / 2;
    let endX = px + w / 2;
    let endY = py + l / 2;

    let ret = new paper.CompoundPath();

    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);


    rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        fillColor: color,
        strokeWidth: 0
    });

    ret.addChild(rec);

    let topcenter = new paper.Point(px, py - spacing);

    rec = paper.Path.Rectangle({
        from: new paper.Point(topcenter.x - w/2, topcenter.y - l/2),
        to: new paper.Point(topcenter.x + w/2, topcenter.y + l/2)
    });

    ret.addChild(rec);

    let bottomcenter = new paper.Point(px, py + spacing);
    rec = paper.Path.Rectangle({
        from: new paper.Point(bottomcenter.x - w/2, bottomcenter.y - l/2),
        to: new paper.Point(bottomcenter.x + w/2, bottomcenter.y + l/2)
    });

    ret.addChild(rec);

    ret.fillColor = color;
    return ret.rotate(rotation, px, py);
};


const PumpTarget = function(params){
    let ret = new paper.CompoundPath();
    let flow = Pump(params);
    let control = Pump_control(params);
    ret.addChild(control);
    ret.addChild(flow);
    ret.fillColor = params["color"];
    ret.fillColor.alpha = 0.5;
    return ret;
};


//************************************
const Pump3D = function(params){
    let valve;
    let cutout;
    let circ;
    let center;
    let ret = new paper.CompoundPath();

    let position = params["position"];
    let gap = params["gap"];
    let radius = params["valveRadius"];
    let color = params["color"];
    let rotation = params["rotation"];
    let spacing = params["spacing"];
    let channelwidth = params["flowChannelWidth"];

    center = new paper.Point(position[0], position[1]);
    // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
    circ = new paper.Path.Circle(center, radius);
    //circ.fillColor = color;
    //   if (String(color) == "3F51B5") {
    cutout = paper.Path.Rectangle({
        from: new paper.Point(position[0] - radius, position[1] - gap / 2),
        to: new paper.Point(position[0] + radius, position[1] + gap / 2)
    });
    //cutout.fillColor = "white";
    valve = circ.subtract(cutout);
    ret.addChild(valve);

    let bottomcenter = new paper.Point(position[0], position[1] + spacing);
    console.log(bottomcenter);
    circ = new paper.Path.Circle(bottomcenter, radius);
    //circ.fillColor = color;
    //   if (String(color) == "3F51B5") {
    cutout = paper.Path.Rectangle({
        from: new paper.Point(bottomcenter.x - radius, bottomcenter.y - gap / 2),
        to: new paper.Point(bottomcenter.x + radius, bottomcenter.y + gap / 2)
    });
    //cutout.fillColor = "white";
    valve = circ.subtract(cutout);
    ret.addChild(valve);


    let topcenter = new paper.Point(position[0], position[1] - spacing);

    circ = new paper.Path.Circle(topcenter, radius);
    //circ.fillColor = color;
    //   if (String(color) == "3F51B5") {
    cutout = paper.Path.Rectangle({
        from: new paper.Point(topcenter.x - radius, topcenter.y - gap / 2),
        to: new paper.Point(topcenter.x + radius, topcenter.y + gap / 2)
    });
    //cutout.fillColor = "white";
    valve = circ.subtract(cutout);
    ret.addChild(valve);

    //Create the channels that go through
    let bottomchannel = new paper.Path.Rectangle({
        from: new paper.Point(bottomcenter.x - channelwidth/2, bottomcenter.y - gap/2),
        to: new paper.Point(center.x + channelwidth/2, center.y + gap/2)
    });

    ret.addChild(bottomchannel);

    let topchannel = new paper.Path.Rectangle({
        from: new paper.Point(topcenter.x - channelwidth/2, topcenter.y + gap/2),
        to: new paper.Point(center.x + channelwidth/2, center.y - gap/2)
    });

    ret.addChild(topchannel);

    ret.rotate(rotation, center);
    ret.fillColor = color;

    return ret;
};

const Pump3D_control = function(params){
    let circ;
    let position = params["position"];
    let radius = params["valveRadius"];
    let color = params["color"];
    let rotation = params["rotation"];
    let spacing = params["spacing"];

    console.log("Spacing:", spacing);

    let ret = new paper.CompoundPath();

    let center = new paper.Point(position[0], position[1]);

    circ = new paper.Path.Circle(center, radius);
    ret.addChild(circ);

    let topcenter = new paper.Point(position[0], position[1] - spacing);
    circ = new paper.Path.Circle(topcenter, radius);
    ret.addChild(circ);


    let bottomcenter = new paper.Point(position[0], position[1] + spacing);
    circ = new paper.Path.Circle(bottomcenter, radius);
    ret.addChild(circ);

    ret.rotate(rotation, center);
    ret.fillColor = color;
    return ret;
};

const Pump3DTarget = function(params){
    console.log("Testing....");
    let ret = new paper.CompoundPath();
    let flow = Pump3D(params);
    let control = Pump3D_control(params);
    ret.addChild(control);
    ret.addChild(flow);
    ret.fillColor = params["color"];
    ret.fillColor.alpha = 0.5;
    return ret;
};

//************************************

var AlignmentMarks = function(params){
    let position = params["position"];
    let width = params["width"];
    let length = params["length"];
    let color = params["color"];
    let center = new paper.Point(position[0], position[1]);
    let ret = new paper.CompoundPath();
    let topleftpoint = new paper.Point(position[0] - width, position[1] - length);
    let bottomrightpoint = new paper.Point(position[0] + width, position[1] + length);

    let topleftrect = new paper.Path.Rectangle(topleftpoint, center);

    ret.addChild(topleftrect);

    let bottomrightrect = new paper.Path.Rectangle(position, bottomrightpoint);

    ret.addChild(bottomrightrect);

    ret.fillColor = color;
    return ret;
};

const AlignmentMarks_control = function(params){
    let position = params["position"];
    let width = params["width"];
    let length = params["length"];
    let color = params["color"];
    let here = new paper.Point(position[0], position[1]);
    let ret = new paper.CompoundPath();
    let topmiddlepoint = new paper.Point(position[0], position[1] - length);
    let middlerightpoint = new paper.Point(position[0] + width, position[1]);
    let middleleftpoint = new paper.Point(position[0] - width, position[1]);
    let bottommiddlepoint = new paper.Point(position[0], position[1]+length);

    let toprightrect = new paper.Path.Rectangle(topmiddlepoint, middlerightpoint);

    ret.addChild(toprightrect);

    let bottomleftrect = new paper.Path.Rectangle(middleleftpoint, bottommiddlepoint);

    ret.addChild(bottomleftrect);

    ret.fillColor = color;
    return ret;
};

const AlignmentMarksTarget = function(params){
    let position = params["position"];
    let width = params["width"];
    let length = params["length"];
    let color = params["color"];
    let center = new paper.Point(position[0], position[1]);
    let ret = new paper.CompoundPath();
    let topleftpoint = new paper.Point(position[0] - width, position[1] - length);
    let bottomrightpoint = new paper.Point(position[0] + width, position[1] + length);

    let topleftrect = new paper.Path.Rectangle(topleftpoint, center);

    ret.addChild(topleftrect);

    let bottomrightrect = new paper.Path.Rectangle(position, bottomrightpoint);

    ret.addChild(bottomrightrect);

    let topmiddlepoint = new paper.Point(position[0], position[1] - length);
    let middlerightpoint = new paper.Point(position[0] + width, position[1]);
    let middleleftpoint = new paper.Point(position[0] - width, position[1]);
    let bottommiddlepoint = new paper.Point(position[0], position[1]+length);

    let toprightrect = new paper.Path.Rectangle(topmiddlepoint, middlerightpoint);

    ret.addChild(toprightrect);

    let bottomleftrect = new paper.Path.Rectangle(middleleftpoint, bottommiddlepoint);

    ret.addChild(bottomleftrect);

    ret.fillColor = color;

    ret.fillColor.alpha = 0.5;

    return ret;
};

//************************************
const Transposer = function(params){
    let position = params["position"];
    let gap = params["gap"];
    let radius = params["valveRadius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let channelWidth = params["channelWidth"];
    let valvespacing = params["valveSpacing"];
    let transposer_flow = new paper.CompoundPath();

    let px = position[0];
    let py = position[1];

    //Draw top left channel
    let topleftpoint = new paper.Point(px, py - channelWidth/2);
    let bottomrightpoint = new paper.Point(px + 4*valvespacing + 2*radius + 2*channelWidth, py + channelWidth/2);
    let channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    //Draw Valve
    createTransposerValve(transposer_flow, bottomrightpoint.x + radius, topleftpoint.y + channelWidth / 2, gap, radius, "H", channelWidth);

    //Draw top right channel
    topleftpoint = new paper.Point(px + 4*valvespacing + 4*radius + 2*channelWidth, py - channelWidth/2);
    bottomrightpoint = new paper.Point(px + 6*valvespacing + 4*radius + 3*channelWidth, py + channelWidth/2);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    //Draw middle channels
    topleftpoint = new paper.Point(px + 3*valvespacing + channelWidth + 2*radius, py + channelWidth/2);
    bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);
    createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, gap, radius, "V", channelWidth);

    //2
    topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2*radius);
    bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + 2*valvespacing + channelWidth);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, gap, radius, "V", channelWidth);

    //3
    topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2*radius);
    bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    //Bottom Channels
    topleftpoint = new paper.Point(px , py + 1.5*channelWidth + 4*valvespacing + 2*2*radius);
    bottomrightpoint = new paper.Point(topleftpoint.x + 2*valvespacing + channelWidth, topleftpoint.y + channelWidth);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    createTransposerValve(transposer_flow, bottomrightpoint.x + radius, topleftpoint.y + channelWidth / 2, gap, radius, "H", channelWidth);

    //2
    topleftpoint = new paper.Point(bottomrightpoint.x + 2*radius, topleftpoint.y );
    bottomrightpoint = new paper.Point(topleftpoint.x + 4*valvespacing + 2*channelWidth + 2*radius , topleftpoint.y + channelWidth);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);


    //Draw the right channels
    topleftpoint = new paper.Point(px + 5*valvespacing + 2*channelWidth + 4*radius, py + channelWidth/2);
    bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, gap, radius, "V", channelWidth);

    //2
    topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2*radius);
    bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing + channelWidth);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    transposer_flow.fillColor = color;


    //Draw the left channels
    topleftpoint = new paper.Point(px + valvespacing, py + 1.5*channelWidth + 2*valvespacing + 2*radius);
    bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, gap, radius, "V", channelWidth);

    //2
    topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2*radius);
    bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing + channelWidth);
    channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

    transposer_flow.addChild(channel);

    transposer_flow.fillColor = color;

    let rotation = 0;

    if (orientation == "V") {
        rotation = 90;
    }
    else {
        rotation = 0;
    }

    transposer_flow.rotate(rotation,
        px + 3*valvespacing + 1.5*channelWidth + 2*radius,
        py + channelWidth + 2*valvespacing + 2*radius
    );

    return transposer_flow;
};

const createTransposerValve = function (compound_path, xpos, ypos, gap, radius, orientation, channel_width){

    let center = new paper.Point(xpos, ypos);

    //Create the basic circle
    let circ = new paper.Path.Circle(center, radius);


    //Add the tiny channel pieces that jut out
    let rec = new paper.Path.Rectangle({
        point: new paper.Point(xpos - channel_width/2, ypos - radius),
        size: [channel_width, radius],
        stokeWidth: 0
    });

    circ = circ.unite(rec);


    rec = new paper.Path.Rectangle({
        point: new paper.Point(xpos - channel_width/2, ypos),
        size: [channel_width, radius],
        stokeWidth: 0
    });

    circ = circ.unite(rec);

    let cutout = paper.Path.Rectangle({
        from: new paper.Point(xpos - radius, ypos - gap / 2),
        to: new paper.Point(xpos + radius, ypos + gap / 2)
    });

    //cutout.fillColor = "white";
    let valve = circ.subtract(cutout);

    //TODO Rotate
    if(orientation == "H"){
        valve.rotate(90, center);
    }

    compound_path.addChild(valve);

};

const Transposer_control = function(params){
    let position = params["position"];
    let gap = params["gap"];
    let radius = params["valveRadius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let channelWidth = params["channelWidth"];
    let valvespacing = params["valveSpacing"];
    let transposer_control = new paper.CompoundPath();

    let px = position[0];
    let py = position[1];

    //Top right valve
    let center = new paper.Point(px + 4*valvespacing + 2*channelWidth + 2*radius + radius, py);
    let circle = new paper.Path.Circle(center, radius);
    transposer_control.addChild(circle);

    //2nd row valves

    center = new paper.Point(px + 1.5*channelWidth + 3*valvespacing + 2*radius,
        py + channelWidth/2 + valvespacing + radius);
    circle = new paper.Path.Circle(center, radius);
    transposer_control.addChild(circle);

    let crosschannelstart = center;

    center = new paper.Point(center.x + 2*valvespacing + 2*radius + channelWidth,
        py + channelWidth/2 + valvespacing + radius);
    circle = new paper.Path.Circle(center, radius);
    transposer_control.addChild(circle);

    let crosschannelend = center;

    //Draw the cross channel connecting the 2nd row valves
    let rect = new paper.Path.Rectangle({
        from: new paper.Point(crosschannelstart.x, crosschannelstart.y - channelWidth/2),
        to: new paper.Point(crosschannelend.x , crosschannelstart.y + channelWidth/2)
    });

    transposer_control.addChild(rect);

    //3rd Row valves

    center = new paper.Point(px + 0.5*channelWidth + valvespacing,
        py + 1.5*channelWidth + 3*valvespacing + 2*radius + radius);
    circle = new paper.Path.Circle(center, radius);
    transposer_control.addChild(circle);

    crosschannelstart = center;

    center = new paper.Point(center.x + 2*valvespacing + 2*radius + channelWidth, center.y);
    circle = new paper.Path.Circle(center, radius);
    transposer_control.addChild(circle);

    crosschannelend = center;

    //Draw the cross channel connecting the 3nd row valves
    rect = new paper.Path.Rectangle({
        from: new paper.Point(crosschannelstart.x, crosschannelstart.y - channelWidth/2),
        to: new paper.Point(crosschannelend.x , crosschannelstart.y + channelWidth/2)
    });

    transposer_control.addChild(rect);


    //Bottom Row valve
    center = new paper.Point(px + channelWidth + 2*valvespacing + radius, py + 4*valvespacing + 4*radius + 2*channelWidth);
    circle = new paper.Path.Circle(center, radius);
    transposer_control.addChild(circle);


    //Finally we draw the cross channel
    let topleftpoint = new paper.Point(px+valvespacing, py + channelWidth/2 + 2* radius + 2*valvespacing);
    let bottomleftpoint = new paper.Point(topleftpoint.x + + 4*valvespacing + 3*channelWidth + 4*radius, topleftpoint.y +channelWidth );
    let rectangle = new paper.Path.Rectangle(topleftpoint, bottomleftpoint);
    transposer_control.addChild(rectangle);


    let rotation = 0;

    if (orientation == "V") {
        rotation = 90;
    }
    else {
        rotation = 0;
    }

    transposer_control.rotate(rotation,
        px + 3*valvespacing + 1.5*channelWidth + 2*radius,
        py + channelWidth + 2*valvespacing + 2*radius
    );

    transposer_control.fillColor = color;
    return transposer_control;
};

const RotaryMixer = function(params){

    let position = params["position"];
    let radius = params["radius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let valvespacing = params["valveSpacing"];
    let valvelength = params['valveLength'];
    let flowchannelwidth = params['flowChannelWidth']; //params["flowChannelWidth"];
    let px = position[0];
    let py = position[1];
    let center = new paper.Point(px, py);
    let channellength = radius + valvelength + 2 * valvespacing + flowchannelwidth; //This needs to be a real expression

    let rotarymixer = new paper.CompoundPath();

    let innercirc = new paper.Path.Circle(center, radius);
    let outercirc = new paper.Path.Circle(center, radius + flowchannelwidth);

    let rotary = outercirc.subtract(innercirc);

    rotarymixer.addChild(rotary);

    let point1 = new paper.Point(px, py - radius - flowchannelwidth);
    let point2 = new paper.Point(px + channellength, py - radius);
    let rectangle = new paper.Path.Rectangle(point1, point2);

    rotarymixer.addChild(rectangle);

    let point3 = new paper.Point(px-channellength, py + radius);
    let point4 = new paper.Point(px, py + radius + flowchannelwidth);
    let rectangle2 = new paper.Path.Rectangle(point3, point4);

    rotarymixer.addChild(rectangle2);

    let rotation = 0;
    if (orientation == "V") {
        rotation = 90;
    }
    else {
        rotation = 0;
    }
    // cutout.fillColor = "white";

    rotarymixer.fillColor = color;

    return rotarymixer.rotate(rotation, px, py);

};

const RotaryMixer_control = function(params){
    let position = params["position"];
    let radius = params["radius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let valvespacing = params["valveSpacing"];
    let valvelength = params['valveLength'];
    let valvewidth = params['valveWidth'];
    let flowChannelWidth = params['flowChannelWidth'];
    let controlChannelWidth = params['controlChannelWidth']; //params["flowChannelWidth"];
    let px = position[0];
    let py = position[1];

    let rotarymixer = new paper.CompoundPath();
    let topleft = null;
    let bottomright = null;

    //Draw top right valve
    topleft = new paper.Point(px + radius + flowChannelWidth + valvespacing, py - radius - flowChannelWidth/2 - valvewidth/2 );
    let topleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
    rotarymixer.addChild(topleftrectangle);

    //Draw top middle valve
    topleft = new paper.Point(px - valvewidth/2, py - radius - flowChannelWidth/2 - valvewidth/2);
    let topmiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
    rotarymixer.addChild(topmiddlerectangle);

    //Draw middle right valve
    topleft = new paper.Point(px + radius + flowChannelWidth/2 - valvewidth/2, py - valvelength/2);
    let middlerightrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvewidth, valvelength));
    rotarymixer.addChild(middlerightrectangle);

    //Draw Bottom middle valve
    topleft = new paper.Point(px - valvelength/2, py + radius + flowChannelWidth/2 - valvewidth/2);
    let bottommiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
    rotarymixer.addChild(bottommiddlerectangle);

    //Draw bottom left valve
    topleft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth, py + radius + flowChannelWidth/2 - valvewidth/2);
    let bottomleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
    rotarymixer.addChild(bottomleftrectangle);

    let rotation = 0;
    if (orientation == "V") {
        rotation = 90;
    }
    else {
        rotation = 0;
    }

    rotarymixer.fillColor = color;
    return rotarymixer.rotate(rotation, px, py);
};

//*********************************
const CircleTarget = function(params){
    let circ = GradientCircle(params);
    circ.fillColor.alpha = 0.5;
    return circ;
};

//***************************************************
const TransposerTarget = function(params){
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
    circ.fillColor = color;
    circ.fillColor.alpha = .5;
    circ.strokeColor = "#FFFFFF";
    return circ;
};

const RotaryMixerTarget = function(params){

    let position = params["position"];
    let radius = params["radius"];
    let color = params["color"];
    let orientation = params["orientation"];
    let valvespacing = params["valveSpacing"];
    let valvelength = params['valveLength'];
    let flowchannelwidth = 1000; //params["flowChannelWidth"];
    let px = position[0];
    let py = position[1];
    let center = new paper.Point(px, py);
    let channellength = radius + valvelength + 2 * valvespacing; //This needs to be a real expression

    let rotarymixer = new paper.CompoundPath();

    let innercirc = new paper.Path.Circle(center, radius);
    let outercirc = new paper.Path.Circle(center, radius + flowchannelwidth);

    let rotary = outercirc.subtract(innercirc);

    rotarymixer.addChild(rotary);

    let point1 = new paper.Point(px, py - radius - flowchannelwidth);
    let point2 = new paper.Point(px + channellength, py - radius);
    let rectangle = new paper.Path.Rectangle(point1, point2);

    // rotary.unite(rectangle);
    rotarymixer.addChild(rectangle);

    let point3 = new paper.Point(px-channellength, py + radius);
    let point4 = new paper.Point(px, py + radius + flowchannelwidth);
    let rectangle2 = new paper.Path.Rectangle(point3, point4);

    //rotary.unite(rectangle2);
    rotarymixer.addChild(rectangle2);

    let rotation = 0;
    if (orientation == "V") {
        rotation = 90;
    }
    else {
        rotation = 0;
    }

    rotarymixer.fillColor = color;
    rotarymixer.fillColor.alpha = 0.5;

    return rotarymixer.rotate(rotation, px, py);

};

//*******************************************

const Chamber = function (params) {
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let l = params["length"];
    let w = params["width"];
    let rotation = params["rotation"];
    let color = params["color"];
    let radius = params["cornerRadius"];

    let rendered = new paper.CompoundPath();

    let rec = new paper.Path.Rectangle({
        point: new paper.Point(px - w / 2, py - l / 2),
        size: [w, l],
        radius: radius
    });

    rendered.addChild(rec);

    rendered.fillColor = color;
    return rendered.rotate(rotation, px, py);
};


const ChamberTarget = function (params) {

    let ret = Chamber(params);

    ret.fillColor.alpha = 0.5;

    return ret;
};


//******************************************

const Diamond = function (params) {
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let cw = params["channelWidth"];
    let l = params["length"];
    let w = params["width"];
    let orientation = params["orientation"];
    let color = params["color"];
    let p0, p1, p2, p3, p4, p5;
    if (orientation == "H") {
        p0 = [px - l / 2, py - cw / 2];
        p1 = [px - l / 2, py + cw / 2];
        p2 = [px, py + w + cw / 2];
        p3 = [px + l / 2, py + cw / 2];
        p4 = [px + l / 2, py - cw / 2];
        p5 = [px, py - cw / 2 - w];
    }
    else {
        p0 = [px - cw / 2, py - l / 2];
        p1 = [px + cw / 2, py - l / 2];
        p2 = [px + w + cw / 2, py];
        p3 = [px + cw / 2, py + l / 2];
        p4 = [px - cw / 2, py + l / 2];
        p5 = [px - cw / 2 - w, py];
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
};

const DiamondTarget = function (params) {
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let cw = params["channelWidth"];
    let l = params["length"];
    let w = params["width"];
    let orientation = params["orientation"];
    let color = params["color"];
    let p0, p1, p2, p3, p4, p5;
    if (orientation == "H") {
        p0 = [px - l / 2, py - cw / 2];
        p1 = [px - l / 2, py + cw / 2];
        p2 = [px, py + w + cw / 2];
        p3 = [px + l / 2, py + cw / 2];
        p4 = [px + l / 2, py - cw / 2];
        p5 = [px, py - cw / 2 - w];
    }
    else {
        p0 = [px - cw / 2, py - l / 2];
        p1 = [px + cw / 2, py - l / 2];
        p2 = [px + w + cw / 2, py];
        p3 = [px + cw / 2, py + l / 2];
        p4 = [px - cw / 2, py + l / 2];
        p5 = [px - cw / 2 - w, py];
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
    if (hex.strokeWidth > w / 2) hex.strokeWidth = w / 2;
    //console.log(Math.ceil(Math.log2(7)));
    return hex;
};

const Valve = function (params) {
    let orientation = params["orientation"];
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let l = params["length"];
    let w = params["width"];
    let color = params["color"];
    let rotation = params["rotation"];
    let startX = px - w / 2;
    let startY = py - l / 2;
    let endX = px + w / 2;
    let endY = py + l / 2;
    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);
    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        fillColor: color,
        strokeWidth: 0
    });

    // if(orientation == "V"){
    //     rotation = 90;
    // }

    return rec.rotate(rotation, px, py);
};

const Mux_control = function (params) {
    let position = params["position"];
    let cw = params["flowChannelWidth"];
    let ctlcw = params["controlChannelWidth"];
    let orientation = params["orientation"];
    let direction = params["direction"];
    let spacing = params["spacing"];
    let leafs = params["leafs"];
    let color = params["color"];
    let stagelength = params["stageLength"];
    let valvelength = params["length"];
    let valvewidth = params["width"];
    let px = position[0];
    let py = position[1];

    let treeWidth = (leafs - 1) * spacing + leafs * cw + valvewidth;
    let leftEdge = px - treeWidth / 2;
    let rightEdge = px + treeWidth / 2;

    let levels = Math.ceil(Math.log2(leafs));

    let isodd = !(leafs % 2);
    let w = spacing * (leafs / 2 + 1);
    let l = (levels + 1) * stagelength;

    // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

    var treepath = new paper.CompoundPath();

    generateMuxControlTwig(treepath, px, py, cw, ctlcw, stagelength, w, 1, levels, valvewidth, valvelength, leftEdge, rightEdge);


    //Draw the tree

    treepath.fillColor = color;
    var rotation = 0;
    // console.log("Orientation: " + orientation);
    // console.log("Direction: " + direction);
    if (orientation == "H" && direction == "OUT") {
        rotation = 180;
    } else if (orientation == "V" && direction == "IN") {
        rotation = 270;
    } else if (orientation == "V" && direction == "OUT") {
        rotation = 90;
    }
    return treepath.rotate(rotation, px, py);
};

function drawmuxcontroltwig(treepath, px, py, cw, ctlcw, stagelength, spacing, valvewidth, valvelength, leftEdge, rightEdge, drawleafs=false) {
    //stem - don't bother with valves

    //Draw 2 valves
    //left leaf
    let lstartx = px - 0.5 * (cw + spacing);
    let lendx = lstartx + cw;
    let lstarty = py + stagelength + cw;
    let lendy = lstarty + stagelength;

    let lcenterx = (lstartx + lendx)/2;
    let lcentery = lstarty + Math.abs(lstarty - lendy)/4;

    // //right leaf
    let rstartx = px + 0.5 * (spacing - cw);
    let rendx = rstartx + cw;
    let rstarty = py + stagelength + cw;
    let rendy = rstarty + stagelength;

    let rcenterx = (rstartx + rendx)/2;
    let rcentery = rstarty + Math.abs(rstarty - rendy)*3/4;


    let startPoint = new paper.Point(lcenterx - valvewidth/2 , lcentery - valvelength/2);
    let endPoint = new paper.Point(lcenterx + valvewidth/2 , lcentery + valvewidth/2);
    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        strokeWidth: 0
    });
    treepath.addChild(rec);

    let leftChannelStart = new paper.Point(startPoint.x, lcentery - ctlcw/2);
    let leftChannelEnd = new paper.Point(leftEdge, lcentery + ctlcw/2);

    let leftChannel = paper.Path.Rectangle({
        from: leftChannelStart,
        to: leftChannelEnd,
        radius: 0,
        strokeWidth: 0
    });
    treepath.addChild(leftChannel);

    startPoint = new paper.Point(rcenterx - valvewidth/2 , rcentery - valvelength/2);
    endPoint = new paper.Point(rcenterx + valvewidth/2 , rcentery + valvewidth/2);
    rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        strokeWidth: 0
    });

    treepath.addChild(rec);
    let rightChannelStart = new paper.Point(endPoint.x, rcentery - ctlcw/2);
    let rightChannelEnd = new paper.Point(rightEdge, rcentery + ctlcw/2);

    let rightChannel = paper.Path.Rectangle({
        from: rightChannelStart,
        to: rightChannelEnd,
        radius: 0,
        strokeWidth: 0
    });
    treepath.addChild(rightChannel);

    return treepath
};

function generateMuxControlTwig(treepath, px, py,cw, ctlcw, stagelength , newspacing, level, maxlevel, valvewidth, valvelength,
                                leftEdge, rightEdge, islast=false,) {
    //var newspacing = 2 * (spacing + cw);
    var hspacing = newspacing/2;
    var lex = px - 0.5 * newspacing;
    var ley = py + cw + stagelength;
    var rex = px + 0.5 * newspacing;
    var rey = py + cw + stagelength;

    if(level == maxlevel){
        islast = true;
        // console.log("Final Spacing: " + newspacing)
    }

    drawmuxcontroltwig(treepath, px, py, cw, ctlcw, stagelength, newspacing, valvewidth, valvelength, leftEdge, rightEdge, islast);

    if(!islast){
        generateMuxControlTwig(treepath, lex, ley, cw, ctlcw, stagelength, hspacing, level+1, maxlevel, valvewidth, valvelength, leftEdge, rightEdge);
        generateMuxControlTwig(treepath, rex, rey, cw, ctlcw, stagelength, hspacing, level+1, maxlevel, valvewidth, valvelength, leftEdge, rightEdge);
    }
}

var ValveTarget = function(params){
    let ret = Valve(params);
    ret.fillColor.alpha = 0.5;
    return ret;
};


const BetterMixer = function (params) {
    let channelWidth = params["channelWidth"];
    let bendLength = params["bendLength"];
    let bendSpacing = params["bendSpacing"];
    let orientation = params["orientation"];
    let numBends = params["numberOfBends"];
    let x = params["position"][0];
    let y = params["position"][1];
    let color = params["color"];
    let segHalf = bendLength / 2 + channelWidth;
    let segLength = bendLength + 2 * channelWidth;
    let segBend = bendSpacing + 2 * channelWidth;
    let vRepeat = 2 * bendSpacing + 2 * channelWidth;
    let vOffset = bendSpacing + channelWidth;
    let hOffset = bendLength / 2 + channelWidth / 2;
    var serp = new paper.CompoundPath();
    if (orientation == "V") {
        //draw first segment
        serp.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth));
        for (let i = 0; i < numBends; i++) {
            serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * i, channelWidth, segBend));
            serp.addChild(new paper.Path.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth));
            serp.addChild(new paper.Path.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend));
            if (i == numBends - 1) {//draw half segment to close
                serp.addChild(new paper.Path.Rectangle(x + hOffset, y + vRepeat * (i + 1), segHalf, channelWidth));
            } else {//draw full segment
                serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth));
            }
        }
    } else {
        serp.addChild(new paper.Path.Rectangle(x, y + hOffset, channelWidth, segHalf));
        for (let i = 0; i < numBends; i++) {
            serp.addChild(new paper.Path.Rectangle(x + vRepeat * i, y + channelWidth + bendLength, segBend, channelWidth));
            serp.addChild(new paper.Path.Rectangle(x + vOffset + vRepeat * i, y, channelWidth, segLength));
            serp.addChild(new paper.Path.Rectangle(x + vOffset + vRepeat * i, y, segBend, channelWidth));
            if (i == numBends - 1) {//draw half segment to close
                serp.addChild(new paper.Path.Rectangle(x + vRepeat * (i + 1), y, channelWidth, segHalf + channelWidth / 2));
            } else {//draw full segment
                serp.addChild(new paper.Path.Rectangle(x + vRepeat * (i + 1), y, channelWidth, segLength));
            }
        }
    }
    serp.fillColor = color;
    return serp;
};

const BetterMixerTarget = function (params) {
    let channelWidth = params["channelWidth"];
    let bendLength = params["bendLength"];
    let bendSpacing = params["bendSpacing"];
    let orientation = params["orientation"];
    let numBends = params["numberOfBends"];
    let x = params["position"][0];
    let y = params["position"][1];
    let color = params["color"];
    let segHalf = bendLength / 2 + channelWidth;
    let segLength = bendLength + 2 * channelWidth;
    let segBend = bendSpacing + 2 * channelWidth;
    let vRepeat = 2 * bendSpacing + 2 * channelWidth;
    let vOffset = bendSpacing + channelWidth;
    let hOffset = bendLength / 2 + channelWidth / 2;

    var serp = new paper.CompoundPath();
    if (orientation == "V") {
        //draw first segment
        serp.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth));
        for (let i = 0; i < numBends; i++) {
            serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * i, channelWidth, segBend));
            serp.addChild(new paper.Path.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth));
            serp.addChild(new paper.Path.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend));
            if (i == numBends - 1) {//draw half segment to close
                serp.addChild(new paper.Path.Rectangle(x + hOffset, y + vRepeat * (i + 1), segHalf, channelWidth));
            } else {//draw full segment
                serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth));
            }
        }
    } else {
        serp.addChild(new paper.Path.Rectangle(x, y + hOffset, channelWidth, segHalf));
        for (let i = 0; i < numBends; i++) {
            serp.addChild(new paper.Path.Rectangle(x + vRepeat * i, y + channelWidth + bendLength, segBend, channelWidth));
            serp.addChild(new paper.Path.Rectangle(x + vOffset + vRepeat * i, y, channelWidth, segLength));
            serp.addChild(new paper.Path.Rectangle(x + vOffset + vRepeat * i, y, segBend, channelWidth));
            if (i == numBends - 1) {//draw half segment to close
                serp.addChild(new paper.Path.Rectangle(x + vRepeat * (i + 1), y, channelWidth, segHalf + channelWidth / 2));
            } else {//draw full segment
                serp.addChild(new paper.Path.Rectangle(x + vRepeat * (i + 1), y, channelWidth, segLength));
            }
        }
    }
    serp.fillColor = color;
    serp.fillColor.alpha = 0.5;
    return serp;
};

const CurvedMixer = function (params) {
    let channelWidth = params["channelWidth"];
    let bendLength = params["bendLength"];
    let bendSpacing = params["bendSpacing"];
    let orientation = params["orientation"];
    let numBends = params["numberOfBends"];
    let x = params["position"][0];
    let y = params["position"][1];
    let color = params["color"];
    let segHalf = bendLength / 2 + channelWidth;
    let segLength = bendLength + 2 * channelWidth;
    let segBend = bendSpacing + 2 * channelWidth;
    let vRepeat = 2 * bendSpacing + 2 * channelWidth;
    let vOffset = bendSpacing + channelWidth;
    let hOffset = bendLength / 2 + channelWidth / 2;
    let serp = new paper.CompoundPath();

    //draw first segment
    let toprect = new paper.Path.Rectangle(x + channelWidth - 1, y, bendLength / 2 + channelWidth / 2 + 1, channelWidth);
    toprect.closed = true;
    for (let i = 0; i < numBends; i++) {
        //draw left curved segment
        let leftCurve = new paper.Path.Arc({
            from: [x + channelWidth, y + vRepeat * i],
            through: [x + channelWidth - (channelWidth + bendSpacing / 2), y + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth, y + vRepeat * i + bendSpacing + 2 * channelWidth]
        });
        leftCurve.closed = true;
        let leftCurveSmall = new paper.Path.Arc({
            from: [x + channelWidth, y + vRepeat * i + bendSpacing + channelWidth],
            through: [x + channelWidth - bendSpacing / 2, y + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth, y + vRepeat * i + channelWidth]
        });
        leftCurveSmall.closed = true;
        leftCurve = leftCurve.subtract(leftCurveSmall);
        toprect = toprect.unite(leftCurve);
        // serp.addChild(leftCurve);
        //draw horizontal segment
        let hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vOffset + vRepeat * i, bendLength + 2, channelWidth);
        toprect = toprect.unite(hseg);
        //draw right curved segment
        let rightCurve = new paper.Path.Arc({
            from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i],
            through: [x + channelWidth + bendLength + (channelWidth + bendSpacing / 2), y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + 2 * channelWidth]
        });
        rightCurve.closed = true;
        let rightCurveSmall = new paper.Path.Arc({
            from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + channelWidth],
            through: [x + channelWidth + bendLength + bendSpacing / 2, y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + channelWidth]
        });
        rightCurveSmall.closed = true;
        rightCurve = rightCurve.subtract(rightCurveSmall);
        toprect = toprect.unite(rightCurve);

        if (i == numBends - 1) {//draw half segment to close
            hseg = new paper.Path.Rectangle(x + channelWidth / 2 + bendLength / 2, y + vRepeat * (i + 1), (bendLength + channelWidth) / 2 + 1, channelWidth);
            toprect = toprect.unite(hseg);
        } else {//draw full segment
            hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vRepeat * (i + 1), bendLength + 2, channelWidth);
            toprect = toprect.unite(hseg);
        }
        toprect = toprect.unite(hseg);
    }
    serp.addChild(toprect);


    if (orientation == "V") {
        serp.rotate(0, x + channelWidth, y);
    } else {
        serp.rotate(90, x + channelWidth, y);
    }


    serp.fillColor = color;
    return serp;
};

function unionize(compundpath) {
    let union = null;
    let newpath = new paper.CompoundPath();
    for(let i in compundpath.children){
        let child = compundpath.children[i].copyTo(newpath);
        if (!union) {
            union = child;
        } else {
            union = union.unite(child);
        }
    }
    console.log("newpath", newpath);
    return newpath;
}

const CurvedMixerTarget = function (params) {
    let channelWidth = params["channelWidth"];
    let bendLength = params["bendLength"];
    let bendSpacing = params["bendSpacing"];
    let orientation = params["orientation"];
    let numBends = params["numberOfBends"];
    let x = params["position"][0];
    let y = params["position"][1];
    let color = params["color"];
    let segHalf = bendLength / 2 + channelWidth;
    let segLength = bendLength + 2 * channelWidth;
    let segBend = bendSpacing + 2 * channelWidth;
    let vRepeat = 2 * bendSpacing + 2 * channelWidth;
    let vOffset = bendSpacing + channelWidth;
    let hOffset = bendLength / 2 + channelWidth / 2;
    let serp = new paper.CompoundPath();

    //draw first segment
    let toprect = new paper.Path.Rectangle(x + channelWidth - 1, y, bendLength / 2 + channelWidth / 2 + 1, channelWidth);
    toprect.closed = true;
    for (let i = 0; i < numBends; i++) {
        //draw left curved segment
        let leftCurve = new paper.Path.Arc({
            from: [x + channelWidth, y + vRepeat * i],
            through: [x + channelWidth - (channelWidth + bendSpacing / 2), y + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth, y + vRepeat * i + bendSpacing + 2 * channelWidth]
        });
        leftCurve.closed = true;
        let leftCurveSmall = new paper.Path.Arc({
            from: [x + channelWidth, y + vRepeat * i + bendSpacing + channelWidth],
            through: [x + channelWidth - bendSpacing / 2, y + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth, y + vRepeat * i + channelWidth]
        });
        leftCurveSmall.closed = true;
        leftCurve = leftCurve.subtract(leftCurveSmall);
        toprect = toprect.unite(leftCurve);
        // serp.addChild(leftCurve);
        //draw horizontal segment
        let hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vOffset + vRepeat * i, bendLength + 2, channelWidth);
        toprect = toprect.unite(hseg);
        //draw right curved segment
        let rightCurve = new paper.Path.Arc({
            from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i],
            through: [x + channelWidth + bendLength + (channelWidth + bendSpacing / 2), y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + 2 * channelWidth]
        });
        rightCurve.closed = true;
        let rightCurveSmall = new paper.Path.Arc({
            from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + channelWidth],
            through: [x + channelWidth + bendLength + bendSpacing / 2, y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
            to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + channelWidth]
        });
        rightCurveSmall.closed = true;
        rightCurve = rightCurve.subtract(rightCurveSmall);
        toprect = toprect.unite(rightCurve);

        if (i == numBends - 1) {//draw half segment to close
            hseg = new paper.Path.Rectangle(x + channelWidth / 2 + bendLength / 2, y + vRepeat * (i + 1), (bendLength + channelWidth) / 2 + 1, channelWidth);
            toprect = toprect.unite(hseg);
        } else {//draw full segment
            hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vRepeat * (i + 1), bendLength + 2, channelWidth);
            toprect = toprect.unite(hseg);
        }
        toprect = toprect.unite(hseg);
    }
    serp.addChild(toprect);


    if (orientation == "V") {
        serp.rotate(0, x + channelWidth, y);
    } else {
        serp.rotate(90, x + channelWidth, y);
    }


    serp.fillColor = color;
    serp.fillColor.alpha = 0.5;
    return serp;
};

const Mixer = function (params) {
    let position = params["position"];
    let bendSpacing = params["bendSpacing"];
    let numBends = params["numberOfBends"];
    let channelWidth = params["channelWidth"];
    let bendLength = params["bendLength"];
    let orientation = params["orientation"];
    let color = params["color"];
    var serpentine = new paper.CompoundPath();

    let startX, startY;

    if (orientation == "V") {
        startX = position[0] + 0.5 * (bendLength + channelWidth);
        startY = position[1] - 0.5 * channelWidth;
        serpentine.addChild(new paper.Path.Rectangle({
            size: [0.5 * bendLength + channelWidth, channelWidth],
            point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY),
            fillColor: color,
            strokeWidth: 0,
        }));

        //serpentine.add(new paper.Point(startX, startY));

        for (let i = 0; i < numBends - 1; i++) {
            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendSpacing + channelWidth],
                point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY + 2 * i * (bendSpacing + channelWidth) + channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));
            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendLength + channelWidth, channelWidth],
                point: new paper.Point(startX - 0.5 * bendLength, startY + (2 * i + 1) * (bendSpacing + channelWidth)),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendSpacing + channelWidth],
                point: new paper.Point(startX + 0.5 * bendLength, startY + (2 * i + 1) * (bendSpacing + channelWidth) + channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendLength + channelWidth, channelWidth],
                point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY + (2 * i + 2) * (bendSpacing + channelWidth)),
                fillColor: color,
                strokeWidth: 0
            }));

        }
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendSpacing + channelWidth],
            point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY + 2 * (numBends - 1) * (bendSpacing + channelWidth) + channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendLength + channelWidth, channelWidth],
            point: new paper.Point(startX - 0.5 * bendLength, startY + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth)),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendSpacing + channelWidth],
            point: new paper.Point(startX + 0.5 * bendLength, startY + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth) + channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendLength / 2, channelWidth],
            point: new paper.Point(startX, startY + (2 * (numBends - 1) + 2) * (bendSpacing + channelWidth)),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.scale(-1, 1);
    }
    else {
        startX = position[0] - 0.5 * channelWidth;
        startY = position[1] + 0.5 * (bendLength + channelWidth);
        //serpentine.add(new paper.Point(startX, startY));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, 0.5 * bendLength + channelWidth],
            point: new paper.Point(startX, startY - 0.5 * bendLength - channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));

        for (let i = 0; i < numBends - 1; i++) {

            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendSpacing + channelWidth, channelWidth],
                point: new paper.Point(startX + 2 * i * (bendSpacing + channelWidth) + channelWidth, startY - 0.5 * bendLength - channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));
            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendLength + channelWidth],
                point: new paper.Point(startX + (2 * i + 1) * (bendSpacing + channelWidth), startY - 0.5 * bendLength),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendSpacing + channelWidth, channelWidth],
                point: new paper.Point(startX + (2 * i + 1) * (bendSpacing + channelWidth) + channelWidth, startY + 0.5 * bendLength),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendLength + channelWidth],
                point: new paper.Point(startX + (2 * i + 2) * (bendSpacing + channelWidth), startY - 0.5 * bendLength - channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));

        }
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendSpacing + channelWidth, channelWidth],
            point: new paper.Point(startX + 2 * (numBends - 1) * (bendSpacing + channelWidth) + channelWidth, startY - 0.5 * bendLength - channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendLength + channelWidth],
            point: new paper.Point(startX + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth), startY - 0.5 * bendLength),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendSpacing + channelWidth, channelWidth],
            point: new paper.Point(startX + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth) + channelWidth, startY + 0.5 * bendLength),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendLength / 2],
            point: new paper.Point(startX + (2 * (numBends - 1) + 2) * (bendSpacing + channelWidth), startY),
            fillColor: color,
            strokeWidth: 0
        }));
    }

    serpentine.fillColor = color;

    return serpentine;
};

const MixerTarget = function (params) {
    let position = params["position"];
    let bendSpacing = params["bendSpacing"];
    let numBends = params["numberOfBends"];
    let channelWidth = params["channelWidth"];
    let bendLength = params["bendLength"];
    let orientation = params["orientation"];
    let color = params["color"];
    var serpentine = new paper.CompoundPath();

    let startX, startY;

    if (orientation == "V") {
        startX = position[0] + 0.5 * (bendLength + channelWidth);
        startY = position[1] - 0.5 * channelWidth;
        serpentine.addChild(new paper.Path.Rectangle({
            size: [0.5 * bendLength + channelWidth, channelWidth],
            point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY),
            fillColor: color,
            strokeWidth: 0
        }));

        //serpentine.add(new paper.Point(startX, startY));

        for (let i = 0; i < numBends - 1; i++) {
            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendSpacing + channelWidth],
                point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY + 2 * i * (bendSpacing + channelWidth) + channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));
            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendLength + channelWidth, channelWidth],
                point: new paper.Point(startX - 0.5 * bendLength, startY + (2 * i + 1) * (bendSpacing + channelWidth)),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendSpacing + channelWidth],
                point: new paper.Point(startX + 0.5 * bendLength, startY + (2 * i + 1) * (bendSpacing + channelWidth) + channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendLength + channelWidth, channelWidth],
                point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY + (2 * i + 2) * (bendSpacing + channelWidth)),
                fillColor: color,
                strokeWidth: 0
            }));

        }
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendSpacing + channelWidth],
            point: new paper.Point(startX - 0.5 * bendLength - channelWidth, startY + 2 * (numBends - 1) * (bendSpacing + channelWidth) + channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendLength + channelWidth, channelWidth],
            point: new paper.Point(startX - 0.5 * bendLength, startY + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth)),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendSpacing + channelWidth],
            point: new paper.Point(startX + 0.5 * bendLength, startY + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth) + channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendLength / 2, channelWidth],
            point: new paper.Point(startX, startY + (2 * (numBends - 1) + 2) * (bendSpacing + channelWidth)),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.scale(-1, 1);
    }
    else {
        startX = position[0] - 0.5 * channelWidth;
        startY = position[1] + 0.5 * (bendLength + channelWidth);
        //serpentine.add(new paper.Point(startX, startY));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, 0.5 * bendLength + channelWidth],
            point: new paper.Point(startX, startY - 0.5 * bendLength - channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));

        for (let i = 0; i < numBends - 1; i++) {

            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendSpacing + channelWidth, channelWidth],
                point: new paper.Point(startX + 2 * i * (bendSpacing + channelWidth) + channelWidth, startY - 0.5 * bendLength - channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));
            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendLength + channelWidth],
                point: new paper.Point(startX + (2 * i + 1) * (bendSpacing + channelWidth), startY - 0.5 * bendLength),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [bendSpacing + channelWidth, channelWidth],
                point: new paper.Point(startX + (2 * i + 1) * (bendSpacing + channelWidth) + channelWidth, startY + 0.5 * bendLength),
                fillColor: color,
                strokeWidth: 0
            }));

            serpentine.addChild(new paper.Path.Rectangle({
                size: [channelWidth, bendLength + channelWidth],
                point: new paper.Point(startX + (2 * i + 2) * (bendSpacing + channelWidth), startY - 0.5 * bendLength - channelWidth),
                fillColor: color,
                strokeWidth: 0
            }));

        }
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendSpacing + channelWidth, channelWidth],
            point: new paper.Point(startX + 2 * (numBends - 1) * (bendSpacing + channelWidth) + channelWidth, startY - 0.5 * bendLength - channelWidth),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendLength + channelWidth],
            point: new paper.Point(startX + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth), startY - 0.5 * bendLength),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [bendSpacing + channelWidth, channelWidth],
            point: new paper.Point(startX + (2 * (numBends - 1) + 1) * (bendSpacing + channelWidth) + channelWidth, startY + 0.5 * bendLength),
            fillColor: color,
            strokeWidth: 0
        }));
        serpentine.addChild(new paper.Path.Rectangle({
            size: [channelWidth, bendLength / 2],
            point: new paper.Point(startX + (2 * (numBends - 1) + 2) * (bendSpacing + channelWidth), startY),
            fillColor: color,
            strokeWidth: 0
        }));
    }

    serpentine.fillColor = color;
    serpentine.fillColor.alpha = 0.5;

    return serpentine;
};

const insertMixer = function(serpentine, bendSpacing, numBends, channelWidth, bendLength, x, y, color){
    let segHalf = bendLength/2 + channelWidth;
    let segLength = bendLength + 2*channelWidth;
    let segBend = bendSpacing + 2*channelWidth;
    let vRepeat = 2*bendSpacing + 2*channelWidth;
    let vOffset = bendSpacing + channelWidth;
    let hOffset = bendLength/2 + channelWidth/2;

    x -= hOffset;
    //TopRectangle
    serpentine.addChild(new paper.Path.Rectangle(x+hOffset, y, channelWidth, 2*channelWidth+ bendSpacing));
    y += channelWidth +bendSpacing;
    serpentine.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth/2, channelWidth));
    for(let i = 0; i < numBends; i++){
        serpentine.addChild(new paper.Path.Rectangle(x, y+vRepeat*i, channelWidth, segBend));
        serpentine.addChild(new paper.Path.Rectangle(x, y+vOffset+vRepeat*i, segLength, channelWidth));
        serpentine.addChild(new paper.Path.Rectangle(x+channelWidth+ bendLength, y+vOffset+vRepeat*i, channelWidth, segBend));
        if (i == numBends-1){//draw half segment to close
            serpentine.addChild(new paper.Path.Rectangle(x+hOffset, y+vRepeat*(i+1), segHalf, channelWidth));
        } else{//draw full segment
            serpentine.addChild(new paper.Path.Rectangle(x, y+vRepeat*(i+1), segLength, channelWidth));
        }
    }

    //Bottom rectabvke
    serpentine.addChild(new paper.Path.Rectangle(x+hOffset, y+vRepeat*(numBends), channelWidth, 2*channelWidth+ bendSpacing));


    return serpentine;
};
/**********************************************************************/


const GradientGenerator = function (params) {
    let position = params["position"];
    let bendSpacing = params["bendSpacing"];
    let numBends = params["numberOfBends"];
    let channelWidth = params["channelWidth"];
    let bendLength = params["bendLength"];
    let orientation = params["orientation"];
    let invalue = params["in"];
    let outvalue = params["out"];
    let spacing = params["spacing"]; //Center to Center
    let rotation = params["rotation"];
    let color = params["color"];

    let posx = position[0];
    let posy = position[1];
    let stagelength = channelWidth * (2 * numBends + 1) + (2 * numBends + 2) * bendSpacing + channelWidth;
    let gradientgenerator = new paper.CompoundPath();
    // insertMixer(gradientgenerator, bendSpacing, numBends, channelWidth, bendLength, posx, posy, color);
    //Iterate through each of the stages

    //Draw the first stage which is just channels
    let totalstagewidth = (invalue - 1) * spacing;
    let xref = (posx - totalstagewidth / 2);
    ;
    let yref = posy;
    //Draw straight channels for each of the input lines
    for (let i = 0; i < invalue; i++) {
        let x = xref + spacing * i;
        let y = yref;

        //Insert Straight channel
        gradientgenerator.addChild(new paper.Path.Rectangle({
            point: new paper.Point(x, y),
            size: [channelWidth, stagelength + channelWidth]
        }));
    }

    for (let stagevalue = invalue + 1; stagevalue <= outvalue; stagevalue++) {
        //For each stage : do the following
        /*
        Check if each stagevalue is odd or even

        if (not last stage) place horizontal bar connecting eveything
         */

        //Calculate the total width and start placing mixers
        let totalstagewidth = (stagevalue - 1) * spacing;

        xref = (posx - totalstagewidth / 2);
        yref = posy + stagelength * (stagevalue - invalue);

        //Start from the left
        for (let i = 0; i < stagevalue; i++) {
            let x = xref + spacing * i;

            let y = yref;
            //insert the mixer
            insertMixer(gradientgenerator, bendSpacing, numBends, channelWidth, bendLength, x, y, color);

        }

        // Insert horizontal bar
        let hbar = new paper.Path.Rectangle({
            point: new paper.Point(xref, yref),
            size: [totalstagewidth, channelWidth],
            fillColor: color,
            strokeWidth: 0
        });

        gradientgenerator.addChild(hbar);
    }

    gradientgenerator.fillColor = color;
    // console.log("testing");

    gradientgenerator.rotate(-rotation, new paper.Point(posx, posy));

    return gradientgenerator;
};

const GradientGeneratorTarget = function (params) {
    let ret = GradientGenerator(params);
    ret.fillColor.opacity = 0.5;
    return ret;
};


/**********************************************************************/


const Transition = function (params) {
    let position = params["position"];
    let cw1 = params["cw1"];
    let cw2 = params["cw2"];
    let length = params["length"];
    let orientation = params["orientation"];
    let color = params["color"];
    let trap = new paper.Path();

    if (orientation == "V") {
        trap.add(new paper.Point(position[0] - cw1 / 2, position[1]));
        trap.add(new paper.Point(position[0] + cw1 / 2, position[1]));
        trap.add(new paper.Point(position[0] + cw2 / 2, position[1] + length));
        trap.add(new paper.Point(position[0] - cw2 / 2, position[1] + length));
        //trap.add(new paper.Point(position[0] - cw1/2, position[1]));
    }
    else {
        trap.add(new paper.Point(position[0], position[1] - cw1 / 2));
        trap.add(new paper.Point(position[0], position[1] + cw1 / 2));
        trap.add(new paper.Point(position[0] + length, position[1] + cw2 / 2));
        trap.add(new paper.Point(position[0] + length, position[1] - cw2 / 2));
        //trap.add(new paper.Point(position[0], position[1] - cw1/2));
    }
    trap.closed = true;
    trap.fillColor = color;
    return trap;
};

const TransitionTarget = function (params) {
    let position = params["position"];
    let cw1 = params["cw1"];
    let cw2 = params["cw2"];
    let length = params["length"];
    let orientation = params["orientation"];
    let color = params["color"];
    let trap = new paper.Path();
    if (orientation == "V") {
        trap.add(new paper.Point(position[0] - cw1 / 2, position[1]));
        trap.add(new paper.Point(position[0] + cw1 / 2, position[1]));
        trap.add(new paper.Point(position[0] + cw2 / 2, position[1] + length));
        trap.add(new paper.Point(position[0] - cw2 / 2, position[1] + length));
    }
    else {
        trap.add(new paper.Point(position[0], position[1] - cw1 / 2));
        trap.add(new paper.Point(position[0], position[1] + cw1 / 2));
        trap.add(new paper.Point(position[0] + length, position[1] + cw2 / 2));
        trap.add(new paper.Point(position[0] + length, position[1] - cw2 / 2));
    }
    trap.closed = true;
    trap.fillColor = color;
    trap.fillColor.alpha = 0.5;
    return trap;
};

const Tree = function (params) {
    let position = params["position"];
    let cw = params["flowChannelWidth"];
    let orientation = params["orientation"];
    let direction = params["direction"];
    let spacing = params["spacing"];
    let leafs = params["leafs"];
    let color = params["color"];
    let stagelength = params["stageLength"];
    let px = position[0];
    let py = position[1];

    let levels = Math.ceil(Math.log2(leafs));
    let isodd = false; //This is used to figure out how many lines have to be made
    if (leafs % 2 == 0) {
        isodd = false;
    } else {
        isodd = true;
    }
    let w = spacing * (leafs / 2 + 1);
    let l = (levels + 1) * stagelength;

    // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

    var treepath = new paper.CompoundPath();

    generateTwig(treepath, px, py, cw, stagelength, w, 1, levels);


    //Draw the tree

    treepath.fillColor = color;
    var rotation = 0;
    // console.log("Orientation: " + orientation);
    // console.log("Direction: " + direction);
    if (orientation == "H" && direction == "OUT") {
        rotation = 180;
    } else if (orientation == "V" && direction == "IN") {
        rotation = 270;
    } else if (orientation == "V" && direction == "OUT") {
        rotation = 90;
    }
    return treepath.rotate(rotation, px, py);
};

function drawtwig(treepath, px, py, cw, stagelength, spacing, drawleafs=false) {
    //stem
    let startPoint = new paper.Point(px - cw / 2, py);
    let endPoint = new paper.Point(px + cw / 2, py + stagelength);
    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        strokeWidth: 0
    });

    treepath.addChild(rec);

    //Draw 2 leafs
    //left leaf
    let lstartx = px - 0.5 * (cw + spacing);
    let lendx = lstartx + cw;
    let lstarty = py + stagelength + cw;
    let lendy = lstarty + stagelength;

    // //right leaf
    let rstartx = px + 0.5 * (spacing - cw);
    let rendx = rstartx + cw;
    let rstarty = py + stagelength + cw;
    let rendy = rstarty + stagelength;

    if(drawleafs){
        startPoint = new paper.Point(lstartx, lstarty);
        endPoint = new paper.Point(lendx, lendy);
        rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);

        startPoint = new paper.Point(rstartx, rstarty);
        endPoint = new paper.Point(rendx, rendy);
        rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);

    }


    //Horizontal bar
    let hstartx = px - 0.5 * (cw + spacing);
    let hendx = rendx;
    let hstarty = py + stagelength;
    let hendy = hstarty + cw;
    startPoint = new paper.Point(hstartx, hstarty);
    endPoint = new paper.Point(hendx, hendy);
    rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        strokeWidth: 0
    });
    treepath.addChild(rec);
    return treepath
}

function generateTwig(treepath, px, py,cw, stagelength , newspacing, level, maxlevel, islast=false) {
    //var newspacing = 2 * (spacing + cw);
    var hspacing = newspacing/2;
    var lex = px - 0.5 * newspacing;
    var ley = py + cw + stagelength;
    var rex = px + 0.5 * newspacing;
    var rey = py + cw + stagelength;

    if(level == maxlevel){
        islast = true;
        // console.log("Final Spacing: " + newspacing)
    }

    drawtwig(treepath, px, py, cw, stagelength, newspacing, islast);
    // drawtwig(treepath, lex, ley, cw, stagelength, hspacing, islast);
    // drawtwig(treepath, rex, rey, cw, stagelength, hspacing, islast);


    if(!islast){
        generateTwig(treepath, lex, ley, cw, stagelength, hspacing, level+1, maxlevel);
        generateTwig(treepath, rex, rey, cw, stagelength, hspacing, level+1, maxlevel);
    }
}

const TreeTarget = function (params) {
    let position = params["position"];
    let cw = params["flowChannelWidth"];
    let orientation = params["orientation"];
    let direction = params["direction"];
    let spacing = params["spacing"];
    let leafs = params["leafs"];
    let color = params["color"];
    let stagelength = params["stageLength"];
    let px = position[0];
    let py = position[1];

    let levels = Math.ceil(Math.log2(leafs));
    let isodd = false; //This is used to figure out how many lines have to be made
    if (leafs % 2 == 0) {
        isodd = false;
    } else {
        isodd = true;
    }
    let w = spacing * (leafs / 2 + 1);
    let l = (levels + 1) * stagelength;

    // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

    var treepath = new paper.CompoundPath();

    generateTwig(treepath, px, py, cw, stagelength, w, 1, levels);


    //Draw the tree

    treepath.fillColor = color;
    treepath.fillColor.alpha = 0.5;
    var rotation = 0;
    if (orientation == "H" && direction == "OUT") {
        rotation = 180;
    } else if (orientation == "V" && direction == "IN") {
        rotation = 270;
    } else if (orientation == "V" && direction == "OUT") {
        rotation = 90;
    }
    return treepath.rotate(rotation, px, py);

};

const Mux = function (params) {
    let position = params["position"];
    let cw = params["flowChannelWidth"];
    let orientation = params["orientation"];
    let direction = params["direction"];
    let spacing = params["spacing"];
    let leafs = params["leafs"];
    let color = params["color"];
    let stagelength = params["stageLength"];
    let px = position[0];
    let py = position[1];

    let levels = Math.ceil(Math.log2(leafs));
    let isodd = false; //This is used to figure out how many lines have to be made
    if (leafs % 2 == 0) {
        isodd = false;
    } else {
        isodd = true;
    }
    let w = spacing * (leafs / 2 + 1);
    let l = (levels + 1) * stagelength;

    // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

    var treepath = new paper.CompoundPath();

    generateMuxTwig(treepath, px, py, cw, stagelength, w, 1, levels);


    //Draw the tree

    treepath.fillColor = color;
    var rotation = 0;
    if (orientation == "H" && direction == "OUT") {
        rotation = 180;
    } else if (orientation == "V" && direction == "IN") {
        rotation = 270;
    } else if (orientation == "V" && direction == "OUT") {
        rotation = 90;
    }
    return treepath.rotate(rotation, px, py);
};

function drawmuxtwig(treepath, px, py, cw, stagelength, spacing, drawleafs=false) {
    //stem
    let startPoint = new paper.Point(px - cw / 2, py);
    let endPoint = new paper.Point(px + cw / 2, py + stagelength);
    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        strokeWidth: 0
    });

    treepath.addChild(rec);

    //Draw 2 leafs
    //left leaf
    let lstartx = px - 0.5 * (cw + spacing);
    let lendx = lstartx + cw;
    let lstarty = py + stagelength + cw;
    let lendy = lstarty + stagelength;

    // //right leaf
    let rstartx = px + 0.5 * (spacing - cw);
    let rendx = rstartx + cw;
    let rstarty = py + stagelength + cw;
    let rendy = rstarty + stagelength;

    if(drawleafs){
        startPoint = new paper.Point(lstartx, lstarty);
        endPoint = new paper.Point(lendx, lendy);
        rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);

        startPoint = new paper.Point(rstartx, rstarty);
        endPoint = new paper.Point(rendx, rendy);
        rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);

    }


    //Horizontal bar
    let hstartx = px - 0.5 * (cw + spacing);
    let hendx = rendx;
    let hstarty = py + stagelength;
    let hendy = hstarty + cw;
    startPoint = new paper.Point(hstartx, hstarty);
    endPoint = new paper.Point(hendx, hendy);
    rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        strokeWidth: 0
    });
    treepath.addChild(rec);
    return treepath
}

function generateMuxTwig(treepath, px, py,cw, stagelength , newspacing, level, maxlevel, islast=false) {
    //var newspacing = 2 * (spacing + cw);
    var hspacing = newspacing/2;
    var lex = px - 0.5 * newspacing;
    var ley = py + cw + stagelength;
    var rex = px + 0.5 * newspacing;
    var rey = py + cw + stagelength;

    if(level == maxlevel){
        islast = true;
        // console.log("Final Spacing: " + newspacing)
    }

    drawmuxtwig(treepath, px, py, cw, stagelength, newspacing, islast);

    if(!islast){
        generateMuxTwig(treepath, lex, ley, cw, stagelength, hspacing, level+1, maxlevel);
        generateMuxTwig(treepath, rex, rey, cw, stagelength, hspacing, level+1, maxlevel);
    }
}

const MuxTarget = function (params) {
    let position = params["position"];
    let cw = params["flowChannelWidth"];
    let orientation = params["orientation"];
    let direction = params["direction"];
    let spacing = params["spacing"];
    let leafs = params["leafs"];
    let color = params["color"];
    let stagelength = params["stageLength"];
    let px = position[0];
    let py = position[1];

    let levels = Math.ceil(Math.log2(leafs));
    let isodd = false; //This is used to figure out how many lines have to be made
    if (leafs % 2 == 0) {
        isodd = false;
    } else {
        isodd = true;
    }
    let w = spacing * (leafs / 2 + 1);
    let l = (levels + 1) * stagelength;

    var treepath = new paper.CompoundPath();

    generateMuxTwig(treepath, px, py, cw, stagelength, w, 1, levels);


    //Draw the tree

    treepath.fillColor = color;
    treepath.fillColor.alpha = 0.5;
    var rotation = 0;
    if (orientation == "H" && direction == "OUT") {
        rotation = 180;
    } else if (orientation == "V" && direction == "IN") {
        rotation = 270;
    } else if (orientation == "V" && direction == "OUT") {
        rotation = 90;
    }
    return treepath.rotate(rotation, px, py);

};


/************************************************/
const YTree = function (params) {
    let position = params["position"];
    let cw = params["flowChannelWidth"];
    let orientation = params["orientation"];
    let direction = params["direction"];
    let spacing = params["spacing"];
    let leafs = params["leafs"];
    let color = params["color"];
    let stagelength = params["stageLength"];
    let px = position[0];
    let py = position[1];

    let levels = Math.ceil(Math.log2(leafs));
    let isodd = false; //This is used to figure out how many lines have to be made
    if (leafs % 2 == 0) {
        isodd = false;
    } else {
        isodd = true;
    }
    let w = spacing * (leafs / 2 + 1);
    let l = (levels + 1) * stagelength;

    var treepath = new paper.CompoundPath();

    generateYTwig(treepath, px, py, cw, stagelength, w, 1, levels);


    //Draw the tree

    treepath.fillColor = color;
    var rotation = 0;
    if (orientation == "H" && direction == "OUT") {
        rotation = 180;
    } else if (orientation == "V" && direction == "IN") {
        rotation = 270;
    } else if (orientation == "V" && direction == "OUT") {
        rotation = 90;
    }
    return treepath.rotate(rotation, px, py);
};

function drawYtwig(treepath, px, py, cw, stagelength, spacing, drawleafs=false) {

    let pivotpoint = new paper.Point(px, py);

    //stem
    let startPoint = new paper.Point(px - cw/2, py - cw/2);

    let angle = Math.atan(spacing/2 / stagelength);

    let h = spacing/2 / Math.sin(angle) + cw;

    //left leaf
    let rec = paper.Path.Rectangle({
        size: [cw, h],
        point:startPoint,
        radius:cw/2,
        stokeWidth:0
    });
    rec.rotate(angle * 180/Math.PI, pivotpoint);
    treepath.addChild(rec);

    //right leaf
    rec = paper.Path.Rectangle({
        size: [cw, h],
        point:startPoint,
        radius:cw/2,
        stokeWidth:0
    });
    rec.rotate(-angle * 180/Math.PI, pivotpoint);
    treepath.addChild(rec);

    return treepath
}

function generateYTwig(treepath, px, py,cw, stagelength , newspacing, level, maxlevel, islast=false) {
    var hspacing = newspacing/2;
    var lex = px - 0.5 * newspacing;
    var ley = py + stagelength ;
    var rex = px + 0.5 * newspacing ;
    var rey = py + stagelength ;

    if(level == maxlevel){
        islast = true;
    }

    drawYtwig(treepath, px, py, cw, stagelength, newspacing, islast);

    if(!islast){
        generateYTwig(treepath, lex, ley, cw, stagelength, hspacing, level+1, maxlevel);
        generateYTwig(treepath, rex, rey, cw, stagelength, hspacing, level+1, maxlevel);
    }
}

const YTreeTarget = function (params) {

    let treepath = YTree(params);
    treepath.fillColor.alpha = 0.5;
    return treepath;

};

/************************************************/


const CellTrapL = function (params) {
    let orientation = params["orientation"];
    let position = params["position"];
    let chamberLength = params["chamberLength"];
    let numChambers = params["numberOfChambers"];
    let chamberWidth = params["chamberWidth"];
    let feedingChannelWidth = params["feedingChannelWidth"];
    let chamberSpacing = params["chamberSpacing"];
    let color = params["color"];
    let x = position[0];
    let y = position[1];
    var chamberList = new paper.CompoundPath();
    chamberList.fillColor = color;
    var rec;
    var traps;
    var channels;
    if (orientation == "V") {
        let startPoint = new paper.Point(x + chamberLength, y);
        channels = new paper.Path.Rectangle({
            point: startPoint,
            size: [feedingChannelWidth, numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing],
            fillColor: color,
            strokeWidth: 0
        });
        chamberList.addChild(channels);
    }
    else {
        let startPoint = new paper.Point(x, y + chamberLength);
        channels = new paper.Path.Rectangle({
            point: startPoint,
            size: [numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing, feedingChannelWidth],
            fillColor: color,
            strokeWidth: 0
        });
        chamberList.addChild(channels);
    }
    traps = new paper.CompoundPath(chamberList);
    traps.fillColor = color;
    let center = new paper.Point(position[0], position[1]);
    return channels;
};

const CellTrapL_cell = function (params) {
    let orientation = params["orientation"];
    let position = params["position"];
    let chamberLength = params["chamberLength"];
    let numChambers = params["numberOfChambers"];
    let chamberWidth = params["chamberWidth"];
    let feedingChannelWidth = params["feedingChannelWidth"];
    let chamberSpacing = params["chamberSpacing"];
    let color = params["color"];
    let x = position[0];
    let y = position[1];
    let chamberList = new paper.CompoundPath();
    var rec;
    if (orientation == "V") {
        for (let i = 0; i < numChambers / 2; i++) {
            let startPoint = new paper.Point(x, y + i * (chamberWidth + chamberSpacing) + chamberSpacing);
            rec = new paper.Path.Rectangle({
                size: [2 * chamberLength + feedingChannelWidth, chamberWidth],
                point: startPoint,
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.addChild(rec);
        }
    }
    else {
        for (let i = 0; i < numChambers / 2; i++) {
            let startPoint = new paper.Point(x + i * (chamberWidth + chamberSpacing) + chamberSpacing, y);
            rec = paper.Path.Rectangle({
                size: [chamberWidth, 2 * chamberLength + feedingChannelWidth],
                point: startPoint,
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.addChild(rec);
        }
    }
    chamberList.fillColor = color;
    let center = new paper.Point(x, y);
    return chamberList;
};

const CellTrapLTarget = function (params) {
    let orientation = params["orientation"];
    let position = params["position"];
    let chamberLength = params["chamberLength"];
    let numChambers = params["numberOfChambers"];
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

    if (orientation == "V") {
        for (let i = 0; i < numChambers / 2; i++) {
            rec = paper.Path.Rectangle({
                size: [2 * chamberLength + feedingChannelWidth, chamberWidth],
                point: [x, y + i * (chamberWidth + chamberSpacing) + chamberSpacing],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.push(rec);
        }
        channels = paper.Path.Rectangle({
            point: [x + chamberLength, y],
            size: [feedingChannelWidth, numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing],
            fillColor: color,
            strokeWidth: 0
        });
        chamberList.push(channels);
    }
    else {
        for (let i = 0; i < numChambers / 2; i++) {
            rec = paper.Path.Rectangle({
                size: [chamberWidth, 2 * chamberLength + feedingChannelWidth],
                point: [x + i * (chamberWidth + chamberSpacing) + chamberSpacing, y],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.push(rec);
        }
        channels = paper.Path.Rectangle({
            point: [x, y + chamberLength],
            size: [numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing, feedingChannelWidth],
            fillColor: color,
            strokeWidth: 0
        });
        chamberList.push(channels);
    }
    traps = new paper.CompoundPath(chamberList);
    traps.fillColor = color;
    traps.fillColor.alpha = 0.5;
    return traps;
};

const DropletGen = function (params) {
    let pos = params["position"];
    let x = pos[0];
    let y = pos[1];
    let color = params["color"];
    let orificeSize = params["orificeSize"];
    let orificeLength = params["orificeLength"];
    let oilInputWidth = params["oilInputWidth"];
    let waterInputWidth = params["waterInputWidth"];
    let outputWidth = params["outputWidth"];
    let outputLength = params["outputLength"];
    let rotation = params["rotation"];

    let ret = new paper.Path();

    let p1 = new paper.Point(x, y - waterInputWidth / 2);

    let p2 = new paper.Point(p1.x + oilInputWidth, p1.y);

    let p3 = new paper.Point(p2.x, p2.y + (waterInputWidth / 2 - orificeSize / 2));

    let p4 = new paper.Point(p3.x + orificeLength, p3.y);

    let p5 = new paper.Point(p4.x, p4.y - (outputWidth / 2 - orificeSize / 2));

    let p6 = new paper.Point(p5.x + outputLength, p5.y);

    let p7 = new paper.Point(p6.x, p6.y + (outputWidth));

    let p8 = new paper.Point(p7.x - outputLength, p7.y);

    let p9 = new paper.Point(p8.x, p8.y - (outputWidth / 2 - orificeSize / 2));

    let p10 = new paper.Point(p9.x - orificeLength, p9.y);

    let p11 = new paper.Point(p10.x, p10.y + (waterInputWidth / 2 - orificeSize / 2));

    let p12 = new paper.Point(p11.x - oilInputWidth, p11.y);

    ret.add(p1);
    ret.add(p2);
    ret.add(p3);
    ret.add(p4);
    ret.add(p5);
    ret.add(p6);
    ret.add(p7);
    ret.add(p8);
    ret.add(p9);
    ret.add(p10);
    ret.add(p11);
    ret.add(p12);

    //Rotate the geometry
    ret.rotate(-rotation, new paper.Point(pos[0], pos[1]));

    ret.closed = true;
    ret.fillColor = color;
    return ret;
};

const DropletGenTarget = function (params) {

    let ret = DropletGen(params);

    // ret.fillColor = color;
    ret.fillColor.alpha = 0.5;
    return ret;
};

module.exports.RoundedRectLine = RoundedRectLine;
module.exports.EdgedRectLine = EdgedRectLine;
module.exports.GradientCircle = GradientCircle;
module.exports.RoundedRect = RoundedRect;
module.exports.EdgedRect = EdgedRect;
module.exports.EdgedRectTarget = EdgedRectTarget;
module.exports.CircleTarget = CircleTarget;
//module.exports.RectValve = RectValve;
//module.expors.RectValveTarget = RectValveTarget;
module.exports.GroverValve = GroverValve;
module.exports.GroverValve_control = GroverValve_control;

module.exports.Pump = Pump;
module.exports.PumpTarget = PumpTarget;
module.exports.Pump_control = Pump_control;
module.exports.Pump3D = Pump3D;
module.exports.Pump3DTarget = Pump3DTarget;
module.exports.Pump3D_control = Pump3D_control;

module.exports.Chamber = Chamber;
module.exports.ChamberTarget = ChamberTarget;
module.exports.Diamond = Diamond;
module.exports.DiamondTarget = DiamondTarget;
// module.exports.BetterMixer = BetterMixer;
module.exports.Valve = Valve;
// module.exports.BetterMixerTarget = BetterMixerTarget;
module.exports.CurvedMixer = CurvedMixer;
module.exports.CurvedMixerTarget = CurvedMixerTarget;
module.exports.Mixer = Mixer;
module.exports.MixerTarget = MixerTarget;
module.exports.GradientGenerator = GradientGenerator;
module.exports.GradientGeneratorTarget = GradientGeneratorTarget;
module.exports.EdgedRect = EdgedRect;
module.exports.Tree = Tree;
module.exports.TreeTarget = TreeTarget;
module.exports.YTree = YTree;
module.exports.YTreeTarget = YTreeTarget;
module.exports.Mux = Mux;
module.exports.Mux_control = Mux_control;
module.exports.MuxTarget = MuxTarget;
module.exports.Transposer = Transposer;
module.exports.Transposer_control = Transposer_control;
module.exports.TransposerTarget = TransposerTarget;
module.exports.RotaryMixer = RotaryMixer;
module.exports.RotaryMixer_control = RotaryMixer_control;
module.exports.RotaryMixerTarget = RotaryMixerTarget;
module.exports.CellTrapL = CellTrapL;
module.exports.CellTrapL_cell = CellTrapL_cell;
module.exports.CellTrapLTarget = CellTrapLTarget;
module.exports.DropletGen = DropletGen;
module.exports.DropletGenTarget = DropletGenTarget;
module.exports.Transition = Transition;
module.exports.TransitionTarget = TransitionTarget;
// module.exports.CrossHairsTarget = CrossHairsTarget;
module.exports.Connection = Connection;
// module.exports.ConnectionTarget = CrossHairsTarget;
module.exports.ValveTarget = ValveTarget;
module.exports.AlignmentMarks = AlignmentMarks;
module.exports.AlignmentMarks_control = AlignmentMarks_control;
module.exports.AlignmentMarksTarget = AlignmentMarksTarget;