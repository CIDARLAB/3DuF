$fn = 50;
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\src\SCAD\mold\mold.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\src\SCAD\features\port.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\src\SCAD\features\channel.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\src\SCAD\features\via.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\src\SCAD\features\standoff.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\src\SCAD\features\valve.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\src\SCAD\features\label.scad>


union() {
	preset_mold(height = 51, width = 75.8000000000);
	color(c = "Red") {
		valve(flip = true, height = 0.9000000000, position = [39.0000000000, 22.3000000000], radius1 = 1.2000000000, radius2 = 1, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.1000000000, position = [48.0000000000, 20], radius = 0.5000000000, z_offset = 0);
	}
	color(c = "Blue") {
		channel(end = [44.6000000000, 24.7000000000], flip = false, height = 0.1000000000, start = [44.6000000000, 29.4000000000], width = 0.2000000000, z_offset = 0);
	}
	color(c = "Blue") {
		channel(end = [39.0000000000, 29.4000000000], flip = false, height = 0.1000000000, start = [39.0000000000, 20], width = 0.2000000000, z_offset = 0);
	}
	color(c = "Blue") {
		channel(end = [48.0000000000, 20], flip = false, height = 0.1000000000, start = [30, 20], width = 0.2000000000, z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [48.0000000000, 20], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.1000000000, position = [48.0000000000, 29.4000000000], radius = 0.5000000000, z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [44.6000000000, 24.7000000000], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(flip = true, height = 0.9000000000, position = [44.6000000000, 27.1000000000], radius1 = 1.2000000000, radius2 = 1, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(end = [46.9000000000, 27.1000000000], flip = true, height = 0.1000000000, start = [46.9000000000, 22.3000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.1000000000, position = [30, 20], radius = 0.5000000000, z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [48.0000000000, 29.4000000000], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(end = [45.9000000000, 20], flip = true, height = 0.1000000000, start = [31.1000000000, 20], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(flip = true, height = 0.9000000000, position = [33.4000000000, 22.3000000000], radius1 = 1.2000000000, radius2 = 1, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(flip = true, height = 0.9000000000, position = [39.0000000000, 27.1000000000], radius1 = 1.2000000000, radius2 = 1, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(end = [44.6000000000, 24.7000000000], flip = true, height = 0.1000000000, start = [33.4000000000, 24.7000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 1.2000000000, position = [72.8000000000, 3], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [33.4000000000, 22.3000000000], flip = true, height = 0.1000000000, start = [39.0000000000, 22.3000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(end = [44.6000000000, 27.1000000000], flip = true, height = 0.1000000000, start = [39.0000000000, 27.1000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		via(flip = false, height = 1.1000000000, position = [48.0000000000, 29.4000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [31.1000000000, 29.4000000000], flip = true, height = 0.1000000000, start = [31.1000000000, 20], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(flip = true, height = 0.9000000000, position = [41.8000000000, 29.4000000000], radius1 = 1.2000000000, radius2 = 1, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(end = [31.1000000000, 20], flip = true, height = 0.1000000000, start = [36.2000000000, 20], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		channel(end = [48.0000000000, 29.4000000000], flip = false, height = 0.1000000000, start = [30, 29.4000000000], width = 0.2000000000, z_offset = 0);
	}
	color(c = "Blue") {
		via(flip = false, height = 1.1000000000, position = [30, 29.4000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	}
	color(c = "Blue") {
		label(flip = false, height = 0.1000000000, label_text = "VT_SMALL_f", position = [6, 1], z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [48.0000000000, 22.3000000000], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [45.9000000000, 20], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		label(flip = true, height = 0.1000000000, label_text = "VT_SMALL_c", position = [6, 45], z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(flip = true, height = 0.9000000000, position = [36.2000000000, 20], radius1 = 1.2000000000, radius2 = 1, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		port(flip = false, height = 0.1000000000, position = [30, 29.4000000000], radius = 0.5000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [46.9000000000, 27.1000000000], flip = true, height = 0.1000000000, start = [39.0000000000, 27.1000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(end = [48.0000000000, 22.3000000000], flip = true, height = 0.1000000000, start = [46.9000000000, 22.3000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [30, 20], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		via(flip = false, height = 1.1000000000, position = [33.4000000000, 24.7000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [41.8000000000, 29.4000000000], flip = true, height = 0.1000000000, start = [31.1000000000, 29.4000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		via(flip = false, height = 1.1000000000, position = [48.0000000000, 20], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 1.2000000000, position = [3, 48], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	}
	color(c = "Blue") {
		via(flip = false, height = 1.1000000000, position = [30, 20], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(end = [46.9000000000, 22.3000000000], flip = true, height = 0.1000000000, start = [39.0000000000, 22.3000000000], width = 0.2000000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [33.4000000000, 24.7000000000], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		channel(end = [33.4000000000, 24.7000000000], flip = false, height = 0.1000000000, start = [33.4000000000, 20], width = 0.2000000000, z_offset = 0);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 1.2000000000, position = [3, 3], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	}
	color(c = "Red") {
		port(flip = true, height = 0.1000000000, position = [30, 29.4000000000], radius = 0.5000000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		via(flip = false, height = 1.1000000000, position = [44.6000000000, 24.7000000000], radius1 = 0.6000000000, radius2 = 0.5000000000, z_offset = 0);
	}
	color(c = "Blue") {
		standoff(flip = false, height = 1.2000000000, position = [72.8000000000, 48], radius1 = 1.2000000000, radius2 = 1, z_offset = 0);
	}
}