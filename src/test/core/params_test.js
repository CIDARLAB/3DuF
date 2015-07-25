var appRoot = "../../app/";
var should = require("should");
var Parameters = require(appRoot + "core/parameters");
var Parameter = require(appRoot + "core/parameter");

var FloatValue = Parameters.FloatValue;
var IntegerValue = Parameters.IntegerValue;
var PointValue = Parameters.PointValue;
var BooleanValue = Parameters.BooleanValue;
var StringValue = Parameters.StringValue;

describe("Params", function() {
    describe("#toJSON", function() {
        it("can produce JSON without errors");
    });
    describe("#fromJSON", function() {
        it("should convert valid JSON to a Params object of the correct type");
    });
});



