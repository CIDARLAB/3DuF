const appRoot = "../../app/";
const should = require("should");
const Layer = require(appRoot + "core/layer");
const Feature = require(appRoot + "core/feature");
const Device = require(appRoot + "core/device");
const Parameters = require(appRoot + "core/parameters");
const FloatValue = Parameters.FloatValue;
const BooleanValue = Parameters.BooleanValue;
const StringValue = Parameters.StringValue;
const IntegerValue = Parameters.IntegerValue;
const PointValue = Parameters.PointValue;
const it = require("mocha").it;
const describe = require("mocha").describe;
const beforeEach = require("mocha").beforeEach;

const Channel = Feature.getFeatureGenerator("Channel", "Basic");
const CircleValve = Feature.getFeatureGenerator("CircleValve", "Basic");

let dev;
let lay1;
let lay2;
let feat1;
let feat2;

const initDevice = function () {
    dev = new Device(
        {
            width: 50,
            height: 60
        },
        "dev1"
    );
    lay1 = new Layer(
        {
            z_offset: 0,
            flip: false
        },
        "layer1"
    );
    lay2 = new Layer(
        {
            z_offset: 1.2,
            flip: true
        },
        "layer2"
    );
    feat1 = Channel({
        start: [0, 0],
        end: [2, 2]
    });
    feat2 = CircleValve({
        position: [3, 5]
    });
};

describe("Device", function () {
    beforeEach(function initialize() {
        initDevice();
    });
    describe("#init", function () {
        it("should start with no layers", function () {
            dev.layers.length.should.equal(0);
        });
        it("should start with the correct width, height, and name", function () {
            dev.name.getValue().should.equal("dev1");
            dev.getXSpan().should.equal(50);
            dev.getYSpan().should.equal(60);
        });
        it("should be able to be constructed without a name", function () {
            (function () {
                const dev2 = new Device({
                    width: 50,
                    height: 70
                });
            }.should.not.throwError());
        });
    });

    describe("#addLayer", function () {
        it("should let the user add a layer", function () {
            dev.addLayer(lay1);
            dev.layers.length.should.equal(1);
        });
        it("should let the user add multiple layers", function () {
            dev.addLayer(lay1);
            dev.addLayer(lay2);
            dev.layers.length.should.equal(2);
        });
        it("should place layers into the correct order", function () {
            dev.addLayer(lay2);
            dev.addLayer(lay1);
            dev.layers[0].should.be.exactly(lay1);
            dev.layers[1].should.be.exactly(lay2);
        });
    });

    describe("#toJSON", function () {
        it("can output JSON with no layers", function () {
            dev.toJSON();
        });
        it("can output JSON with one layer", function () {
            dev.addLayer(lay1);
            dev.toJSON();
        });
        it("can output JSON with two layers", function () {
            dev.addLayer(lay1);
            dev.addLayer(lay2);
            dev.toJSON();
        });
        it("can output JSON with layers which contain features", function () {
            dev.addLayer(lay1);
            lay1.addFeature(feat1);
            dev.addLayer(lay2);
            lay2.addFeature(feat2);
            dev.toJSON();
        });
    });

    describe("#fromJSON", function () {
        it("can load a device from valid JSON", function () {
            lay1.addFeature(feat1);
            lay2.addFeature(feat2);
            const json = {
                params: {
                    width: 59,
                    height: 23.5
                },
                name: "myDevice",
                layers: {
                    lay1: lay1.toJSON(),
                    lay2: lay2.toJSON()
                }
            };
            const dev2 = Device.fromJSON(json);
        });
        it("can load a Device from the output of toJSON", function () {
            dev.addLayer(lay1);
            dev.addLayer(lay2);
            lay1.addFeature(feat1);
            lay2.addFeature(feat2);
            const json = dev.toJSON();
            const dev2 = Device.fromJSON(json);
        });
        it("cannot load a device from malformed JSON", function () {
            const json = {
                params: {
                    height: {
                        type: "Float",
                        value: 23.5
                    }
                },
                name: {
                    type: "String",
                    value: "myDevice"
                },
                layers: {
                    lay1: lay1.toJSON(),
                    lay2: lay2.toJSON()
                }
            };
            let dev2;
            (function () {
                dev2 = Device.fromJSON(json);
            }.should.throwError());
        });
    });
});
