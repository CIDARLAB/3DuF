$fn = 10;
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\valve.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\port.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\via.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\channel.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\features\standoff.scad>
use <C:\Users\Obdurate_2\Documents\GitHub\3DuF\old\SCAD\mold\mold.scad>


union() {
	preset_mold(height = 51, width = 75.8000000000);
	color(c = "Red") {
		port(ID = "urn:uuid:29ed20d9-1f84-458c-abdb-24e49af2496a", flip = true, height = 0.1000000000, position = [30, 31.0200000000], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:dd03183f-d95e-49a8-aa99-5dacf9445a4e", end = [31.4050000000, 31.0200000000], flip = true, height = 0.1000000000, start = [31.4050000000, 20], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		channel(ID = "urn:uuid:5a95a230-0b82-4f90-b3ba-b4ef0831c0b6", end = [50.4200000000, 31.0200000000], flip = false, height = 0.1000000000, start = [30, 31.0200000000], type = "channel", width = 0.4100000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:2e011256-6ae8-4719-b662-a8c26c4dc063", end = [47.9200000000, 20], flip = true, height = 0.1000000000, start = [31.4050000000, 20], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		via(ID = "urn:uuid:55d4631e-5790-4b85-afa7-87aeed059ab6", flip = false, height = 1.1000000000, position = [30, 20], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
	}
	color(c = "Red") {
		valve(ID = "urn:uuid:bb6f2874-774f-43f4-a571-95181f92e7c8", flip = true, height = 0.9000000000, position = [34.0100000000, 22.6050000000], radius1 = 1.4000000000, radius2 = 1.2000000000, type = "valve", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(ID = "urn:uuid:8f35e085-fe04-4cd5-9dff-8b16572a8350", flip = true, height = 0.9000000000, position = [40.2100000000, 28.4150000000], radius1 = 1.4000000000, radius2 = 1.2000000000, type = "valve", z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		standoff(ID = "urn:uuid:83af727e-9d0a-4f8d-8daf-742e71374516", flip = false, height = 1.2000000000, position = [3, 3], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
	}
	color(c = "Red") {
		valve(ID = "urn:uuid:9eee3b20-dd44-4395-9d5a-a5d8f901770a", flip = true, height = 0.9000000000, position = [40.2100000000, 22.6050000000], radius1 = 1.4000000000, radius2 = 1.2000000000, type = "valve", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(ID = "urn:uuid:4d1a8640-5a68-4284-ae81-6070af752c53", flip = true, height = 0.1000000000, position = [50.4200000000, 31.0200000000], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		via(ID = "urn:uuid:399fbb39-adbf-47d7-b361-eac4f6c96972", flip = false, height = 1.1000000000, position = [30, 31.0200000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:5c2ca7a2-5e0f-4666-b482-766adbc52611", end = [49.0150000000, 28.4150000000], flip = true, height = 0.1000000000, start = [49.0150000000, 22.6050000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		standoff(ID = "urn:uuid:79945341-5511-49bc-b71a-ad2ee361fe82", flip = false, height = 1.2000000000, position = [3, 48], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
	}
	color(c = "Blue") {
		channel(ID = "urn:uuid:6ebd247e-d310-433e-93d2-afd143f91a47", end = [40.2100000000, 31.0200000000], flip = false, height = 0.1000000000, start = [40.2100000000, 20], type = "channel", width = 0.4100000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:dcd91469-cc96-4b15-878c-372404416222", end = [43.3100000000, 31.0200000000], flip = true, height = 0.1000000000, start = [31.4050000000, 31.0200000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(ID = "urn:uuid:f2d1caa6-7b35-4c03-99ab-cc8566503bcc", flip = true, height = 0.1000000000, position = [46.4100000000, 25.5100000000], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(ID = "urn:uuid:d5bed4b6-b964-4412-a60b-5a3941d7450f", flip = true, height = 0.1000000000, position = [50.4200000000, 22.6050000000], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:7fb7684f-f260-4ff0-ac14-d53c2f631e3b", end = [49.0150000000, 28.4150000000], flip = true, height = 0.1000000000, start = [40.2100000000, 28.4150000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(ID = "urn:uuid:8caa035d-5f4d-46ef-8655-078bf71f72ea", flip = true, height = 0.1000000000, position = [30, 20], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:90f51210-fce9-4e37-ba31-3eb313e78674", end = [49.0150000000, 22.6050000000], flip = true, height = 0.1000000000, start = [40.2100000000, 22.6050000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		via(ID = "urn:uuid:1ee04679-ab4a-4823-ab27-f6e7f7be474c", flip = false, height = 1.1000000000, position = [34.0100000000, 25.5100000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
	}
	color(c = "Red") {
		valve(ID = "urn:uuid:131af5d6-95d9-4549-bf28-404648f451a3", flip = true, height = 0.9000000000, position = [46.4100000000, 28.4150000000], radius1 = 1.4000000000, radius2 = 1.2000000000, type = "valve", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(ID = "urn:uuid:c3551c66-9f93-444a-95d7-a725c0997b2e", flip = true, height = 0.1000000000, position = [47.9200000000, 20], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(ID = "urn:uuid:214ab1a4-5856-4ec9-8482-fa180a797576", flip = true, height = 0.1000000000, position = [34.0100000000, 25.5100000000], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:6a27dc29-47e3-488a-9338-adabf1cfa22a", end = [34.0100000000, 22.6050000000], flip = true, height = 0.1000000000, start = [40.2100000000, 22.6050000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		standoff(ID = "urn:uuid:236c1b47-b321-4dee-96e1-ae3ae960e2a5", flip = false, height = 1.2000000000, position = [72.8000000000, 48], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
	}
	color(c = "Blue") {
		via(ID = "urn:uuid:e73c4e74-fd06-445b-bc85-7ac0113cf5f0", flip = false, height = 1.1000000000, position = [46.4100000000, 25.5100000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
	}
	color(c = "Blue") {
		via(ID = "urn:uuid:37ded618-53a2-4af3-8744-f2bff0859aa2", flip = false, height = 1.1000000000, position = [50.4200000000, 31.0200000000], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
	}
	color(c = "Blue") {
		via(ID = "urn:uuid:3a7248a6-7507-40e1-ab94-0921860ebc1f", flip = false, height = 1.1000000000, position = [50.4200000000, 20], radius1 = 0.8000000000, radius2 = 0.7000000000, type = "via", z_offset = 0);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:211284f9-dc76-4e25-9f20-9efa2732fd7c", end = [46.4100000000, 25.5100000000], flip = true, height = 0.1000000000, start = [34.0100000000, 25.5100000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:99324c93-52e0-4193-b6f8-60f1c0b58bf5", end = [31.4050000000, 20], flip = true, height = 0.1000000000, start = [37.1100000000, 20], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		port(ID = "urn:uuid:8573dfc7-f941-4c14-8960-0fe65f4f6d1e", flip = true, height = 0.1000000000, position = [50.4200000000, 20], radius = 0.7000000000, type = "port", z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(ID = "urn:uuid:16cfa2d4-4ea2-4dee-9460-e0b4e0ab56cf", flip = true, height = 0.9000000000, position = [43.3100000000, 31.0200000000], radius1 = 1.4000000000, radius2 = 1.2000000000, type = "valve", z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		channel(ID = "urn:uuid:6ee171c5-0dd2-4054-a85e-d32761848f3a", end = [50.4200000000, 20], flip = false, height = 0.1000000000, start = [30, 20], type = "channel", width = 0.4100000000, z_offset = 0);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:ad09018f-3906-4649-bf45-defead8d2970", end = [46.4100000000, 28.4150000000], flip = true, height = 0.1000000000, start = [40.2100000000, 28.4150000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Blue") {
		channel(ID = "urn:uuid:744e04b5-496a-47cf-ae15-4be205bb3744", end = [46.4100000000, 25.5100000000], flip = false, height = 0.1000000000, start = [46.4100000000, 31.0200000000], type = "channel", width = 0.4100000000, z_offset = 0);
	}
	color(c = "Blue") {
		channel(ID = "urn:uuid:54f8932d-436c-4c9d-ba46-ce63e4d1119a", end = [34.0100000000, 25.5100000000], flip = false, height = 0.1000000000, start = [34.0100000000, 20], type = "channel", width = 0.4100000000, z_offset = 0);
	}
	color(c = "Blue") {
		standoff(ID = "urn:uuid:512c18a8-8477-430b-9710-4bbe3eeccbe9", flip = false, height = 1.2000000000, position = [72.8000000000, 3], radius1 = 1.2000000000, radius2 = 1.2000000000, type = "standoff", z_offset = 0);
	}
	color(c = "Red") {
		channel(ID = "urn:uuid:8ae71927-41c4-4f48-8fd4-7876b7995291", end = [50.4200000000, 22.6050000000], flip = true, height = 0.1000000000, start = [49.0150000000, 22.6050000000], type = "channel", width = 0.4100000000, z_offset = 1.2000000000);
	}
	color(c = "Red") {
		valve(ID = "urn:uuid:cb79bbbc-20a6-41b3-b888-f01e33b78d48", flip = true, height = 0.9000000000, position = [37.1100000000, 20], radius1 = 1.4000000000, radius2 = 1.2000000000, type = "valve", z_offset = 1.2000000000);
	}
}