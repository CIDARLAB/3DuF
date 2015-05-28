import uuid
import os
import json

class UF_Generator:

	def __init__(self, device_name = "new_UF_Device", scad_functions_filename = "../SCAD/uF_Generator.scad", width = 75.8, height=51):
		#super small
		self.width = width
		self.height = height
		self.label_height = .1
		self.label_default_position = [6,1]
		self.label_flipped_offset = 6
		self.channel_height = .1
		self.channel_width = .2
		self.port_radius = .5
		self.layer_offset = 1.2
		self.standoff_radius_1 = 1.2
		self.standoff_radius_2 = 1;
		self.via_radius_1 = .6
		self.via_radius_2 = .5
		self.valve_membrane_thickness = .2
		self.valve_radius_1 = 1.2
		self.valve_radius_2 = 1

		self.scad_filename_suffix = ".scad"
		self.json_filename_suffix = ".json"
		self.scad_functions_filename = scad_functions_filename
		self.device_name = device_name


		self.channels = {}
		self.ports = {}
		self.layers = {}
		self.vias = {}
		self.valves = {}
		self.standoffs = {}
		self.labels = {}

	def device_data(self):
		device_data = {}
		device_data["width"] = self.width
		device_data["height"] = self.height
		device_data["name"] = self.device_name

		return device_data

	def import_device_data(self, device_data):
		self.width = device_data["width"]
		self.height = device_data["height"]
		self.device_name = device_data["name"]

	def layer_data(self):
		layer_data = {}
		for layer in self.layers.values():
			layer_data[layer.ID] = layer.JSON_data()
		return layer_data

	def import_layer_data(self, layer_data):
		self.layers = {}
		for layer in layer_data:
			self.layers[layer["ID"]] = Layer(layer["z_offset"], layer["ID"], layer["flip"], self)

	def feature_data(self):
		feature_data = {}
		for channel in self.channels.values():
			feature_data[channel.ID] = channel.JSON_data()
		for port in self.ports.values():
			feature_data[port.ID] = port.JSON_data()
		for standoff in self.standoffs.values():
			feature_data[standoff.ID] = standoff.JSON_data()
		for via in self.vias.values():
			feature_data[via.ID] = via.JSON_data()
		for valve in self.valves.values():
			feature_data[valve.ID] = valve.JSON_data()
		for label in self.labels.values():
			feature_data[label.ID] = label.JSON_data()

		return feature_data

	def import_feature_data(self, feature_data):
		for imported_feature in feature_data:
			feature_type = imported_feature["type"]
			layer = imported_feature["layer"]
			ID = imported_feature["ID"]
			feature = imported_feature["feature_params"]
			if (feature_type == "channel"):
				self.create_channel(feature["start"], feature["end"], layer, feature["height"], feature["width"], ID)
			elif (feature_type == "port"):
				self.create_port(feature["position"], layer, feature["height"], feature["radius"], ID)
			elif (feature_type == "standoff"):
				self.create_standoff(feature["position"], layer, feature["height"], feature["radius1"], feature["radius2"], ID)
			elif (feature_type == "via:"):
				self.create_via(feature["position"], layer, feature["height"], feature["radius1"], feature["radius2"], ID)
			elif (feature_type == "valve"):
				self.create_valve(feature["position"], layer, feature["height"], feature["radius1"], feature["radius2"], ID)
			elif (feature_type == "label"):
				self.create_label(feature["position"], layer, feature["height"], feature["label_text"], ID)

	def JSON_data(self):
		data = {}
		data["device"] = self.device_data()
		data["layers"] = self.layer_data()
		data["features"] = self.feature_data()

		return data

	def port_height(self):
		return self.channel_height

	def standoff_height(self):
		return self.layer_offset

	def via_height(self):
		return self.layer_offset - self.port_height()

	def valve_height(self):
		return self.layer_offset - self.channel_height - self.valve_membrane_thickness

	def label_flipped_position(self):
		x = self.label_default_position[0]
		y = self.height - self.label_flipped_offset
		return [x,y]

	def str_channels_SCAD(self, channel_list):
		return "channels = " + self.component_list_to_string(channel_list) + ";\n"

	def str_ports_SCAD(self, port_list):
		return "ports = " + self.component_list_to_string(port_list) + ";\n"

	def str_vias_SCAD(self, via_list):
		return "vias = " + self.component_list_to_string(via_list) + ";\n"

	def str_valves_SCAD(self, valve_list):	
		return "valves = " + self.component_list_to_string(valve_list) + ";\n"

	def str_standoffs_SCAD(self, standoff_list):	
		return "standoffs = " + self.component_list_to_string(standoff_list) + ";\n"

	def str_width_SCAD(self, width):
		return "width = " + str(self.width) + ";\n"

	def str_height_SCAD(self, height):
		return "height = " + str(self.height) + ";\n"

	def str_labels_SCAD(self, label_list):
		return "labels = " + self.component_list_to_string(label_list) + ";\n"
		
	def str_layerdata_SCAD(self, flip, offset):
		out_string = ""
		out_string += "flip = " + str(flip) + ";\n"
		out_string += "layer_offset = " + str(offset) + ";\n"
		return out_string

	def component_list_to_string(self, components):
		output_list = []
		for component in components:
			output_list.append(component.SCAD_data())
		return str(output_list)

	def make_output_folder(self):
		subdirectory = self.device_name + "_output"
		try: 
			os.mkdir(subdirectory)
		except Exception:
			pass
		return subdirectory

	def output_JSON_file(self, filename):
		sub = self.make_output_folder()
		f = open(os.path.join(sub, filename), 'w')
		f.write(json.dumps(self.JSON_data()))
		f.close()

	@staticmethod
	def import_JSON_file(filename):
		f = open(filename, 'r')
		data = json.loads(f.read())
		f.close()
		device_data = data["device"]
		feature_data = data["features"]
		layer_data = data["layers"]

		UF = UF_Generator()
		UF.import_device_data(device_data)
		UF.import_layer_data(layer_data)
		UF.import_feature_data(feature_data)

		return UF

	def output_SCAD_file(self, filename, channels, ports, vias, valves, standoffs, labels, flip, offset, width, height):
		output = ""
		output += self.str_channels_SCAD(channels)
		output += self.str_ports_SCAD(ports)
		output += self.str_vias_SCAD(vias)
		output += self.str_valves_SCAD(valves)
		output += self.str_standoffs_SCAD(standoffs)
		output += self.str_labels_SCAD(labels)
		output += self.str_width_SCAD(width)
		output += self.str_height_SCAD(height)
		output += self.str_layerdata_SCAD(flip,offset)
		output += "include <" + self.scad_functions_filename + ">"
		output = output.replace("T", "t")
		output = output.replace("F", "f")
		output = output.replace("'", '"')
		sub = self.make_output_folder()
		f = open(os.path.join(sub,filename), 'w')
		f.write(output)
		f.close()

	def output_layer_SCAD(self, layer_name, label_layer = True):
		layer = self.layers[layer_name]
		layer_label_text = self.device_name + "_" + layer.ID
		layer_filename = layer_label_text + self.scad_filename_suffix
		if (label_layer):
			if (layer.flip):
				self.create_label(self.label_flipped_position(), layer.ID, layer_label_text)
			else:
				self.create_label(self.label_default_position, layer.ID, layer_label_text)

		self.output_SCAD_file(layer_filename, layer.channel_list(), layer.port_list(), layer.via_list(), layer.valve_list(), layer.standoff_list(), layer.label_list(), layer.flip, layer.offset, self.width, self.height)

	def output_mockup_SCAD(self):
		new_scad_filename = self.device_name + "_MOCKUP" +  self.scad_filename_suffix
		self.output_SCAD_file(new_scad_filename, self.channels.values(), self.ports.values(), self.vias.values(), self.valves.values(), self.standoffs.values(), self.labels.values(), False, 0, self.width, self.height)

	def output_all_SCAD(self, label_layers = True):
		for layer in self.layers.keys():
			self.output_layer_SCAD(layer, label_layers)
		self.output_mockup_SCAD()
		self.output_JSON_file(self.device_name + self.json_filename_suffix)

	def create_channel(self, start, end, layer, height = None, width = None, ID = None):
		if ID == None:
				ID = uuid.uuid4().urn
		if height == None:
			height = self.channel_height
		if width == None:
			width = self.channel_width
		target_layer = self.layers[layer]
		target_layer.channels.append(ID)
		self.channels[ID] = Channel(start, end, target_layer, height, width, ID)

	def create_port(self, position, layer, height = None, radius = None, ID = None):
		if ID == None:
			ID = uuid.uuid4().urn
		if height == None:
			height = self.port_height()
		if radius == None:
			radius = self.port_radius
		target_layer = self.layers[layer]
		target_layer.ports.append(ID)
		self.ports[ID] = Port(position, target_layer, height, radius, ID)

	def create_standoff(self, position, layer, height = None, radius1 = None, radius2 = None, ID = None):
		if ID == None:
			ID = uuid.uuid4().urn
		if height == None:
			height = self.standoff_height()
		if radius1 == None:
			radius1 = self.standoff_radius_1
		if radius2 == None:
			radius2 = self.standoff_radius_2
		target_layer = self.layers[layer]
		target_layer.standoffs.append(ID)
		self.standoffs[ID] = Standoff(position, target_layer, height, radius1, radius2, ID)

	def create_via(self, position, layer, height = None, radius1 = None, radius2 = None, ID = None):
		if ID == None:
			ID = uuid.uuid4().urn
		if height == None:
			height = self.via_height()
		if radius1 == None:
			radius1 = self.via_radius_1
		if radius2 == None:
			radius2 = self.via_radius_2
		target_layer = self.layers[layer]
		target_layer.vias.append(ID)
		self.vias[ID] = Via(position, target_layer, height, radius1, radius2, ID)

	def create_valve(self, position, layer, height = None, radius1 = None, radius2 = None, ID = None):
		if ID == None:
			ID = uuid.uuid4().urn
		if height == None:
			height = self.valve_height()
		if radius1 == None:
			radius1 = self.valve_radius_1
		if radius2 == None:
			radius2 = self.valve_radius_2
		target_layer = self.layers[layer]
		target_layer.valves.append(ID)
		self.valves[ID] = Valve(position, target_layer, height, radius1, radius2, ID)

	def create_label(self, position, layer, text, height = None, ID = None):
		if ID == None:
			ID = uuid.uuid4().urn
		if height == None:
			height = self.label_height
		target_layer = self.layers[layer]
		target_layer.labels.append(ID)
		self.labels[ID] = Label(position, target_layer, text, height, ID)

	def create_layer(self, offset, ID = None, flip = False, color=[.5,.5,.5,1]):
		if ID == None:
			ID = uuid.uuid4()
		self.layers[ID] = Layer(offset, ID, flip, self, color)

