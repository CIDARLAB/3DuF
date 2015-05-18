var canvas = new fabric.Canvas('c');
var selectedItem = null;
var fabric_features = {};
var features = {};
var layers = {};
var default_radius = 50;
var device_width = 700;
var device_height = 550;
var device_name = "Default_Device";

var merge = function() {
    var obj = {},
        i = 0,
        il = arguments.length,
        key;
    for (; i < il; i++) {
        for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                obj[key] = arguments[i][key];
            }
        }
    }
    return obj;
};

var feature = function(layer, ID, type){
  this.layer = layer;
  this.ID = ID;
  this.featureType = type;
}

feature.prototype.feature_data = function(){
    var data = {};
    data["layer"] = this.layer;
    data["ID"] = this.ID;
    data["type"] = this.featureType;
    return data;
  };

var layer = function(offset, ID, flip, color){
    this.offset = offset;
    this.flip = flip;
    this.fabric_features = [];
    this.color = color;
    this.ID = ID;
  

  this.JSON_data = function()
  {
    var data = {};
    data["flip"] = this.flip;
    data["z_offset"] = this.offset;
    data["ID"] = this.ID;
    data["color"] = this.color;
    data["features"] = this.fabric_features;
    return data;
  }
}

var via = function(position, layer, height, radius1, radius2, ID){
    feature.call(this, layer, ID, "via");
    this.position = position;
    this.radius1 = radius1;
    this.radius2 = radius2;
    this.height = height;

  this.fab = new fabric.Circle({top: position[1], left: position[0], radius: this.radius1, lockRotation: true, 
    originX: 'center', originY: 'center', fill: 'blue', lockUniScaling: true});

  this.update = function()
  {
    this.position = [this.fab.left, this.fab.top];
    this.radius1 = this.fab.radius;
  }

  this.updateFab = function()
  {
    this.fab.set({'radius': this.radius1, 'left': this.position[0], 'top': this.position[1]});
  }

  this.JSON_data = function(){
    var data = {}
    data["position"] = this.position;
    data["radius1"] = this.radius1;
    data["radius2"] = this.radius2;
    data["height"] = this.height;
    return merge(data, this.feature_data());
  }
}

via.prototype = Object.create(feature.prototype);
via.prototype.constructor = via;

var grabber = function(position, parent){
  this.featureType = "grabber"
  this.strokeWidth = 1
  this.radius = parent.fab['strokeWidth'] * .75;
  this.fab = new fabric.Circle({top: position[1], left: position[0], hasBorders: false, hasControls: false,
    fill:'rgba(255,255,255,.5)', stroke: '#22F', strokeWidth: this.strokeWidth, radius: this.radius,
    originX: 'center', originY: 'center'});
  this.position = function(){
    return [this.fab.left, this.fab.top];
  }
  this.parent = parent;
  return this
}

var channel = function(start, end, width, height, layer, ID)
{
  feature.call(this, layer, ID, "channel");
  this.grabbers = {}
  this.height = height;
  this.start = start;
  this.end = end;
  this.width = width;

  this.toFab = function(coords)
  {
    coords = [this.start[0], this.start[1], this.end[0], this.end[1]]
    return new fabric.Line(coords, {fill: 'red', stroke: 'red',
    strokeWidth: this.width, selectable: true, hasControls: false, lockScalingX: true, 
    lockScalingY: true, centeredScaling: true, originY: 'center', originX: 'center', 
    lockMovementX: true, lockMovementY: true, lockRotation: true});
  }

  this.fab = this.toFab()

  this.update = function()
  {
    this.start = [this.fab.x1, this.fab.y1];
    this.end = [this.fab.x2, this.fab.y2];
    this.width = this.fab.strokeWidth * this.fab.scaleY;
  }

  this.makeGrabbers = function(canvas, fabric_features){
    if (this.grabbers['start'] == null && this.grabbers['end'] == null)
    {
      start = new grabber(this.start, this);
      start.fab.ID = this.ID + "_start_grabber";
      this.grabbers['start'] = start;
      canvas.add(start.fab);
      fabric_features[start.fab.ID] = start;
      end = new grabber(this.end, this);
      end.fab.ID = this.ID + "_end_grabber";
      this.grabbers['end'] = end;
      fabric_features[end.fab.ID] = end;
      canvas.add(end.fab);
    }
  }
  this.killGrabbers = function(canvas, fabric_features){
    if (this.grabbers['start']){
      canvas.remove(this.grabbers['start'].fab);
      fabric_features[this.grabbers['start'].fab.ID] = null;
      this.grabbers['start'] = null;
    }
    if (this.grabbers['end']){
      canvas.remove(this.grabbers['end'].fab);
      fabric_features[this.grabbers['end'].fab.ID] = null;
      this.grabbers['end'] = null;
    }
  }
  this.updateEnds = function(){
    if (this.grabbers['start']){
      pos = this.grabbers['start'].position();
      this.fab.set({'x1': pos[0], 'y1': pos[1]});
    }
    if (this.grabbers['end']){
      pos = this.grabbers['end'].position();
      this.fab.set({'x2': pos[0], 'y2': pos[1]});
    }
    this.update();
    canvas.remove(this.fab);
    canvas.add(this.fab);
  }
  this.JSON_data = function(){
    var data = {}
    data["start"] = this.start;
    data["end"] = this.end;
    data["width"] = this.width;
    data["height"] = this.height;
    return merge(data, this.feature_data());
  }
  return this;
}

