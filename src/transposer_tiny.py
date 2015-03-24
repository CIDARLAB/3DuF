import microfluidic_SCAD_generator 

ufgen = microfluidic_SCAD_generator.UF_Generator("transposer_tiny")

c = ufgen.create_layer(ufgen.layer_offset, "c", True)
f = ufgen.create_layer(0, "f")

x_offset_start = 30
y_offset_start = 20

width = ufgen.width
height = ufgen.height
pneu_channel_width = .4;
pneu_channel_height = .4;
BUFFER_DISTANCE = .6# mm, area left clear between features

x0 = x_offset_start
x1 = x0 + BUFFER_DISTANCE + ufgen.channel_width + ufgen.valve_radius_1
x2 = x1 + ufgen.channel_width/2 + BUFFER_DISTANCE + ufgen.valve_radius_1
x3 = x2 + BUFFER_DISTANCE + ufgen.valve_radius_1*2
x4 = x3 + ufgen.valve_radius_1 *2 + BUFFER_DISTANCE
x5 = x4 + ufgen.valve_radius_1  + BUFFER_DISTANCE + ufgen.channel_width/2
x6 = x5 + ufgen.channel_width/2 + BUFFER_DISTANCE + ufgen.valve_radius_1

y0 = y_offset_start
y1 = y0 + BUFFER_DISTANCE + ufgen.channel_width + ufgen.valve_radius_1
y2 = y1 + ufgen.channel_width/2 + BUFFER_DISTANCE + ufgen.valve_radius_1 
y3 = y2 + ufgen.valve_radius_1 + BUFFER_DISTANCE + ufgen.via_radius_1
y4 = y3 + ufgen.via_radius_1 + BUFFER_DISTANCE + ufgen.valve_radius_1
y5 = y4 + ufgen.valve_radius_1 + BUFFER_DISTANCE  + ufgen.channel_width/2
y6 = y5 + ufgen.channel_width/2 + BUFFER_DISTANCE
y7 = y6 + ufgen.valve_radius_1 + BUFFER_DISTANCE

va1 = [x2, y2]
va2 = [x3, y1]
va3 = [x4, y2]
va4 = [x2, y4]
va5 = [x3, y5]
va6 = [x4, y4]

ufgen.create_valve(va1, "c", ID = "VA1")
ufgen.create_valve(va2, "c", ID = "VA2")
ufgen.create_valve(va3, "c", ID = "VA3")
ufgen.create_valve(va4, "c", ID = "VA4")
ufgen.create_valve(va5, "c", ID = "VA5")
ufgen.create_valve(va6, "c", ID = "VA6")

vi1 = [x2, y3]
vi2 = [x4, y3]

ufgen.create_via(vi1, "f", ID = "VI1")
ufgen.create_via(vi2, "f", ID = "VI2")

c1_a = [x4, y1]
c1_b = [x4, y2]
c1_c = [x3, y2]
c1_d = [x3, y4]
c1_e = [x2, y4]
c1_f = [x2, y5]

ufgen.create_channel(c1_a, c1_b, "f", ID ="C1_AB")
ufgen.create_channel(c1_b, c1_c, "f", ID ="C1_BC")
ufgen.create_channel(c1_c, c1_d, "f", ID ="C1_CD")
ufgen.create_channel(c1_d, c1_e, "f", ID ="C1_DE")
ufgen.create_channel(c1_e, c1_f, "f", ID ="C1_EF")

c2_a = [x2, y1]
c2_b = [x2, y3]

ufgen.create_channel(c2_a, c2_b, "f", ID = "C2_AB")

c3_a = [x4, y5]
c3_b = [x4, y3]

ufgen.create_channel(c3_a, c3_b, "f", ID = "C3_AB")

c4_a = [x0, y1]
c4_b = [x6, y1]

ufgen.create_channel(c4_a, c4_b, "f", ID = "C4_AB")

c5_a = [x0, y5]
c5_b = [x6, y5]

ufgen.create_channel(c5_a, c5_b, "f", ID = "C5_AB")

c6_a = [x2, y3]
c6_b = [x4, y3]

ufgen.create_channel(c6_a, c6_b, "c", ID = "C6_AB")
ufgen.create_port(c6_a, "c", ID = "C6_PA")
ufgen.create_port(c6_b, "c", ID = "C6_PB")

pnc1_a = [x3, y1]
pnc1_b = [x3, y0]
pnc1_c = [x1, y0]
pnc1_d = [x1, y6]
pnc1_e = [x3, y6]
pnc1_f = [x3, y5]
pnc1_g = [x3, y7]

ufgen.create_channel(pnc1_a, pnc1_b, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC1_AB")
ufgen.create_channel(pnc1_b, pnc1_c, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC1_BC")
ufgen.create_channel(pnc1_c, pnc1_d, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC1_CD")
ufgen.create_channel(pnc1_d, pnc1_e, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC1_DE")
ufgen.create_channel(pnc1_e, pnc1_f, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC1_EF")
ufgen.create_channel(pnc1_e, pnc1_g, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC1_EG")

pnc2_a = [x2, y2]
pnc2_b = [x5, y2]
pnc2_c = [x5, y7]
pnc2_d = [x2, y4]
pnc2_e = [x5, y4]

ufgen.create_channel(pnc2_a, pnc2_b, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC2_AB")
ufgen.create_channel(pnc2_b, pnc2_c, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC2_BC")
ufgen.create_channel(pnc2_d, pnc2_e, "c", width = pneu_channel_width, height = pneu_channel_height, ID = "PNC2_DE")

corner_offset = 3;
offset_point_1 = [corner_offset, corner_offset]
offset_point_2 = [width-corner_offset, corner_offset]
offset_point_3 = [width-corner_offset, height-corner_offset]
offset_point_4 = [corner_offset, height-corner_offset]

standoff_1 = ufgen.create_standoff(offset_point_1, "f")
standoff_2 = ufgen.create_standoff(offset_point_2, "f")
standoff_3 = ufgen.create_standoff(offset_point_3, "f")
standoff_4 = ufgen.create_standoff(offset_point_4, "f")

ufgen.output_all_SCAD(False)