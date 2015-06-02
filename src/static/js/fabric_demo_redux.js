var default_zoom = .95;

if (document.addEventListener) {
  // IE9, Chrome, Safari, Opera
  document.addEventListener("mousewheel", MouseWheelHandler, false);
  // Firefox
  document.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
}
// IE 6/7/8
else document.attachEvent("onmousewheel", MouseWheelHandler);


$(document).keydown(function(ev){
	if (ev.which === 18)
	{
    	enable_grab();
    }
});

$(document).keyup(function(ev){
    if (ev.which === 18)
    {
    	disable_grab();
	}
});


function MouseWheelHandler(e) {

  // cross-browser wheel delta
  var e = window.event || e; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  if (delta > 0)
  {
    console.log("UP");
    canvas.setZoom(canvas.viewport.zoom*1.1);
  }
  else
  {
    console.log("DOWN");
    canvas.setZoom(canvas.viewport.zoom/1.1);
  }
  return false;
}

var setup_defaults = function()
{
	disable_grab();
	set_zoom(10);
	reset_view_position();
}

var reset_view_position = function()
{
	canvas.viewport.position = new fabric.Point(5,5);
}

var set_optimal_position = function()
{
	canvas.viewport.position = compute_optimal_position();
}

var compute_optimal_position = function()
{
	return new fabric.Point((canvas.width * (1 - default_zoom)/2), (canvas.height * (1 - default_zoom))/2);
}

var compute_optimal_zoom = function()
{
	var x_max = canvas.width * default_zoom;
	var y_max = canvas.height * default_zoom;
	var x_max_zoom = x_max / json_data["device"]["width"];
	var y_max_zoom = y_max / json_data["device"]["height"];

	if (x_max_zoom > y_max_zoom)
	{
		return y_max_zoom;
	}
	else
	{
		return x_max_zoom;
	}
}

var enable_grab = function()
{
	canvas.isGrabMode = true;
}

var disable_grab = function()
{
	canvas.isGrabMode = false;
}

var set_zoom = function(zoom_amount)
{
	canvas.setZoom(zoom_amount);
}

var adjust_zoom = function(zoom_modifier)
{
	set_zoom(canvas.viewport.zoom * zoom_modifier);
}

var flip_y_value = function(y_value)
{
	return json_data["device"]["height"] - y_value;
}

var clear_data = function()
{
	json_data = {};
	json_to_fabric = {};
	fabric_to_json = {};
	canvas.clear();
}

// ---------------------------------
// Default Fabric primitives 
// ---------------------------------

var default_background_line = function(start, end, width, color)
{
	var coords = [start[0], flip_y_value(start[1]), end[0], flip_y_value(end[1])];
	return new fabric.Line(
		coords, 
		{
			hasRotatingPoint: false,
			stroke: color,
   			strokeWidth: width,
   			selectable: false,
   			hasControls: false,
    		centeredScaling: true,
    		originY: 'center',
    		originX: 'center', 
    		lockRotation: true
    	}
    );
}

var default_circle = function(position, radius, color)
{
    return new fabric.Circle(
		{
			top: flip_y_value(position[1]),
			left: position[0],
			radius: radius,
			lockRotation: true, 
    		originX: 'center',
    		originY: 'center',
    		fill: color,
    		centeredScaling: true,
    		lockUniScaling: true,
    		hasRotatingPoint: false,
    		strokeWidth: 0
    	}
    );
}

var default_channel = function(start, end, width, color)
{
	var flipEnd = [end[0], flip_y_value(end[1])];
	var flipStart = [start[0], flip_y_value(start[1])];
	var dX = flipEnd[0] - flipStart[0];
	var dY = flipEnd[1] - flipStart[1];
	var angle_rad = Math.atan2(dY, dX);
	var angle_deg = angle_rad * 180 / Math.PI;
	var dX_Pow = Math.pow(dX, 2);
	var dYPow = Math.pow(dY, 2);
	var length = Math.sqrt(dX_Pow + dYPow);
	var fab =  new fabric.Rect(
		{
			left: flipStart[0],
			top: flipStart[1],
			centeredScaling: true,
			angle: angle_deg,
			width: length,
			height: width,
			fill: color,
			originX: "left",
			originY: "center",
			hasRotatingPoint: false
		}
	);
	return fab;
}

var default_line = function(start, end, width, color)
{
	var coords = [start[0], flip_y_value(start[1]), end[0], flip_y_value(end[1])];
	return new fabric.Line(
		coords, 
		{
			hasRotatingPoint: false,
			stroke: color,
   			strokeWidth: width,
   			selectable: true,
   			hasControls: false,
    		centeredScaling: true,
    		originY: 'center',
    		originX: 'center', 
    		lockRotation: true
    	}
    );
}

