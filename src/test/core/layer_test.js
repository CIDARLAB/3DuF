var appRoot = "../../app/";
var should = require("should");
var Layer = require(appRoot + "core/layer");
var Feature = require(appRoot + "core/feature");
var Parameters = require(appRoot + "core/parameters");

var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;
var BooleanValue = Parameters.BooleanValue;

//var Features = require(appRoot + "core/features");
var Channel = Feature.getFeatureGenerator("Channel", "Basic");
var CircleValve = Feature.getFeatureGenerator("CircleValve", "Basic");
//var Channel = require(appRoot + "core/features/channel");
//var CircleValve = require(appRoot + "core/features/circleValve");

var layerParams;
var feat1;
var feat2;
var lay1;
var lay2;

function initLayer() {
    layerParams = {
        z_offset: 0,
        flip: false
    };
    feat1 = new Channel({
        start: [0, 0],
        end: [1, 1]
    });
    feat2 = new CircleValve({
        position: [5, 4]
    });
    lay1 = new Layer(layerParams, "layer1");
    lay2 = new Layer(
        {
            z_offset: 1.2,
            flip: true
        },
        "layer2"
    );
}

describe("Layer", function() {
    beforeEach(function initialize() {
        initLayer();
    });
    describe("#init", function() {
        it("should start with the correct z_offset, flip, and name", function() {
            lay1.params.getValue("z_offset").should.equal(0);
            lay1.params.getValue("flip").should.equal(false);
            lay1.name.getValue().should.equal("layer1");

            lay2.params.getValue("z_offset").should.equal(1.2);
            lay2.params.getValue("flip").should.equal(true);
            lay2.name.getValue().should.equal("layer2");
        });
        it("should be able to be constructed without a name", function() {
            (function() {
                let lay3 = new Layer({
                    z_offset: 1.2,
                    flip: true
                });
            }.should.not.throwError());
        });
        it("should not permit a z_offset less than 0", function() {
            (function() {
                let lay3 = new Layer(-0.6, false);
            }.should.throwError());
        });
        it("should start with 0 features", function() {
            lay1.featureCount.should.equal(0);
        });
    });

    describe("#addFeature", function() {
        it("should let the user add a feature", function() {
            lay1.addFeature(feat1);
            lay1.featureCount.should.equal(1);
        });
        it("should not let a user add a feature by id", function() {
            (function() {
                lay1.addFeature("some_ID");
            }.should.throwError());
        });
        it("should let the user add multiple features", function() {
            lay1.addFeature(feat1);
            lay1.addFeature(feat2);
            lay1.featureCount.should.equal(2);
        });
    });

    describe("#__ensureIsAFeature", function() {
        it("should not error if the value is a feature", function() {
            lay1.__ensureIsAFeature(feat1);
        });
        it("Should error if the value is not a feature", function() {
            (function() {
                lay1.__ensureIsAFeature("foo");
            }.should.throwError());
            (function() {
                lay1.__ensureIsAFeature(dev1);
            }.should.throwError());
            (function() {
                lay1.__ensureIsAFeature(lay2);
            }.should.throwError());
        });
    });

    describe("#removeFeature", function() {
        it("should let the user remove a feature", function() {
            lay1.featureCount.should.equal(0);
            lay1.addFeature(feat1);
            lay1.removeFeature(feat1);
            lay1.featureCount.should.equal(0);
        });
        it("should not let the user remove a feature by ID", function() {
            lay1.addFeature(feat1);
            (function() {
                lay1.removeFeature(feat1.getID());
            }.should.throwError());
        });
        it("should not let the user remove a feature when empty", function() {
            (function() {
                lay1.removeFeature(feat1);
            }.should.throwError());
        });
        it("should not let the user remove a feature that does not exist", function() {
            lay1.addFeature(feat1);
            (function() {
                lay1.removeFeature(feat2);
            }.should.throwError());
        });
    });

    describe("#containsFeature", function() {
        it("should return true if the feature exists in the layer", function() {
            lay1.addFeature(feat1);
            lay1.containsFeature(feat1).should.equal(true);
            lay1.addFeature(feat2);
            lay1.containsFeature(feat2).should.equal(true);
        });
        it("should return false if the feature does not exist in the layer", function() {
            lay1.containsFeature(feat1).should.equal(false);
            lay1.addFeature(feat1);
            lay1.containsFeature(feat2).should.equal(false);
        });
        it("should return true after a feature has been added", function() {
            lay1.containsFeature(feat1).should.equal(false);
            lay1.addFeature(feat1);
            lay1.containsFeature(feat1).should.equal(true);
        });
        it("should not allow the user to check for the presence of something other than a feature", function() {
            (function() {
                lay1.containsFeature("foo");
            }.should.throwError());
            (function() {
                lay1.containsFeature(12);
            }.should.throwError());
            (function() {
                lay1.containsFeature("featureID");
            }.should.throwError());
            (function() {
                lay1.containsFeature(dev1);
            }.should.throwError());
        });
    });

    describe("#getFeature", function() {
        it("should return a feature when passed an ID", function() {
            lay1.addFeature(feat1);
            lay1.getFeature(feat1.getID()).should.be.exactly(feat1);
        });
        it("should not allow the user to retrieve a feature for an ID that does not exist in the layer", function() {
            (function() {
                lay1.containsFeature(dev1);
            }.should.throwError());
        });
    });

    describe("#toJSON", function() {
        it("can produce JSON when empty", function() {
            lay1.toJSON();
        });
        it("can produce JSON when containing a feature", function() {
            lay1.addFeature(feat1);
            let json = lay1.toJSON();
            json["features"][feat1.getID()]["id"].should.equal(feat1.getID());
        });
        it("can produce JSON when containing multiple features", function() {
            lay1.addFeature(feat1);
            lay1.addFeature(feat2);
            lay1.toJSON();
        });
    });

    describe("#fromJSON", function() {
        it("can construct a Layer from valid JSON", function() {
            let json = {
                name: "layer3",
                params: layerParams,
                features: {
                    feat1: feat1.toJSON()
                }
            };

            let lay3 = Layer.fromJSON(json);
        });
        it("cannot construct a layer form invalid JSON", function() {
            let json = {
                name: {
                    type: "String",
                    value: "layer3"
                },
                params: layerParams
            };
            let lay3;
            (function() {
                lay3 = Layer.fromJSON(json);
            }.should.throwError());
        });
        it("can construct a layer from the output of toJSON", function() {
            let json = lay2.toJSON();
            let lay3 = Layer.fromJSON(json);
        });
    });
});
