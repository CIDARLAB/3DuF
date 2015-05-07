$fn = 10;
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\label.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\via.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\port.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\mold\mold.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\valve.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\standoff.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\channel.scad>


union() {
	preset_mold(height = 51, width = 75.8000000000);
	color(c = "Blue") {
		via(flip = false, height = 3.5000000000, position = [67.2000000000, 10], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
	}
	color(c = "Red") {
		valve(flip = true, height = 3.0000000000, position = [54.4000000000, 32.8000000000], radius1 = 3, radius2 = 2.4000000000, z_offset = 4);
	}
	color(c = "Blue") {
		channel(end = [22.8000000000, 25.1000000000], flip = false, height = 0.5000000000, start = [22.8000000000, 10], width = 2, z_offset = 0);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 4, position = [3, 3], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
	}
	color(c = "Blue") {
		via(flip = false, height = 3.5000000000, position = [67.2000000000, 40.2000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [10, 10], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Red") {
		channel(end = [61.8000000000, 32.8000000000], flip = true, height = 0.5000000000, start = [61.8000000000, 17.4000000000], width = 2, z_offset = 4);
	}
	color(c = "Blue") {
		channel(end = [38.6000000000, 40.2000000000], flip = false, height = 0.5000000000, start = [38.6000000000, 10], width = 2, z_offset = 0);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 4, position = [72.8000000000, 48], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.5000000000, position = [67.2000000000, 40.2000000000], radius = 1.6000000000, z_offset = 0);
	}
	color(c = "Blue") {
		channel(end = [67.2000000000, 10], flip = false, height = 0.5000000000, start = [10, 10], width = 2, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [15.4000000000, 40.2000000000], flip = true, height = 0.5000000000, start = [15.4000000000, 10], width = 2, z_offset = 4);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [10, 40.2000000000], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [67.2000000000, 10], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Blue") {
		via(flip = false, height = 3.5000000000, position = [22.8000000000, 25.1000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [54.4000000000, 25.1000000000], flip = true, height = 0.5000000000, start = [22.8000000000, 25.1000000000], width = 2, z_offset = 4);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 4, position = [3, 48], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
	}
	color(c = "Red") {
		valve(flip = true, height = 3.0000000000, position = [38.6000000000, 17.4000000000], radius1 = 3, radius2 = 2.4000000000, z_offset = 4);
	}
	color(c = "Red") {
		label(flip = true, height = 0.5000000000, label_text = "transposer_large_c", position = [6, 45], z_offset = 4);
	}
	color(c = "Red") {
		channel(end = [60.2000000000, 10], flip = true, height = 0.5000000000, start = [15.4000000000, 10], width = 2, z_offset = 4);
	}
	color(c = "Red") {
		channel(end = [22.8000000000, 17.4000000000], flip = true, height = 0.5000000000, start = [38.6000000000, 17.4000000000], width = 2, z_offset = 4);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [22.8000000000, 25.1000000000], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Red") {
		valve(flip = true, height = 3.0000000000, position = [38.6000000000, 32.8000000000], radius1 = 3, radius2 = 2.4000000000, z_offset = 4);
	}
	color(c = "Blue") {
		via(flip = false, height = 3.5000000000, position = [10, 10], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [54.4000000000, 25.1000000000], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Blue") {
		channel(end = [54.4000000000, 25.1000000000], flip = false, height = 0.5000000000, start = [54.4000000000, 40.2000000000], width = 2, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [54.4000000000, 32.8000000000], flip = true, height = 0.5000000000, start = [38.6000000000, 32.8000000000], width = 2, z_offset = 4);
	}
	color(c = "Red") {
		valve(flip = true, height = 3.0000000000, position = [22.8000000000, 17.4000000000], radius1 = 3, radius2 = 2.4000000000, z_offset = 4);
	}
	color(c = "Red") {
		channel(end = [67.2000000000, 17.4000000000], flip = true, height = 0.5000000000, start = [61.8000000000, 17.4000000000], width = 2, z_offset = 4);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [60.2000000000, 10], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [67.2000000000, 40.2000000000], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.5000000000, position = [67.2000000000, 10], radius = 1.6000000000, z_offset = 0);
	}
	color(c = "Blue") {
		label(flip = false, height = 0.5000000000, label_text = "transposer_large_f", position = [6, 1], z_offset = 0);
	}
	color(c = "Blue") {
		via(flip = false, height = 3.5000000000, position = [10, 40.2000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [61.8000000000, 17.4000000000], flip = true, height = 0.5000000000, start = [38.6000000000, 17.4000000000], width = 2, z_offset = 4);
	}
	color(c = "Red") {
		channel(end = [15.4000000000, 10], flip = true, height = 0.5000000000, start = [30.7000000000, 10], width = 2, z_offset = 4);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.5000000000, position = [10, 40.2000000000], radius = 1.6000000000, z_offset = 0);
	}
	color(c = "Blue") {
		channel(end = [67.2000000000, 40.2000000000], flip = false, height = 0.5000000000, start = [10, 40.2000000000], width = 2, z_offset = 0);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.5000000000, position = [10, 10], radius = 1.6000000000, z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.5000000000, position = [67.2000000000, 17.4000000000], radius = 1.6000000000, z_offset = 4);
	}
	color(c = "Red") {
		valve(flip = true, height = 3.0000000000, position = [46.5000000000, 40.2000000000], radius1 = 3, radius2 = 2.4000000000, z_offset = 4);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 4, position = [72.8000000000, 3], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [61.8000000000, 32.8000000000], flip = true, height = 0.5000000000, start = [38.6000000000, 32.8000000000], width = 2, z_offset = 4);
	}
	color(c = "Blue") {
		via(flip = false, height = 3.5000000000, position = [54.4000000000, 25.1000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [46.5000000000, 40.2000000000], flip = true, height = 0.5000000000, start = [15.4000000000, 40.2000000000], width = 2, z_offset = 4);
	}
	color(c = "Red") {
		valve(flip = true, height = 3.0000000000, position = [30.7000000000, 10], radius1 = 3, radius2 = 2.4000000000, z_offset = 4);
	}
}