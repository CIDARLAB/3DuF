const appRoot = "../../app/";
const should = require("should");
const Parameters = require(appRoot + "core/parameters");
const Parameter = require(appRoot + "core/parameter");

const FloatValue = Parameters.FloatValue;
const IntegerValue = Parameters.IntegerValue;
const PointValue = Parameters.PointValue;
const BooleanValue = Parameters.BooleanValue;
const StringValue = Parameters.StringValue;

const makeParam = Parameter.makeParam;

describe("Parameter", function () {
    describe("#toJSON", function () {
        it("can produce JSON without errors", function () {
            const type = "String";
            const value = "foo";
            const val = new Parameter(type, value);
            val.toJSON();
        });
    });
    describe("#updateValue", function () {
        it("should allow its value to be updated to a valid input value", function () {
            const flo = FloatValue(1.3985);
            flo.updateValue(178.235);
            flo.getValue().should.be.approximately(178.235, 0.00001);
            const str = StringValue("foobar");
            str.updateValue("whatever");
            str.getValue().should.equal("whatever");
        });
        it("should not allow its value to be updated to an invalid input value", function () {
            const flo = FloatValue(1.3985);
            (function () {
                flo.updateValue("whatever");
            }.should.throwError());
            const str = StringValue("foobar");
            (function () {
                str.updateValue(265);
            }.should.throwError());
        });
    });
    describe("#makeParam", function () {
        it("should allow properly-formed type:value pairs", function () {
            const str = Parameter.makeParam("String", "foobar");
            const pnt = Parameter.makeParam("Point", [0, 1]);
            const int = Parameter.makeParam("Integer", 5);
            const flt = Parameter.makeParam("Float", 5.5);
            const bln = Parameter.makeParam("Boolean", true);
        });
        it("should not allow improperly-formed type:value pairs", function () {
            (function () {
                const badStr = Parameter.makeParam("String", [0, 1]);
            }.should.throwError());
            (function () {
                const badStr = Parameter.makeParam("Boolean", 10);
            }.should.throwError());
            (function () {
                const badStr = Parameter.makeParam("Point", true);
            }.should.throwError());
            (function () {
                const badStr = Parameter.makeParam("Integer", 5.5);
            }.should.throwError());
            (function () {
                const badStr = Parameter.makeParam("Float", "foobar");
            }.should.throwError());
        });
    });
    describe("#fromJSON", function () {
        it("should convert valid JSON to a ParamValue object of the correct type", function () {
            const floatJSON = {
                type: "Float",
                value: 3.6
            };
            const strJSON = {
                type: "String",
                value: "foobar"
            };
            const flo = Parameter.fromJSON(floatJSON);
            const str = Parameter.fromJSON(strJSON);
            flo.getType().should.equal("Float");
            str.getType().should.equal("String");
        });
        it("should fail when passed JSON with valid types but invalid values", function () {
            const floatJSON = {
                type: "Float",
                value: "foobar"
            };
            const strJSON = {
                type: "String",
                value: 3.6
            };
            (function () {
                Values.JSONToParam(floatJSON);
            }.should.throwError());
            (function () {
                Values.JSONToParam(strJSON);
            }.should.throwError());
        });
        it("should fail when passed JSON with unrecognized types", function () {
            const weirdJSON = {
                type: "someWeirdThingWeHaveNeverHeardOf",
                value: {
                    weirdness: "applesauce"
                }
            };
            (function () {
                Values.JSONToParam(weirdJSON);
            }.should.throwError());
        });
    });
});
