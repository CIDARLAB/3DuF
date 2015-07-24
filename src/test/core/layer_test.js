var appRoot = "../../app/";
var should = require('should');
var Layer = require(appRoot + "core/layer");
var Feature = require(appRoot + "core/feature");
var Parameters = require(appRoot + "core/parameters");

var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;
var BooleanValue = Parameters.BooleanValue;

var Features = require(appRoot + "core/features/");
var Channel = Features.Channel;
var CircleValve = Features.CircleValve;
//var Channel = require(appRoot + "core/features/channel");
//var CircleValve = require(appRoot + "core/features/circleValve");

var layerParams;
var feat1;
var feat2;
var lay1;
var lay2;

function initLayer() {
    layerParams = {
        "z_offset": {
            "type": FloatValue.typeString(),
            "value": 0.2
        },
        "flip": {
            "type": BooleanValue.typeString(),
            "value": false
        }
    };
    feat1 = new Channel({
        "start": [0,0],
        "end": [1,1]
    });
    feat2 = new CircleValve({
        "position": [5,4]
    });
    lay1 = new Layer(0, false, "layer1");
    lay2 = new Layer(1.2, true, "layer2");
}

describe("Layer", function() {
    describe("#init", function() {
        beforeEach(function initialize() {
            initLayer();
        });
        it("should start with the correct z_offset, flip, and name", function() {
            lay1.params.z_offset.value.should.equal(0);
            lay1.params.flip.value.should.equal(false);
            lay1.name.value.should.equal("layer1");

            lay2.params.z_offset.value.should.equal(1.2);
            lay2.params.flip.value.should.equal(true);
            lay2.name.value.should.equal("layer2");
        });
        it("should be able to be constructed without a name", function() {
            (function() {
                let lay3 = new Layer(1.2, true)
            }).should.not.throwError();
        });
        it("should not permit a z_offset less than 0", function() {
            (function() {
                let lay3 = new Layer(-.6, false)
            }).should.throwError();
        });
        it("should start with 0 features", function() {
            lay1.featureCount.should.equal(0);
        });
    });


    describe("#addFeature", function() {
        beforeEach(function initialize() {
            initLayer();
        });
        it("should let the user add a feature", function() {
            lay1.addFeature(feat1);
            lay1.featureCount.should.equal(1);
        });
        it("should not let a user add a feature by id", function() {
            (function() {
                lay1.addFeature("some_ID")
            }).should.throwError();
        });
        it("should let the user add multiple features", function() {
            lay1.addFeature(feat1);
            lay1.addFeature(feat2);
            lay1.featureCount.should.equal(2);
        });
    });

    describe("#__ensureIsAFeature", function() {
        beforeEach(function initialize() {
            initLayer();
        });
        it("should not error if the value is a feature", function() {
            lay1.__ensureIsAFeature(feat1);
        });
        it("Should error if the value is not a feature", function() {
            (function() {
                lay1.__ensureIsAFeature("foo")
            }).should.throwError();
            (function() {
                lay1.__ensureIsAFeature(dev1)
            }).should.throwError();
            (function() {
                lay1.__ensureIsAFeature(lay2)
            }).should.throwError();
        });
    });

    describe("#removeFeature", function() {
        beforeEach(function initialize() {
            initLayer();
        });
        it("should let the user remove a feature", function() {
            lay1.featureCount.should.equal(0);
            lay1.addFeature(feat1);
            lay1.removeFeature(feat1);
            lay1.featureCount.should.equal(0);
        });
        it("should not let the user remove a feature by ID", function() {
            lay1.addFeature(feat1);
            (function() {
                lay1.removeFeature(feat1.id)
            }).should.throwError();
        });
        it("should not let the user remove a feature when empty", function() {
            (function() {
                lay1.removeFeature(feat1)
            }).should.throwError();
        });
        it("should not let the user remove a feature that does not exist", function() {
            lay1.addFeature(feat1);
            (function() {
                lay1.removeFeature(feat2)
            }).should.throwError();
        });
    });


    describe("#containsFeature", function() {
        beforeEach(function initialize() {
            initLayer();
        });
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
                lay1.containsFeature("foo")
            }).should.throwError();
            (function() {
                lay1.containsFeature(12)
            }).should.throwError();
            (function() {
                lay1.containsFeature("featureID")
            }).should.throwError();
            (function() {
                lay1.containsFeature(dev1)
            }).should.throwError();
        });
    });

    describe("#getFeature", function() {
        beforeEach(function initialize() {
            initLayer();
        });
        it("should return a feature when passed an ID", function() {
            lay1.addFeature(feat1);
            lay1.getFeature(feat1.id).should.be.exactly(feat1);
        });
        it("should not allow the user to retrieve a feature for an ID that does not exist in the layer", function() {
            (function() {
                lay1.containsFeature(dev1)
            }).should.throwError();
        });
    });

    describe("#toJSON", function() {
        beforeEach(function initialize() {
            initLayer();
        });
        it("can produce JSON when empty", function() {
            lay1.toJSON();
        });
        it("can produce JSON when containing a feature", function() {
            lay1.addFeature(feat1);
            lay1.toJSON();
        });
        it("can produce JSON when containing multiple features", function() {
            lay1.addFeature(feat1);
            lay1.addFeature(feat2);
            lay1.toJSON();
        });
    });

    describe("#fromJSON", function() {
        beforeEach(function initialize() {
            initLayer();
        });
        it("can construct a Layer from valid JSON", function() {
            let json = {
                "name": {
                    "type": StringValue.typeString(),
                    "value": "layer3"
                },
                "params": layerParams,
                "features": {
                    "feat1": feat1.toJSON()
                }
            };

            let lay3 = Layer.fromJSON(json);
        });
        it("cannot construct a layer form invalid JSON", function() {
            let json = {
                "name": {
                    "type": StringValue.typeString(),
                    "value": "layer3"
                },
                "params": layerParams
            }
            let lay3;
            (function() {
                lay3 = Layer.fromJSON(json)
            }).should.throwError();
        });
        it("can construct a layer from the output of toJSON", function() {
            let json = lay2.toJSON();
            let lay3 = Layer.fromJSON(json);
        });
    });
});