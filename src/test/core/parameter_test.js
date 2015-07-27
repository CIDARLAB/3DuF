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
            let type = "Foo";
            let value = 1.0
            let val = new Parameter(type, value);
            val.toJSON();
        });
    });
    describe("#makeParam", function() {
        it("should allow properly-formed type:value pairs", function() {
            let str = Parameter.makeParam(StringValue.typeString(), "foobar");
            let pnt = Parameter.makeParam(PointValue.typeString(), [0, 1]);
            let int = Parameter.makeParam(IntegerValue.typeString(), 5);
            let flt = Parameter.makeParam(FloatValue.typeString(), 5.5);
            let bln = Parameter.makeParam(BooleanValue.typeString(), true);
        });
        it("should not allow improperly-formed type:value pairs", function() {
            (function() {
                let badStr = Parameter.makeParam(StringValue.typeString(), [0, 1])
            }).should.throwError();
            (function() {
                let badStr = Parameter.makeParam(BooleanValue.typeString(), 10)
            }).should.throwError();
            (function() {
                let badStr = Parameter.makeParam(PointValue.typeString(), true)
            }).should.throwError();
            (function() {
                let badStr = Parameter.makeParam(IntegerValue.typeString(), 5.5)
            }).should.throwError();
            (function() {
                let badStr = Parameter.makeParam(FloatValue.typeString(), "foobar")
            }).should.throwError();
        });
    });
    describe("#fromJSON", function() {
        it("should convert valid JSON to a ParamValue object of the correct type", function() {
            let floatJSON = {
                "type": FloatValue.typeString(),
                "value": 3.6
            };
            let strJSON = {
                "type": StringValue.typeString(),
                "value": "foobar"
            };
            let flo = Parameter.fromJSON(floatJSON);
            let str = Parameter.fromJSON(strJSON);
            flo.type.should.equal(FloatValue.typeString());
            str.type.should.equal(StringValue.typeString());
        });
        it("should fail when passed JSON with valid types but invalid values", function() {
            let floatJSON = {
                "type": FloatValue.typeString(),
                "value": "foobar"
            };
            let strJSON = {
                "type": StringValue.typeString(),
                "value": 3.6
            };
            (function() {
                Values.JSONToParam(floatJSON);
            }).should.throwError();
            (function() {
                Values.JSONToParam(strJSON);
            }).should.throwError();
        });
        it("should fail when passed JSON with unrecognized types", function() {
            let weirdJSON = {
                "type": "someWeirdThingWeHaveNeverHeardOf",
                "value": {
                    "weirdness": "applesauce"
                }
            };
            (function() {
                Values.JSONToParam(weirdJSON);
            }).should.throwError();
        });
    });
});