class Channel:
	
	def __init__(self, start, end, layer, height, width, ID):

		self.ID = ID
		self.layer = layer
		self.layer.channels.append(self.ID)
		self.start = start
		self.end = end
		self.width = width
		self.ID = ID
		self.height = height
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.start, self.end, self.width, self.height, self.flip, self.layer.offset]

	def JSON_data(self):
		data = {}
		data["feature_params"] = {}
		data["type"] = "channel"
		data["layer"] = self.layer.ID
		data["feature_params"]["start"] = self.start
		data["feature_params"]["end"] = self.end
		data["feature_params"]["width"] = self.width
		data["feature_params"]["height"] = self.height
		data["ID"] = self.ID

		return data


class Port:

	def __init__(self, position, layer, height, radius, ID):
		self.position = position
		self.radius = radius
		self.height = height
		self.ID = ID
		self.layer = layer
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.position, self.radius, self.height, self.flip, self.layer.offset]

	def JSON_data(self):
		data = {}
		data["feature_params"] = {}
		data["type"] = "port"
		data["layer"] = self.layer.ID
		data["feature_params"]["position"] = self.position
		data["feature_params"]["radius"] = self.radius
		data["feature_params"]["height"] = self.height
		data["ID"] = self.ID

		return data


class Standoff:

	def __init__(self, position, layer, height, radius1, radius2, ID):
		self.position = position
		self.radius1 = radius1
		self.radius2 = radius2
		self.height = height
		self.ID = ID
		self.layer = layer
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.position, self.radius1, self.radius2, self.height, self.flip, self.layer.offset]

	def JSON_data(self):
		data = {}
		data["feature_params"] = {}
		data["type"] = "standoff"
		data["layer"] = self.layer.ID
		data["feature_params"]["position"] = self.position
		data["feature_params"]["radius1"] = self.radius1
		data["feature_params"]["radius2"] = self.radius2
		data["feature_params"]["height"] = self.height
		data["ID"] = self.ID

		return data


