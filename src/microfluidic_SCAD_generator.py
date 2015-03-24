import uuid
import os

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

		self.output_filename_suffix = ".scad"
		self.scad_functions_filename = scad_functions_filename
		self.device_name = device_name


		self.channels = {}
		self.ports = {}
		self.layers = {}
		self.vias = {}
		self.valves = {}
		self.standoffs = {}
		self.labels = {}

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
		layer_filename = layer_label_text + self.output_filename_suffix
		if (label_layer):
			if (layer.flip):
				self.create_label(self.label_flipped_position(), layer.ID, layer_label_text)
			else:
				self.create_label(self.label_default_position, layer.ID, layer_label_text)

		self.output_SCAD_file(layer_filename, layer.channel_list(), layer.port_list(), layer.via_list(), layer.valve_list(), layer.standoff_list(), layer.label_list(), layer.flip, layer.offset, self.width, self.height)

	def output_mockup_SCAD(self):
		new_filename = self.device_name + "_MOCKUP" +  self.output_filename_suffix
		self.output_SCAD_file(new_filename, self.channels.values(), self.ports.values(), self.vias.values(), self.valves.values(), self.standoffs.values(), self.labels.values(), False, 0, self.width, self.height)

	def output_all_SCAD(self, label_layers = True):
		for layer in self.layers.keys():
			self.output_layer_SCAD(layer, label_layers)
		self.output_mockup_SCAD()

	def create_channel(self, start, end, layer, height = None, width = None, ID = None):
		if ID == None:
				ID = uuid.uuid4()
		if height == None:
			height = self.channel_height
		if width == None:
			width = self.channel_width
		target_layer = self.layers[layer]
		target_layer.channels.append(ID)
		self.channels[ID] = Channel(start, end, target_layer, height, width, ID)

	def create_port(self, position, layer, height = None, radius = None, ID = None):
		if ID == None:
			ID = uuid.uuid4()
		if height == None:
			height = self.port_height()
		if radius == None:
			radius = self.port_radius
		target_layer = self.layers[layer]
		target_layer.ports.append(ID)
		self.ports[ID] = Port(position, target_layer, height, radius, ID)

	def create_standoff(self, position, layer, height = None, radius1 = None, radius2 = None, ID = None):
		if ID == None:
			ID = uuid.uuid4()
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
			ID = uuid.uuid4()
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
			ID = uuid.uuid4()
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
			ID = uuid.uuid4()
		if height == None:
			height = self.label_height
		target_layer = self.layers[layer]
		target_layer.labels.append(ID)
		self.labels[ID] = Label(position, target_layer, text, height, ID)

	def create_layer(self, offset, ID = None, flip = False):
		if ID == None:
			ID = uuid.uuid4()
		self.layers[ID] = Layer(offset, ID, flip, self)

class Channel:
	
	def __init__(self, start, end, layer, height, width, ID):

		self.ID = ID
		self.layer = layer
		self.layer.channels.append(self.ID)
		self.start = start
		self.end = end
		self.width = width
		self.height = height
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.start, self.end, self.width, self.height, self.flip, self.layer.offset]

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

class Valve:

	def __init__(self, position, layer, height, radius1, radius2, ID):
		self.position = position
		self.radius1 = radius1
		self.radius2 = radius2
		self.height = height
		self.layer = layer
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.position, self.radius1, self.radius2, self.height, self.flip, self.layer.offset]# + channel_height]

class Label:

	def __init__(self, position, layer, text, height, ID):
		self.position = position
		self.height = height
		self.text = text
		self.layer = layer
		self.flip = layer.flip

	def SCAD_data(self):
		return [self.position, self.text, self.height, self.flip, self.layer.offset]

class Layer:

	def __init__(self, offset, ID, flip, generator):
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