channel.prototype = Object.create(feature.prototype);
channel.prototype.constructor = channel;

var valve = function(position, radius1, radius2, height, layer, ID)
{
  feature.call(this, layer, ID, "valve")
  this.fab = new fabric.Circle({radius: radius1, fill:'#f55', left: position[0], top: position[1], lockUniScaling: true, lockRotation: true, centeredScaling: true});
  this.radius1 = radius1;
  this.radius2 = radius2;
  this.position = position;
  this.height = height;
  this.update = function()
  {
    this.radius1 = this.fab.radius * this.fab.scaleX;
    this.position = [this.fab.left, this.fab.top];
  }
  this.JSON_data = function()
  {
    var data = {}
    data["position"] = this.position;
    data["radius1"] = this.radius1;
    data["radius2"] = this.radius2;
    data["height"] = this.height;
    return merge(data, this.feature_data());
  }
  this.json
  return this;
}

valve.prototype = Object.create(feature.prototype);
valve.prototype.constructor = valve;

var standoff = function(position, radius1, radius2, height, layer, ID)
{
  feature.call(this, layer, ID, "standoff")
  this.fab = new fabric.Circle({radius: radius1, fill:'yellow', left: position[0], top: position[1], lockUniScaling: true, lockRotation: true, centeredScaling: true});
  this.radius1 = radius1;
  this.radius2 = radius2;
  this.position = position;
  this.height = height;
  this.update = function()
  {
    this.radius1 = this.fab.radius * this.fab.scaleX;
    this.position = [this.fab.left, this.fab.top];
  }
  this.JSON_data = function()
  {
    var data = {}
    data["position"] = this.position;
    data["radius1"] = this.radius1;
    data["radius2"] = this.radius2;
    data["height"] = this.height;
    return merge(data, this.feature_data());
  }
  return this;
}

standoff.prototype = Object.create(feature.prototype);
standoff.prototype.constructor = standoff;

valve.prototype = Object.create(feature.prototype);
valve.prototype.constructor = valve;

var label = function(position, text, height, layer, ID)
{
  feature.call(this, layer, ID, "label")
  this.fab = new fabric.Text(text, {radius: radius, left: position[0], top: position[1], hasControls: false, lockUniScaling: true, lockRotation: true, centeredScaling: true});
  this.position = position;
  this.text = text;
  this.height = height;
  this.update = function()
  {
    this.position = [this.fab.left, this.fab.top];
    this.text = this.fab.text;
  }
  this.JSON_data = function()
  {
    var data = {}
    data["position"] = this.position;
    data["label_text"] = this.text;
    data["height"] = this.height;
    return merge(data, this.feature_data());
  }
  return this;
}

label.prototype = Object.create(feature.prototype);
label.prototype.constructor = label;

var port = function(position, radius, height, layer, ID)
{
  feature.call(this, layer, ID, "port")
  this.fab = new fabric.Circle({radius: radius, fill:'green', left: position[0], top: position[1], lockUniScaling: true, lockRotation: true, centeredScaling: true});
  this.radius = radius;
  this.position = position;
  this.height = height;
  this.update = function()
  {
    this.radius = this.fab.radius * this.fab.scaleX;
    this.position = [this.fab.left, this.fab.top];
  }
  this.JSON_data = function()
  {
    var data = {}
    data["position"] = this.position;
    data["radius"] = this.radius;
    data["height"] = this.height;
    return merge(data, this.feature_data());
  }
  return this;
}

port.prototype = Object.create(feature.prototype);
port.prototype.constructor = port;


document.addEventListener('keydown', function(event){
	if (event.keyCode == 8 || event.keyCode == 46){
		if (selectedItem != null){

			selectedItem.remove();
		}
	}
	else if (event.keyCode == 16){
		alert(JSON.stringify(canvas));
	}
  else if (event.keyCode == 18)
  {
    if (selectedItem != null ){
      v = fabric_features[selectedItem]
      alert(v.reportString());
    }
  }
  });

