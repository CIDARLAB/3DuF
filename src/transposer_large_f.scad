$fn = 10;
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\label.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\via.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\port.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\mold\mold.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\standoff.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\SCAD\features\channel.scad>


union() {
	union() {
		color(c = "Blue") {
			channel(end = [67.2000000000, 10], flip = false, height = 0.5000000000, start = [10, 10], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [67.2000000000, 10], flip = false, height = 0.5000000000, start = [10, 10], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [67.2000000000, 40.2000000000], flip = false, height = 0.5000000000, start = [10, 40.2000000000], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [67.2000000000, 40.2000000000], flip = false, height = 0.5000000000, start = [10, 40.2000000000], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [38.6000000000, 40.2000000000], flip = false, height = 0.5000000000, start = [38.6000000000, 10], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [38.6000000000, 40.2000000000], flip = false, height = 0.5000000000, start = [38.6000000000, 10], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [22.8000000000, 25.1000000000], flip = false, height = 0.5000000000, start = [22.8000000000, 10], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [22.8000000000, 25.1000000000], flip = false, height = 0.5000000000, start = [22.8000000000, 10], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [54.4000000000, 25.1000000000], flip = false, height = 0.5000000000, start = [54.4000000000, 40.2000000000], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			channel(end = [54.4000000000, 25.1000000000], flip = false, height = 0.5000000000, start = [54.4000000000, 40.2000000000], width = 2, z_offset = 0);
		}
		color(c = "Blue") {
			port(flip = false, height = 0.5000000000, position = [10, 10], radius = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			port(flip = false, height = 0.5000000000, position = [10, 40.2000000000], radius = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			port(flip = false, height = 0.5000000000, position = [67.2000000000, 10], radius = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			port(flip = false, height = 0.5000000000, position = [67.2000000000, 40.2000000000], radius = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			via(flip = false, height = 3.5000000000, position = [22.8000000000, 25.1000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			via(flip = false, height = 3.5000000000, position = [54.4000000000, 25.1000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			via(flip = false, height = 3.5000000000, position = [10, 10], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			via(flip = false, height = 3.5000000000, position = [10, 40.2000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			via(flip = false, height = 3.5000000000, position = [67.2000000000, 10], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			via(flip = false, height = 3.5000000000, position = [67.2000000000, 40.2000000000], radius1 = 2, radius2 = 1.6000000000, z_offset = 0);
		}
		color(c = "Blue") {
			label(flip = false, height = 0.5000000000, label_text = "transposer_large_f", position = [6, 1], z_offset = 0);
		}
		color(c = "Blue") {
			standoff(flip = false, height = 4, position = [3, 3], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
		}
		color(c = "Blue") {
			standoff(flip = false, height = 4, position = [72.8000000000, 3], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
		}
		color(c = "Blue") {
			standoff(flip = false, height = 4, position = [72.8000000000, 48], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
		}
		color(c = "Blue") {
			standoff(flip = false, height = 4, position = [3, 48], radius1 = 3, radius2 = 2.4000000000, z_offset = 0);
		}
	}
	preset_mold(height = 51, width = 75.8000000000);
}