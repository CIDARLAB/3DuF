var should = require("should");
var device = require('../app/core/device')
var Device = device.Device;
var Layer = device.Layer;
var Channel = require('../app/core/channel').Channel;
var CircleValve = require('../app/core/circleValve').CircleValve;

describe("Integration", function(){
	describe("#core", function(){
		it("Create a device, add layers and features, export, import", function(){
			let dev = new Device(60, 30, "My Device");
			let flow = new Layer(0, false, "flow");
			let control = new Layer(1.2, true, "control");
			dev.addLayer(flow);
			dev.addLayer(control);
			let chan1 = new Channel({
				"start": [0,0],
				"end": [10,10]
			});
			flow.addFeature(chan1);
			let valve1 = new CircleValve({
				"position": [5,5]
			});
			control.addFeature(valve1);
			let devJSON = dev.toJSON();
			let newDev = Device.fromJSON(devJSON);
		});
	});
});