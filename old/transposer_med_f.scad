$fn = 10;
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\standoff.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\channel.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\mold\mold.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\via.scad>


union() {
	union() {
		color(c = "Blue") {
			channel(ID = "urn:uuid:6ee171c5-0dd2-4054-a85e-d32761848f3a", end = [50.4200000000, 20], flip = false, height = 0.1000000000, start = [30, 20], type = "channel", width = 0.4100000000, z_offset = 0);
		}
		color(c = "Blue") {
			channel(ID = "urn:uuid:5a95a230-0b82-4f90-b3ba-b4ef0831c0b6", end = [50.4200000000, 31.0200000000], flip = false, height = 0.1000000000, start = [30, 31.0200000000], type = "channel", width = 0.4100000000, z_offset = 0);
		}
		color(c = "Blue") {
			channel(ID = "urn:uuid:6ebd247e-d310-433e-93d2-afd143f91a47", end = [40.2100000000, 31.0200000000], flip = false, height = 0.1000000000, start = [40.2100000000, 20], type = "channel", width = 0.4100000000, z_offset = 0);
		}
		color(c = "Blue") {
			channel(ID = "urn:uuid:54f8932d-436c-4c9d-ba46-ce63e4d1119a", end = [34.0100000000, 25.5100000000], flip = false, height = 0.1000000000, start = [34.0100000000, 20], type = "channel", width = 0.4100000000, z_offset = 0);
		}
		color(c = "Blue") {
			channel(ID = "urn:uuid:744e04b5-496a-47cf-ae15-4be205bb3744", end = [46.4100000000, 25.5100000000], flip = false, height = 0.1000000000, start = [46.4100000000, 31.0200000000], type = "channel", width = 0.4100000000, z_offset = 0);
		}
		color(c = "Blue") {
			via(ID = "urn:uuid:1ee04679-ab4a-4823-ab27-f6e7f7be474c", flip = false, height = 1.1000000000, position = [34.0100000000, 25.5100000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
		}
		color(c = "Blue") {
			via(ID = "urn:uuid:e73c4e74-fd06-445b-bc85-7ac0113cf5f0", flip = false, height = 1.1000000000, position = [46.4100000000, 25.5100000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
		}
		color(c = "Blue") {
			via(ID = "urn:uuid:55d4631e-5790-4b85-afa7-87aeed059ab6", flip = false, height = 1.1000000000, position = [30, 20], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
		}
		color(c = "Blue") {
			via(ID = "urn:uuid:399fbb39-adbf-47d7-b361-eac4f6c96972", flip = false, height = 1.1000000000, position = [30, 31.0200000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
		}
		color(c = "Blue") {
			via(ID = "urn:uuid:3a7248a6-7507-40e1-ab94-0921860ebc1f", flip = false, height = 1.1000000000, position = [50.4200000000, 20], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
		}
		color(c = "Blue") {
			via(ID = "urn:uuid:37ded618-53a2-4af3-8744-f2bff0859aa2", flip = false, height = 1.1000000000, position = [50.4200000000, 31.0200000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
		}
		color(c = "Blue") {
			standoff(ID = "urn:uuid:83af727e-9d0a-4f8d-8daf-742e71374516", flip = false, height = 1.2000000000, position = [3, 3], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
		}
		color(c = "Blue") {
			standoff(ID = "urn:uuid:512c18a8-8477-430b-9710-4bbe3eeccbe9", flip = false, height = 1.2000000000, position = [72.8000000000, 3], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
		}
		color(c = "Blue") {
			standoff(ID = "urn:uuid:236c1b47-b321-4dee-96e1-ae3ae960e2a5", flip = false, height = 1.2000000000, position = [72.8000000000, 48], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
		}
		color(c = "Blue") {
			standoff(ID = "urn:uuid:79945341-5511-49bc-b71a-ad2ee361fe82", flip = false, height = 1.2000000000, position = [3, 48], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
		}
	}
	preset_mold(height = 51, width = 75.8000000000);
}