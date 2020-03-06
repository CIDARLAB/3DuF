var should = require("should");
var appRoot = "../../app/";
var Feature = require("../../app/core/feature");
var Device = require(appRoot + "/core/device");
var Layer = require(appRoot + "/core/layer");
//var Features = require(appRoot + '/core/features');

var Channel = Feature.getFeatureGenerator("Channel", "Basic");
var CircleValve = Feature.getFeatureGenerator("CircleValve", "Basic");

describe("Integration", function() {
    describe("#core", function() {
        it("Create a device, add layers and features, toJSON, fromJSON", function() {
            let dev = new Device(
                {
                    width: 60,
                    height: 30
                },
                "My Device"
            );
            let flow = new Layer(
                {
                    z_offset: 0,
                    flip: false
                },
                "flow"
            );
            let control = new Layer(
                {
                    z_offset: 1.2,
                    flip: true
                },
                "control"
            );
            dev.addLayer(flow);
            dev.addLayer(control);
            let chan1 = new Channel({
                start: [0, 0],
                end: [10, 10]
            });
            console.log(chan1);
            flow.addFeature(chan1);
            let valve1 = new CircleValve({
                position: [5, 5]
            });
            control.addFeature(valve1);
            let devJSON = dev.toJSON();
            let newDev = Device.fromJSON(devJSON);
        });
    });
});
