$fn = 10;
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\renderer\SCAD\features\port.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\renderer\SCAD\features\label.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\renderer\SCAD\features\standoff.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\renderer\SCAD\features\channel.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\renderer\SCAD\features\via.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\renderer\SCAD\mold\mold.scad>
use <C:\Users\Aaron Heuckroth\Documents\GitHub\3DuF\src\renderer\SCAD\features\valve.scad>


union() {
	preset_mold(height = 550, width = 700);
	color(c = "blue") {
		label(flip = false, height = 1, label_text = "foobarbaz", position = [50, 200], z_offset = 0);
	}
	color(c = "blue") {
		via(flip = false, height = 1, position = [100, 50], radius1 = 20, radius2 = 10, z_offset = 0);
	}
	color(c = "blue") {
		valve(flip = false, height = 1, position = [300, 200], radius1 = 30, radius2 = 15, z_offset = 0);
	}
	color(c = "blue") {
		standoff(flip = false, height = 1, position = [500, 300], radius1 = 30, radius2 = 15, z_offset = 0);
	}
	color(c = "blue") {
		channel(end = [60, 20], flip = false, height = 1, start = [10, 20], width = 10, z_offset = 0);
	}
	color(c = "blue") {
		port(flip = false, height = 1, position = [400, 400], radius = 15, z_offset = 0);
	}
}