class Via:

	def __init__(self, position, layer, height, radius1, radius2, ID):
		self.position = position
		self.radius1 = radius1
		self.radius2 = radius2
		self.height = height
		self.ID = ID
		self.layer = layer
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.position, self.radius1, self.radius2, self.height, self.flip, self.layer.offset]

	def JSON_data(self):
		data = {}
		data["feature_params"] = {}
		data["type"] = "via"
		data["layer"] = self.layer.ID
		data["feature_params"]["position"] = self.position
		data["feature_params"]["radius1"] = self.radius1
		data["feature_params"]["radius2"] = self.radius2
		data["feature_params"]["height"] = self.height
		data["ID"] = self.ID

		return data

class Valve:

	def __init__(self, position, layer, height, radius1, radius2, ID):
		self.position = position
		self.radius1 = radius1
		self.radius2 = radius2
		self.ID = ID
		self.height = height
		self.layer = layer
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.position, self.radius1, self.radius2, self.height, self.flip, self.layer.offset]# + channel_height]

	def JSON_data(self):
		data = {}
		data["feature_params"] = {}
		data["type"] = "valve"
		data["layer"] = self.layer.ID
		data["feature_params"]["position"] = self.position
		data["feature_params"]["radius1"] = self.radius1
		data["feature_params"]["radius2"] = self.radius2
		data["feature_params"]["height"] = self.height
		data["ID"] = self.ID

		return data


