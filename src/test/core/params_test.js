var appRoot = "../../app/";
var should = require("should");
var Parameters = require(appRoot + "core/parameters");
var Parameter = require(appRoot + "core/parameter");
var Feature = require("../../app/core/feature");
//var Features = require(appRoot + "core/features");
var Params = require(appRoot + "core/params");

var Channel = Feature.getFeatureGenerator("Channel", "Basic");

var FloatValue = Parameters.FloatValue;
var IntegerValue = Parameters.IntegerValue;
var PointValue = Parameters.PointValue;
var BooleanValue = Parameters.BooleanValue;
var StringValue = Parameters.StringValue;

var values;
var unique;
var heritable;
var params;

function initValues() {
    values = {
        flo: 12.3,
        int: 13,
        poi: [0, 0],
        boo: true,
        str: "foobar"
    };
    unique = {
        flo: "Float",
        int: "Integer"
    };
    heritable = {
        poi: "Point",
        boo: "Boolean",
        str: "String"
    };
    params = new Params(values, unique, heritable);
}

describe("Params", function() {
    beforeEach(function() {
        initValues();
    });
    describe("#init", function() {
        it("can be initialized with known-good values and types", function() {
            let params = new Params(values, unique, heritable);
            params.getValue("flo").should.be.approximately(12.3, 0.0001);
            params.getValue("str").should.equal("foobar");
            params
                .getParameter("boo")
                .getType()
                .should.equal("Boolean");
        });
        it("cannot be initialized if unique values are missing", function() {
            delete values["flo"];
            (function() {
                let params = new Params(values, unique, heritable);
            }.should.throwError());
        });
        it("cannot be initialized if a value is of the wrong type", function() {
            values["flo"] = [0, 0];
            (function() {
                let params = new Params(values, unique, heritable);
            }.should.throwError());
            values["flo"] = 12.3;
            values["boo"] = 24;
            (function() {
                let params = new Params(values, unique, heritable);
            }.should.throwError());
        });
    });

    describe("#updateParameter", function() {
        it("should allow an existing parameter to be updated to a valid value", function() {
            params.updateParameter("flo", 13.7);
            params.getValue("flo").should.be.approximately(13.7, 0.0001);
            params.updateParameter("boo", false);
            params.getValue("boo").should.equal(false);
        });
        it("should allow a missing heritable parameter to be updated to a valid value", function() {
            delete values["poi"];
            params = new Params(values, unique, heritable);
            params.updateParameter("poi", [0, 17]);
            params
                .getParameter("poi")
                .getType()
                .should.equal("Point");
            params.getValue("poi")[1].should.equal(17);
        });
        it("should not allow a parameter to be updated to an invalid value", function() {
            (function() {
                params.updateParameter("flo", "foobar");
            }.should.throwError());
            (function() {
                params.updateParameter("boo", 17);
            }.should.throwError());
        });
        it("should not allow a parameter to be updated if it does not exist", function() {
            (function() {
                params.updateParameter("watermelon");
            }.should.throwError());
            (function() {
                params.updateParameter(264);
            }.should.throwError());
        });
        it("should not allow a heritable parameter to be set to an invalid value", function() {
            delete values["poi"];
            params = new Params(values, unique, heritable);
            (function() {
                params.updateParameter("poi", 23);
            }.should.throwError());
        });
    });

    describe("#getParameter", function() {
        it("should return the correct parameter when given a valid key", function() {
            let p = params.getParameter("boo");
            (p instanceof Parameter).should.equal(true);
            p.getValue().should.equal(true);
            p.getType().should.equal("Boolean");
        });
        it("should throw an error for an invalid key", function() {
            (function() {
                let p = params.getParameter("invalidKey");
            }.should.throwError());
        });
    });

    describe("#toJSON", function() {
        it("can produce JSON without errors", function() {
            let json = params.toJSON();
            json["flo"].should.be.approximately(12.3, 0.0001);
            json["str"].should.equal("foobar");
        });
    });

    describe("#fromJSON", function() {
        it("should convert valid JSON to a Params object of the correct type", function() {
            let json = values; // they happen to be the same structure!
            let params = Params.fromJSON(json, unique, heritable);
            params.getValue("boo").should.equal(true);
            params
                .getParameter("str")
                .getType()
                .should.equal("String");
        });
        it("should not allow fromJSON to be called without unique and heritable types", function() {
            (function() {
                let params = new Params(values, unique);
            }.should.throwError());
            (function() {
                let params = new Params(values, heritable);
            }.should.throwError());
            (function() {
                let params = new Params(values);
            }.should.throwError());
        });

        it("should be able to re-create a Params object from the output of toJSON", function() {
            let json = params.toJSON();
            let newParams = Params.fromJSON(json, unique, heritable);
            newParams.getValue("boo").should.equal(true);
            newParams
                .getParameter("str")
                .getType()
                .should.equal("String");
        });
    });
});
