const should = require("should");
const appRoot = "../../app/";
const Feature = require("../../app/core/feature");
const Device = require(appRoot + "/core/device");
const Layer = require(appRoot + "/core/layer");
// var Features = require(appRoot + '/core/features');
const it = require("mocha").it;
const describe = require("mocha").describe;

const Channel = Feature.getFeatureGenerator("Channel", "Basic");
const CircleValve = Feature.getFeatureGenerator("CircleValve", "Basic");

describe("Integration", function() {
    describe("#core", function() {
        it("Create a device, add layers and features, toJSON, fromJSON", function() {
            const dev = new Device(
                {
                    width: 60,
                    height: 30
                },
                "My Device"
            );
            const flow = new Layer(
                {
                    z_offset: 0,
                    flip: false
                },
                "flow"
            );
            const control = new Layer(
                {
                    z_offset: 1.2,
                    flip: true
                },
                "control"
            );
            dev.addLayer(flow);
            dev.addLayer(control);
            const chan1 = new Channel({
                start: [0, 0],
                end: [10, 10]
            });
            console.log(chan1);
            flow.addFeature(chan1);
            const valve1 = new CircleValve({
                position: [5, 5]
            });
            control.addFeature(valve1);
            const devJSON = dev.toJSON();
            const newDev = Device.fromJSON(devJSON);
        });
    });
});
