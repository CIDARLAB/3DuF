//var device_json = JSON.parse('');
var device_json = JSON.parse('{"name":"My Device","params":{"width":75800,"height":51000},"layers":[{"name":"flow","color":"indigo","params":{"z_offset":0,"flip":false},"features":{}},{"name":"control","color":"red","params":{"z_offset":1200,"flip":true},"features":{}}],"groups":[],"defaults":{}}');

var BORDER_WIDTH = .1;
var INTERLOCK_TOLERANCE = .125;
var HOLDER_BORDER_WIDTH = .41;
var SLIDE_Z_OFFSET = 1.20;
var HOLDER_SKIRT_WIDTH = .8;
var HOLDER_SKIRT_HEIGHT = .2;
var HOLDER_COLOR = [.5,.5,.5,1];
var SLIDE_COLOR = [.75,.75,1,.2];
var CORNER_DISTANCE = 10;
var SLIDE_THICKNESS = 1.20;

function renderJSON(json){
	var dev = json.device;
	/*
	var features = json.features;
	var layers = json.layers;
	*/

	var options = [];
	var mockup = renderMockup(json);

	options.push(mockup);

	for (var layerID in json.layers){
		options.push(renderLayer(json, layerID));
	}
	return options;
}

function renderLayer(json, layerID){
	var dev = json.device;
	var features = json.features;
	var layerData = json.layers[layerID];
	var layer = renderFeatures(layerData.features, features, layerData.flip, 0, layerData.color);
	if (layerData.flip){
		layer = flipLayer(layer, dev);
	}
	layer = layer.union(SlideHolder(dev.width, dev.height, SLIDE_THICKNESS, false));

	var package = {
		name: dev.name + "_layer_" + layerData.ID,
		caption: layerData.ID + " (Printable Layer)",
		data: layer
	}

	return package;
}

function renderMockup(json){
	var dev = json.device;
	var features = json.features;
	var layers = json.layers;

	var mockup = Placeholder();
	var renderedLayers = [];

	for (var layerID in layers){
		layerData = layers[layerID];
		mockup = mockup.union(renderFeatures(layerData.features, features, layerData.flip, layerData.z_offset, layerData.color));
	}

	var holder = SlideHolder(dev.width, dev.height, SLIDE_THICKNESS, true);

	mockup = mockup.union(holder);

	var package = {
		name: dev.name + "_mockup",
		caption: "Full Mockup (All Layers)",
		data: mockup
	}

	return package;
}

function flipLayer(layer, deviceData){
	var rotated = layer.rotateY(180);
	var translated = rotated.translate([deviceData.width, 0,0]);
	return translated;
}

function renderFeatures(featureIDs, featureData, flip, z_offset, color){
	var layer = Placeholder();
	var features = [];
	for (var featureID in featureIDs){
		var data = featureData[featureIDs[featureID]];
		layer = layer.union(renderFeature(data, flip, z_offset, color));
	}
	return layer;
}

function renderFeature(featureData, flip, z_offset, color){
	//console.log(featureData);
	var type = featureData.type;
	var params = featureData.feature_params;
	var feature = null;

	if (type == "channel"){
		feature = Channel(params.start, params.end, params.width, params.height, flip, z_offset);
	} else if (type == "valve"){	
		feature = Valve(params.position, params.radius1, params.radius2, params.height, flip, z_offset);
	}  else if (type == "standoff"){	
		feature = Standoff(params.position, params.radius1, params.radius2, params.height, flip, z_offset);
	}  else if (type == "port"){	
		feature = Port(params.position, params.radius, params.height, flip, z_offset);
	}  else if (type == "via"){	
		feature = Via(params.position, params.radius1, params.radius2, params.height, flip, z_offset);
	} else {
		//console.log(type);
	}

	feature = feature.setColor(color);
	return feature;
}

function main(params) {
	var target;
	/*
	if (params.type == "channel"){
		target = TwoPointBox(
		[params.startX, params.startY],
		[params.endX, params.endY],
		params.width,
		params.height,
		params.flip, 
		params.z_offset);
	}
	else if (params.type == "valve"){
		target = Cylinder(
			[params.startX, params.startY],
			params.width,
			params.width/2,
			params.height,
			params.flip,
			params.z_offset);
	}

	return SlideHolder(params.slideWidth, params.slideHeight, params.slideThickness).union(target);
	*/

	return renderJSON(transposer_json);
}

function Slide(width, height, thickness){
	var slide = CSG.cube({
		radius: [width/2, height/2, thickness/2]
	});
	slide = slide.translate([width/2, height/2, thickness/2]);
	slide = slide.translate([0,0,-thickness - .00001]);
	slide = slide.setColor(SLIDE_COLOR);
	return slide;
}

