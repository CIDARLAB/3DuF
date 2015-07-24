var appRoot = "../../../app/";
var should = require("should");
var FloatValue = require(appRoot + "core/parameters/floatValue");

describe('FloatValue', function() {
    it("should allow a value of 1.1", function() {
        let val = new FloatValue(1.1);
        val.type.should.equal("Float");
        val.value.should.be.approximately(1.1, .00001);
    });
    it("should allow a value of 1", function() {
        let val = new FloatValue(1);
        val.type.should.equal("Float");
        val.value.should.be.approximately(1, .00001);
    });
    it("should not allow a value of true", function() {
        (function() {
            new FloatValue(true)
        }).should.throwError();
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            new FloatValue("foobar")
        }).should.throwError();
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            new FloatValue([0, 1])
        }).should.throwError();
    });
});