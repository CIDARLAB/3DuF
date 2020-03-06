var appRoot = "../../app/";
var should = require("should");
var Parameters = require(appRoot + "core/parameters");
var Parameter = require(appRoot + "core/parameter");

var FloatValue = Parameters.FloatValue;
var IntegerValue = Parameters.IntegerValue;
var PointValue = Parameters.PointValue;
var BooleanValue = Parameters.BooleanValue;
var StringValue = Parameters.StringValue;

var makeParam = Parameter.makeParam;

describe("Parameter", function() {
    describe("#toJSON", function() {
        it("can produce JSON without errors", function() {
            let type = "String";
            let value = "foo";
            let val = new Parameter(type, value);
            val.toJSON();
        });
    });
    describe("#updateValue", function() {
        it("should allow its value to be updated to a valid input value", function() {
            let flo = FloatValue(1.3985);
            flo.updateValue(178.235);
            flo.getValue().should.be.approximately(178.235, 0.00001);
            let str = StringValue("foobar");
            str.updateValue("whatever");
            str.getValue().should.equal("whatever");
        });
        it("should not allow its value to be updated to an invalid input value", function() {
            let flo = FloatValue(1.3985);
            (function() {
                flo.updateValue("whatever");
            }.should.throwError());
            let str = StringValue("foobar");
            (function() {
                str.updateValue(265);
            }.should.throwError());
        });
    });
    describe("#makeParam", function() {
        it("should allow properly-formed type:value pairs", function() {
            let str = Parameter.makeParam("String", "foobar");
            let pnt = Parameter.makeParam("Point", [0, 1]);
            let int = Parameter.makeParam("Integer", 5);
            let flt = Parameter.makeParam("Float", 5.5);
            let bln = Parameter.makeParam("Boolean", true);
        });
        it("should not allow improperly-formed type:value pairs", function() {
            (function() {
                let badStr = Parameter.makeParam("String", [0, 1]);
            }.should.throwError());
            (function() {
                let badStr = Parameter.makeParam("Boolean", 10);
            }.should.throwError());
            (function() {
                let badStr = Parameter.makeParam("Point", true);
            }.should.throwError());
            (function() {
                let badStr = Parameter.makeParam("Integer", 5.5);
            }.should.throwError());
            (function() {
                let badStr = Parameter.makeParam("Float", "foobar");
            }.should.throwError());
        });
    });
    describe("#fromJSON", function() {
        it("should convert valid JSON to a ParamValue object of the correct type", function() {
            let floatJSON = {
                type: "Float",
                value: 3.6
            };
            let strJSON = {
                type: "String",
                value: "foobar"
            };
            let flo = Parameter.fromJSON(floatJSON);
            let str = Parameter.fromJSON(strJSON);
            flo.getType().should.equal("Float");
            str.getType().should.equal("String");
        });
        it("should fail when passed JSON with valid types but invalid values", function() {
            let floatJSON = {
                type: "Float",
                value: "foobar"
            };
            let strJSON = {
                type: "String",
                value: 3.6
            };
            (function() {
                Values.JSONToParam(floatJSON);
            }.should.throwError());
            (function() {
                Values.JSONToParam(strJSON);
            }.should.throwError());
        });
        it("should fail when passed JSON with unrecognized types", function() {
            let weirdJSON = {
                type: "someWeirdThingWeHaveNeverHeardOf",
                value: {
                    weirdness: "applesauce"
                }
            };
            (function() {
                Values.JSONToParam(weirdJSON);
            }.should.throwError());
        });
    });
});
