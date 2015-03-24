from microfluidic_SCAD_generator import UF_Generator

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