channels = [[[35, 15], [35, 35], 0.81, 0.2, true, 2], [[15, 15], [60, 15], 0.41, 0.2, false, 0]];
ports = [[[15, 15], 1.6, 0.2, false, 0], [[35, 35], 1.6, 0.2, true, 2], [[60, 15], 1.6, 0.2, false, 0]];
vias = [];
valves = [[[35, 15], 3, 2.4, 1.6, true, 2]];
standoffs = [[[5, 46], 3, 2.4, 2, false, 0], [[5, 5], 3, 2.4, 2, false, 0], [[70.8, 46], 3, 2.4, 2, false, 0], [[70.8, 5], 3, 2.4, 2, false, 0]];
labels = [[[6, 1], "hello_device_flow", 0.5, false, 0], [[6, 45], "hello_device_control", 0.5, true, 2]];
width = 75.8;
height = 51;
flip = false;
layer_offset = 0;
include <../SCAD/uf_Generator.scad>