class Label:

	def __init__(self, position, layer, text, height, ID):
		self.position = position
		self.height = height
		self.text = text
		self.ID = ID
		self.layer = layer
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.position, self.text, self.height, self.flip, self.layer.offset]

	def JSON_data(self):
		data = {}
		data["feature_params"] = {}
		data["type"] = "label"
		data["layer"] = self.layer.ID
		data["feature_params"]["position"] = self.position
		data["feature_params"]["height"] = self.height
		data["feature_params"]["label_text"] = self.text
		data["ID"] = self.ID

		return data

class Layer:

	def __init__(self, offset, ID, flip, generator, color):
		
		self.color = color
		self.flip = flip;
		self.channels = []
		self.ports = []
		self.vias = []
		self.valves = []
		self.standoffs = []
		self.labels = []
		self.offset = offset
		self.generator = generator 
		self.ID = ID

	def channel_list(self):
		return [self.generator.channels[x] for x in self.channels]

	def port_list(self):
		return [self.generator.ports[x] for x in self.ports]

	def via_list(self):
		return [self.generator.vias[x] for x in self.vias]

	def valve_list(self):
		return [self.generator.valves[x] for x in self.valves]

	def standoff_list(self):
		return [self.generator.standoffs[x] for x in self.standoffs]

	def label_list(self):
		return [self.generator.labels[x] for x in self.labels]

	def all_feature_IDs(self):
		all_IDs = []
		all_IDs = all_IDs + self.channels
		all_IDs = all_IDs + self.ports
		all_IDs = all_IDs + self.vias
		all_IDs = all_IDs + self.labels
		all_IDs = all_IDs + self.standoffs
		all_IDs = all_IDs + self.valves

		return all_IDs

	def JSON_data(self):
		data = {}
		data["flip"] = self.flip
		data["z_offset"] = self.offset
		data["ID"] = self.ID
		data["color"] = self.color
		data["features"] = self.all_feature_IDs()

		return data
