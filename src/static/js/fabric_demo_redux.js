var default_zoom = .95;

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
		var y = flip_y_value(fabric_cylinder["top"]);
		var position = [x,y];
		var radius = fabric_cylinder["radius"] * fabric_cylinder["scaleX"];	
		params = {radius1: radius, position: position};
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
		fab = default_line(start, end, width, color);
		fab.feature_ID = channel_feature["ID"];
		return fab;
	}

	this.update_json = function(fabric_channel)
	{
		var start = [fabric_channel["x1"], fabric_channel["y1"]];
		var end = [fabric_channel["x2"], fabric_channel["y2"]];
		var width = fabric_channel["strokeWidth"];
		params = {start: start, end: end, width: width};
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
		fab = default_circle(position, radius, color);
		fab.feature_ID = cone_feature["ID"];
		return fab;
	}

	this.update_json = function(fabric_cone)
	{
		var x = fabric_cone["left"];
		var y = flip_y_value(fabric_cone["top"]);
		var position = [x,y];
		var radius = fabric_cone["radius"] * fabric_cone["scaleX"];	
		params = {radius1: radius, position: position};
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
	console.log(fab);
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
		feature = json_data["features"][fab.feature_ID];
		type = feature["type"];
		handler = handlers[type];
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
	svg =  canvas.toSVG();
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