function SlideHolder(width, height, thickness, slide){

	var innerX = width + INTERLOCK_TOLERANCE*2;
	var innerY = height + INTERLOCK_TOLERANCE*2;
	var innerZ = thickness + INTERLOCK_TOLERANCE;

	var outerX = innerX + HOLDER_BORDER_WIDTH*2;
	var outerY = innerY + HOLDER_BORDER_WIDTH*2;
	var outerZ = thickness;

	var vertX = innerX - CORNER_DISTANCE*2;
	var vertY = outerY;
	var vertZ = innerZ;

	var horX = outerX;
	var horY = innerY - CORNER_DISTANCE*2;
	var horZ = innerZ;

	var skirtX = outerX + HOLDER_SKIRT_WIDTH*2;
	var skirtY = outerY + HOLDER_SKIRT_WIDTH*2;
	var skirtZ = HOLDER_SKIRT_HEIGHT;

	var inner = CSG.cube({
		radius: [innerX/2, innerY/2, innerZ/2]
	});

	var outer = CSG.cube({
		radius: [outerX/2, outerY/2, outerZ/2]
	});

	var vert = CSG.cube({
		radius: [vertX/2, vertY/2, vertZ/2]
	});

	var hor = CSG.cube({
		radius: [horX/2, horY/2, horZ/2]
	});

	var skirt = CSG.cube({
		radius: [skirtX/2, skirtY/2, skirtZ/2]
	});
	
	skirt = skirt.translate([0,0,-outerZ/2 + skirtZ/2]);

	var blank = outer.union(skirt);
	var border = blank.subtract([inner, vert, hor]);

	//var border = outer.subtract([inner, vert, hor]);
	border = border.translate([outerX/2, outerY/2, outerZ/2]);
	border = border.setColor(HOLDER_COLOR);
	border = border.translate([-INTERLOCK_TOLERANCE - HOLDER_BORDER_WIDTH, -INTERLOCK_TOLERANCE - HOLDER_BORDER_WIDTH, -thickness]);

	if (slide){
		border = border.union(Slide(width, height, thickness));
	}

	return border;
}

function Channel(start, end, width, height, flip, z_offset){
	return TwoPointBox(start, end, width, height, flip, z_offset);
}

function Valve(position, radius1, radius2, height, flip, z_offset){
	return Cylinder(position, radius1, radius2, height, flip, z_offset);
}

function Standoff(position, radius1, radius2, height, flip, z_offset){
	return Cylinder(position, radius1, radius2, height, flip, z_offset);
}

function Port(position, radius, height, flip, z_offset){
	return Cylinder(position, radius, radius, height, flip, z_offset);
}

function Via(position, radius1, radius2, height, flip, z_offset){
	return Cylinder(position, radius1, radius2, height, flip, z_offset);
}

function Cylinder(position, radius1, radius2, height, flip, z_offset){
	var bottom = [0, 0, 0];
	var top = [0, 0, height];
	var cyl = CSG.cylinder({
		start: bottom,
		end: top,
		radiusStart: radius1,
		radiusEnd: radius2
	});
	if (flip){
		cyl = cyl.rotateX(180);
	}
	cyl = cyl.translate([position[0], position[1], z_offset]);
	return cyl;
}

function TwoPointBox(start, end, width, height, flip, z_offset){
	var dX = end[0] - start[0];
	var dY = end[1] - start[1];
	var angle_deg = Math.atan2(dY, dX) * (180/Math.PI);
	var dXPow = Math.pow(dX, 2);
	var dYPow = Math.pow(dY, 2);
	var length = Math.sqrt(dXPow + dYPow);
	var center = []
	var rect = CSG.cube({
		radius: [length/2, width/2, height/2]
	});
	rect = rect.rotateZ(angle_deg);
	rect = rect.translate([dX/2, dY/2, height/2]);
	rect = rect.translate([start[0], start[1], z_offset]);
	var startCircle = CSG.cylinder({
		start: [start[0], start[1], z_offset],
		end: [start[0], start[1], z_offset + height],
		radius: width/2, 
	})

	var endCircle = CSG.cylinder({
		start: [end[0], end[1], z_offset],
		end: [end[0], end[1], z_offset + height],
		radius: width/2, 
	})

	var whole = rect.union([startCircle, endCircle]);

	if (flip){
		whole = whole.translate([0,0,-height]);
	}

	return whole;
}

function Placeholder(){
	return CSG.cube({
		radius: [0,0,0]
	})
}

function getParameterDefinitions(){
	return [
	{
		name: "type",
		type: "choice",
		values: ["channel", "valve"],
		captions: ["Channel", "Valve"],
		caption: "Feature Type:",
		initial: "valve"
	},
	{
		name: "width",
		type: "float",
		initial: 1
	},
	{
		name: "height",
		type: "float",
		initial: .4
	},
	{
		name: "z_offset",
		type: "float",
		initial: 0
	},
	{
		name: "flip",
		type: "bool",
		initial: false
	},
	{
		name: "startX",
		type: "float",
		initial: 20
	},
	{
		name: "startY",
		type: "float",
		initial: 20
	},
	{
		name: "endX",
		type: "float",
		initial: 40
	},
	{
		name: "endY",
		type: "float",
		initial: 20
	},
	{
		name: "slideWidth",
		type: "float",
		initial: 75.8
	},
	{
		name: "slideHeight",
		type: "float",
		initial: 51
	},
	{
		name: "slideThickness",
		type: "float",
		initial: 1.20
	}];
}