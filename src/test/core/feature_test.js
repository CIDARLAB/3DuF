var appRoot = "../../app/";
var should = require("should");
var Feature = require(appRoot + "core/feature");
var Parameters = require(appRoot + "core/parameters");
//var Features = require(appRoot + "core/features");

var FloatValue = Parameters.FloatValue;
var IntegerValue = Parameters.IntegerValue;

var CircleValve = Feature.getFeatureGenerator("CircleValve", "Basic");
var Port = Feature.getFeatureGenerator("Port", "Basic");

var feat1;
var feat2;

function initFeatures() {
    feat1 = new Port({
        position: [0, 0]
    });
    feat2 = new CircleValve({
        position: [5, 15]
    });
}

describe("Feature", function() {
    beforeEach(function initialize() {
        initFeatures();
    });
    describe("#init", function() {
        it("should be given a unique ID on initialization", function() {
            feat1.getID().should.not.equal(feat2.getID());
        });
    });
    describe("#updateParameter", function() {
        it("should allow a parameter to be updated to a valid value", function() {
            feat2.updateParameter("position", [13, 25]);
        });
        it("should allow a parameter to be updated if a heritable value is missing", function() {
            feat1.updateParameter("radius1", 13);
        });
        it("should not allow a heritable parameter to be set to an invalid value", function() {
            (function() {
                feat1.updateParameter("radius1", [0, 0]);
            }.should.throwError());
        });
        it("should not allow a parameter to be updated to an invalid value", function() {
            (function() {
                feat1.updateParameter("radius1", "foobar");
            }.should.throwError());
            (function() {
                feat2.updateParameter("position", 5);
            }.should.throwError());
        });
        it("should not allow updates to parameters that do not exist", function() {
            (function() {
                feat1.updateParameter("wrongParamKey", 27);
            }.should.throwError());
            (function() {
                feat2.updateParameter(56, 25);
            }.should.throwError());
        });
    });
    describe("#toJSON", function() {
        it("can produce JSON when containing multiple parameters", function() {
            let json = feat1.toJSON();
            feat2.toJSON();
        });
    });

    describe("#fromJSON", function() {
        it("can produce a Feature from valid JSON", function() {
            let json = {
                id: "someValue",
                type: "CircleValve",
                params: {
                    position: [0, 0],
                    height: 3
                },
                name: "foobar"
            };
            let feat3 = Feature.fromJSON(json);
        });
        it("can produce a Feature from the output of toJSON", function() {
            let json = feat2.toJSON();
            let feat3 = Feature.fromJSON(json);
        });
        it("cannot produce a Feature from invalid JSON", function() {
            let json = {
                params: {
                    width: {
                        type: "Float",
                        value: 5.1
                    },
                    height: {
                        type: "Integer",
                        value: 3
                    }
                }
            };
            let feat;
            (function() {
                feat = Feature.fromJSON(json);
            }.should.throwError());
        });
    });
});
