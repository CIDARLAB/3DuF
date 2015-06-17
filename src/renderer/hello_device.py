from microfluidic_SCAD_generator import UF_Generator



UF = UF_Generator("hello_device", width=75.8, height=51)

UF.label_height = .5
UF.channel_height = .2
UF.channel_width = .41
UF.port_radius = 1.6
UF.layer_offset = 2
UF.standoff_radius_1 = 3;
UF.standoff_radius_2 = 2.4;
UF.via_radius_1 = 2
UF.via_radius_2 = 1.6
UF.valve_membrane_thickness = .2
UF.valve_radius_1 = 3
UF.valve_radius_2 = 2.4

UF.create_layer(0, "flow") 
UF.create_layer(UF.layer_offset, "control", flip = True) 
UF.create_channel([15,15], [60,15], "flow")  
UF.create_port([15,15], "flow")
UF.create_port([60,15], "flow")
UF.create_valve([35,15], "control")
UF.create_channel([35,15], [35,35], "control", width = .81)
UF.create_port([35,35], "control")

corner_offset = 5;
offset_point_1 = [corner_offset, corner_offset]
offset_point_2 = [UF.width-corner_offset, corner_offset]
offset_point_3 = [UF.width-corner_offset, UF.height-corner_offset]
offset_point_4 = [corner_offset, UF.height-corner_offset]

standoff_1 = UF.create_standoff(offset_point_1, "flow")
standoff_2 = UF.create_standoff(offset_point_2, "flow")
standoff_3 = UF.create_standoff(offset_point_3, "flow")
standoff_4 = UF.create_standoff(offset_point_4, "flow")

UF.output_all_SCAD(label_layers = True)