var addFeature = function(feature){
  feature.fab.ID = feature.ID;
  fabric_features[feature.fab.ID] = feature;
  layers[feature.layer].fabric_features.push(feature.ID);
  canvas.add(feature.fab);
  features[feature.ID] = feature;
}

var addLayer = function(layer){
  layers[layer.ID] = layer;
}

var removeFeature = function(feature){
  if (fabric_features[feature]){
      fabric_features[feature] = null;
  }
  features[feature.ID] = null;
  canvas.remove(feature.fab);
  layer_fabric_features = layers[feature.layer].fabric_features;
  index = layer_fabric_features.indexOf(feature.ID);
  if (index > -1){
    layer_fabric_features.splice(index, 1);
  }
}

var device_data = function()
{
  var data = {}
  data["width"] = device_width;
  data["height"] = device_height;
  data["name"] = device_name;
  return data;
}

var layer_data = function()
{
  var data = {}
  for (layer_ID in layers)
  {
    layer = layers[layer_ID];
    layerData = layer.JSON_data();
    data[layer_ID] = layerData;
    console.log("Layer ID: " + layer_ID + ", Layer: " + data[layer_ID]);
    console.log(data.layer_ID);
  }
  console.log(data);
  return data;
}

var feature_data = function()
{
  var data = {}
  for (feature_ID in features){
    data[feature_ID] = features[feature_ID].JSON_data();
  }
  return data;
}

var makeJSON = function()
{
   var JSON_data = {};
   JSON_data["device"] = device_data();
   JSON_data["features"] = feature_data();
   JSON_data["layers"] = layer_data();
  // console.log(layer_data());
   return JSON_data;
}

var border = new fabric.Rect({ width: device_width, height: device_height, fill:'white', strokeWidth: 5, stroke:'black'});
canvas.add(border);
border.set({'selectable': false})
var foo = new layer(0, "foo", false, "blue");
var bar = new layer(0, "bar", false, "red");
addLayer(foo);
addLayer(bar);
var chan = new channel(start=[100,200], end=[60,200],width=10,height=1, layer="foo", ID='chan');
var via1 = new via(position = [100,50], layer = "foo", height=1, radius1=20, radius2=10, ID="via1");
var val1 = new valve(position = [300, 200], radius1=30, radius2=15, height=1, layer="foo", ID ='val1');
var port1 = new port(position = [400,400], radius=15, height=1, layer="foo", ID='port1');
var sta1 = new standoff(position = [500, 300], radius1=30, radius2=15, height=1, layer="foo", ID ='sta1');
var lab1 = new label(position=[50,200], text="foobarbaz", height=1, layer="foo", ID='lab1');
addFeature(chan)
addFeature(via1)
addFeature(sta1)
addFeature(val1)
addFeature(lab1)
addFeature(port1)
//console.log(makeJSON());
//console.log(makeJSON());


//chan.makeGrabbers(canvas, fabric_features);
canvas.on('object:moving', function(e){
  p = e.target;
  if (fabric_features[p.ID]){
    var feature = fabric_features[p.ID];
    if (feature.featureType == "grabber"){
      console.log("Moving a grabber!");
      parent = feature.parent;
      if (parent.featureType == "channel"){
        parent.updateEnds();
      }
    }
    else {
      feature.update();
    }
  }
});

canvas.on('mouse:down', function(options){
	if (!options.target || options.target == border)
	{
    console.log("Clicked on nothing...");
    if (selectedItem)
    {
      if (selectedItem.featureType == "channel"){
        console.log("Last selection was a channel, removing grabbers.");
        selectedItem.killGrabbers(canvas, fabric_features);
      }
    }
    if (selectedItem != null)
    {
      console.log("Clearing selection");
	   	selectedItem = null;
    }
	}
	else {
    console.log("Clicked on something!");
    var current = fabric_features[options.target.ID];
    if (current)
    {
      console.log("Current: " + current["ID"]);
      if (selectedItem != null)
      {
        console.log("Selected: " + selectedItem["ID"]);
      }
      if (selectedItem == null || current["ID"] != selectedItem["ID"])
      {
        console.log("Clicked on a new feature");
        if (current.featureType == "channel"){
          console.log("New feature is a channel");
          current.makeGrabbers(canvas, fabric_features);
        }
        if (selectedItem != null && selectedItem.featureType == "channel" && current.featureType != "grabber")
        {
          console.log("Last selection was a channel, removing grabbers.");
          selectedItem.killGrabbers(canvas, fabric_features);
        }
        if (current.featureType != "grabber"){
          console.log("Updating selection...");
          selectedItem = current;
        }
      }
      else {

      }
    }
	}
});