// ---------------------------------
// JSON data parsing helper functions
// ---------------------------------

var get_feature_color = function(json_feature)
{
	if ("color" in json_feature)
	{
		return json_feature["color"]
	}
	else 
	{
		var layer = json_feature["layer"];
		return json_data["layers"][layer]["color"];
	}
}

var get_feature_params = function(json_feature)
{
	return json_feature["feature_params"];
}

var get_fab = function(json_feature)
{
	return json_to_fabric[json_feature["ID"]]
}

// ---------------------------------
// JSON <-> Fabric Handler Functions
// ---------------------------------

var cylinder_handler = function()
{
	this.create_fabric = function(cylinder_feature)
	{
		var params = get_feature_params(cylinder_feature);
		var position = params["position"]
		var radius = params["radius"];
		var color = get_feature_color(cylinder_feature);
		fab = default_circle(position, radius, color);
		fab.feature_ID = cylinder_feature["ID"];

		return fab;
	}

	this.update_json = function(fabric_cylinder)
	{
		var x = fabric_cylinder["left"];
		var y = fabric_cylinder["top"];

		if ('group' in fabric_cylinder)
		{
			x += fabric_cylinder.group.left + fabric_cylinder.group.width/2;
			y += fabric_cylinder.group.top + fabric_cylinder.group.height/2;
		}

		var position = [x,flip_y_value(y)];
		var radius = fabric_cylinder.radius * fabric_cylinder.scaleX;	
		var params = {radius: radius, position: position};
		update_json_feature(fabric_cylinder["feature_ID"], params);

	}
}

var channel_handler = function()
{
	this.create_fabric = function(channel_feature)
	{
		var params = get_feature_params(channel_feature);
		var start = params["start"];
		var end = params["end"];
		var width = params["width"];
		var color = get_feature_color(channel_feature);
		//fab = default_line(start, end, width, color);
		var fab = default_channel(start, end, width, color);
		fab.feature_ID = channel_feature["ID"];
		return fab;
	}

	this.update_json = function(fabric_channel)
	{
		var length = fabric_channel.width;
		var start = [fabric_channel.left, fabric_channel.top];
		var width = fabric_channel.height * fabric_channel.scaleY;
		var angle_deg = fabric_channel.angle;
		var angle_rad = angle_deg / 180 * Math.PI;
		var dX = length * Math.cos(angle_rad);
		var dY = length * Math.sin(angle_rad);
		var end = [start[0] + dX, start[1] + dY];

		if ('group' in fabric_channel)
		{
			end[0] += fabric_channel.group.left + fabric_channel.group.width/2;
			end[1] += fabric_channel.group.top + fabric_channel.group.height/2;
			start[0] += fabric_channel.group.left + fabric_channel.group.width/2;
			start[1] += fabric_channel.group.top + fabric_channel.group.height/2;
		}

		var flipStart = [start[0], flip_y_value(start[1])];
		var flipEnd = [end[0], flip_y_value(end[1])];
		var params = {start: flipStart, end: flipEnd, width: width};
		update_json_feature(fabric_channel["feature_ID"], params);
	}
}

var cone_handler = function()
{
	this.create_fabric = function(cone_feature)
	{
		var params = get_feature_params(cone_feature);
		var position = params["position"]
		var radius = params["radius1"];
		var color = get_feature_color(cone_feature);
		var fab = default_circle(position, radius, color);
		fab.feature_ID = cone_feature["ID"];
		return fab;
	}

	this.update_json = function(fabric_cone)
	{
		var x = fabric_cone["left"];
		var y = fabric_cone["top"];

		if ('group' in fabric_cone)
		{
			x += fabric_cone.group.left + fabric_cone.group.width/2;
			y += fabric_cone.group.top + fabric_cone.group.height/2;
		}

		var position = [x,flip_y_value(y)];
		var radius = fabric_cone["radius"] * fabric_cone["scaleX"];	
		var params = {radius1: radius, position: position};
		update_json_feature(fabric_cone["feature_ID"], params);
	}
}

var update_json_feature = function(feature_ID, params)
{
	for (prop in params)
	{
		json_data["features"][feature_ID]["feature_params"][prop] = params[prop];
	}
}

var handlers =
{
	port: new cylinder_handler(),
	valve: new cone_handler(),
	via: new cone_handler(),
	standoff: new cone_handler(),
	valve: new cone_handler(),
	channel: new channel_handler()
};

var init_feature = function(json_feature)
{
	var type = json_feature["type"];
	var ID = json_feature["ID"];
	var handler = handlers[type];
	var new_fab = handler.create_fabric(json_feature);
	json_to_fabric[ID] = new_fab;
	canvas.add(new_fab);
	return new_fab;
}

