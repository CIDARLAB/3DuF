import microfluidic_SCAD_generator 

ufgen = microfluidic_SCAD_generator.UF_Generator("valve_test_device")

ufgen.layer_offset = 4
ufgen.valve_radius_1 = 3
ufgen.valve_radius_2 = 2.4

ufgen.standoff_radius_1 = 3;
ufgen.standoff_radius_2 = 2.4;

width = ufgen.width
height = ufgen.height
channel_widths = [.41, 1.01, 2.01]
valve_membrane_thicknesses = [.3, .5, .8, 1]

stamps_horizontal = len(valve_membrane_thicknesses)
stamps_veritcal = len(channel_widths)

print("Creating " + str(stamps_horizontal * stamps_veritcal) + " stamps, " + str(stamps_horizontal) + " horizontal and " + str(stamps_veritcal) + " vertical.")

stamp_start_x = 2
stamp_start_y = 6
stamp_buffer_x = 2
stamp_buffer_y = 3
stampWidth = (width-stamp_start_x*2)/stamps_horizontal
stampHeight = (height-stamp_start_y)/stamps_veritcal
pneuWidth = 1.2
pneuHeight = 1
chanHeight = .05
portRadius = 1.2
viaRadius = 1.4
viaHeight = ufgen.layer_offset - pneuHeight
portHeight = 1
chanPortHeight = .05

c = ufgen.create_layer(ufgen.layer_offset, "c", True, color="Red")
f = ufgen.create_layer(0, "f", color="Blue")
b = ufgen.create_layer(ufgen.layer_offset, "b",  False, color="Purple")

corner_offset = 3;
offset_point_1 = [corner_offset, corner_offset]
offset_point_2 = [width-corner_offset, corner_offset]
offset_point_3 = [width-corner_offset, height-corner_offset]
offset_point_4 = [corner_offset, height-corner_offset]

"""
standoff_1 = ufgen.create_standoff(offset_point_1, "f")
standoff_2 = ufgen.create_standoff(offset_point_2, "f")
standoff_3 = ufgen.create_standoff(offset_point_3, "f")
standoff_4 = ufgen.create_standoff(offset_point_4, "f")

"""

def getValveHeight(membrane_thickness):
	return ufgen.layer_offset - chanHeight - membrane_thickness

def makeStamp(start, membraneThickness, channelWidth):
	port_pos = [start[0], start[1] + stamp_buffer_y]
	valve_pos = [start[0], start[1] + stampHeight - stamp_buffer_y*2]
	chan_x1 = start[0] - stampWidth/2 + stamp_buffer_x
	chan_x2 = chan_x1 + stampWidth - stamp_buffer_x*2
	chanStart = [chan_x1, valve_pos[1]]
	chanEnd = [chan_x2, valve_pos[1]]
	ufgen.create_valve(valve_pos, "c", height=getValveHeight(membraneThickness))
	ufgen.create_channel(port_pos, valve_pos, "c", width=pneuWidth, height=pneuHeight)
	ufgen.create_channel(chanStart, chanEnd, "f", width=channelWidth, height=chanHeight)
	ufgen.create_port(port_pos, "c", radius=portRadius, height=portHeight)
	ufgen.create_via(chanStart, "f", radius1 =viaRadius, radius2=portRadius, height=viaHeight)
	ufgen.create_via(chanEnd, "f", radius1=viaRadius, radius2=portRadius, height=viaHeight)
	ufgen.create_port(chanStart, "c", radius=portRadius, height=pneuHeight)
	ufgen.create_port(chanEnd, "c", radius=portRadius, height=pneuHeight)

	ufgen.create_port(chanStart, "b", radius=portRadius, height=.4)
	ufgen.create_port(chanEnd, "b", radius=portRadius, height=.4)
	ufgen.create_port(port_pos, "b", radius=portRadius, height=.4)

	print("Making stamp at: " + str(start))


for i in range(len(channel_widths)):
	for j in range(len(valve_membrane_thicknesses)):
		if (j % 2 == 0):
			start_y = stampHeight/3 + i * stampHeight
		else:
			start_y =  i * stampHeight
		start_x = stamp_start_x + stampWidth/2 + j * stampWidth
		start = [start_x, start_y]
		makeStamp(start, valve_membrane_thicknesses[j], channel_widths[i])

ufgen.output_all_SCAD(False)