from microfluidic_SCAD_generator import UF_Generator
import json
import os

dev_name = "json_device"
dev_width = 0;
dev_height = 0;
filename = "test.JSON"
json_data = open(filename, 'r').read()
data = json.loads(json_data)
ports = []
#print(json_data)
objects = data["objects"]
for obj in objects:
	if (obj["type"] == 'rect'):
		dev_width = obj["width"]/10
		dev_height = obj["height"]/10
	elif (obj["type"] == 'circle'):
		radius = (obj["height"]/(2) * obj["scaleX"])
		x = obj["left"] + radius
		y = obj["top"] + radius
		ports.append([[x,y], radius]);

UF = UF_Generator(dev_name, width=dev_width, height=dev_height)
UF.create_layer(0,"flow", flip=False)
for port in ports:
	UF.create_standoff([port[0][0]/10, dev_height - port[0][1]/10], "flow", radius1=(port[1]/10), radius2 = (port[1]/10)/1.5)

UF.output_all_SCAD(label_layers = False)
"""
UF = UF_Generator("hello_device", width=75.8, height=51)
UF.create_layer(0, "flow") 
UF.create_layer(1.2, "control", flip = True) 
UF.create_channel([15,15], [60,15], "flow")  
UF.create_port([15,15], "flow")
UF.create_port([60,15], "flow")
UF.create_valve([35,15], "control")
UF.create_channel([35,15], [35,35], "control", width = .6)
UF.create_port([35,35], "control")
UF.output_all_SCAD(label_layers = True)
"""