var init_border = function()
{
	var device_data = json_data["device"];
	var width = device_data["width"];
	var height = device_data["height"];

	var topLeft = [0, height];
	var topRight = [width, height];
	var botLeft = [0, 0];
	var botRight = [width, 0];

	var lineWidth = .2;
	var color = 'black';

	canvas.add(default_background_line(topLeft, topRight, lineWidth, color));
	canvas.add(default_background_line(topLeft, botLeft, lineWidth, color));
	canvas.add(default_background_line(botLeft, botRight, lineWidth, color));
	canvas.add(default_background_line(botRight, topRight, lineWidth, color));
}

var update_from_fab_object = function(fab)
{
	var type = fab.get('type');
	if (type == "group")
	{
		var children = fab.getObjects();
		for (child in children)
		{
			update_from_fab_object(children[child]);
		}
	}
	else {
		var feature = json_data["features"][fab.feature_ID];
		var type = feature["type"];
		var handler = handlers[type];
		handler.update_json(fab);
	}
}

var init_all_features = function()
{
	var all_features = json_data["features"];
	for (feature_ID in all_features)
	{
		init_feature(all_features[feature_ID]);
	}
}

var export_to_svg = function()
{
	var svg =  canvas.toSVG();
	var height_string_ori = 'height="' + canvas.height + '"';
	var width_string_ori = 'width="' + canvas.width + '"';
	var height_string_new = 'height="' + canvas.height + "mm" + '"';
	var width_string_new = 'width="' + canvas.width + "mm" + '"';
	var viewbox_string_new = ' viewBox="' + '0 0 ' + canvas.width + " " + canvas.height + '"';
	svg = svg.replace(width_string_ori, width_string_new);
	svg = svg.replace(height_string_ori, height_string_new + viewbox_string_new);
	return svg;
}

var import_json = function(json_object)
{
	remove_layer_buttons();
	clear_data();
	json_data = json_object;
	set_zoom(compute_optimal_zoom());
	set_optimal_position();
	load_all_layers();
	add_layer_buttons();
}

var set_fab_inactive = function(fab)
{
	fab.set({selectable: false});
	fab.setOpacity(.25);
}

var load_all_layers = function(active_layer)
{
	canvas.clear();
	if (active_layer == null)
	{
		for (layer in json_data["layers"])
		{
			load_layer(layer, true);
		}
	}

	else {
		for (layer in json_data["layers"])
		{
			if (layer != active_layer)
			{
				load_layer(layer, false);
			}
		}
		load_layer(active_layer, true);
	}

	init_border();
}

var load_layer = function(layer_ID, active)
{
	var target_layer = json_data["layers"][layer_ID];
 	var layer_features = target_layer["features"];
 	for (feature in layer_features)
 	{
 		new_fab = init_feature(json_data["features"][layer_features[feature]]);
 		if (active == false)
 		{	
 			set_fab_inactive(new_fab);
 		}
	}
}

var count_json_features = function()
{
	var count = 0;
	for (feature in json_data["features"])
	{
		count++;
	}
	return count;
}

var count_layer_features = function(layer_ID)
{
	var count = 0;
	var layer = json_data["layers"][layer_ID];
	for (feature in layer["features"])
	{
		count++;
	}
	return count;
}

var count_all_layer_features = function()
{
	var count = 0;
	for (layer in json_data["layers"])
	{
		var layer_count = count_layer_features(layer);
		count += layer_count;
		console.log("Layer: " + layer + " has " + layer_count + " features.");
	}
	return count;
}

var count_active_fabs = function()
{
	return canvas.getObjects().length;
}

var init_canvas = function()
{
	document.getElementById('c').width = document.getElementById('canvas_block').clientWidth;
	document.getElementById('c').height = document.getElementById('canvas_block').clientHeight;
}

var add_layer_button = function(layer_ID)
{
	var element = document.createElement("input");
	element.type = "button";
	element.name = layer_ID;
	element.value = layer_ID;
	element.className += "btn btn-default";
	element.id = layer_ID + "_button";
	element.onclick = function()
	{
		load_all_layers(layer_ID);
	}
	document.getElementById("layer_buttons").appendChild(element);
}

var remove_layer_button = function(layer_ID)
{
	var element = document.getElementById(layer_ID + "_button");
	element.parentNode.removeChild(element);
}

var remove_layer_buttons = function(layer_ID)
{
	for (layer in json_data["layers"])
	{
		remove_layer_button(layer);
	}
}

var add_layer_buttons = function()
{
	for (layer in json_data["layers"])
	{
		add_layer_button(layer);
	}
}

init_canvas();
canvas = new fabric.CanvasWithViewport('c');
setup_defaults();
json_data = {};

canvas.on('object:modified', function(e)
{
	fab = e.target;
	update_from_fab_object(fab);
});