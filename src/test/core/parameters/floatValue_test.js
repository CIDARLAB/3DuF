var should = require("should");
var FloatValue = require("../../../app/core/parameters").FloatValue;

describe("FloatValue", function() {
    it("should allow a value of 1.1", function() {
        let val = FloatValue(1.1);
        val.getType().should.equal("Float");
        val.getValue().should.be.approximately(1.1, 0.00001);
    });
    it("should allow a value of 1", function() {
        let val = FloatValue(1);
        val.getType().should.equal("Float");
        val.getValue().should.be.approximately(1, 0.00001);
    });
    it("should not allow a value of true", function() {
        (function() {
            FloatValue(true);
        }.should.throwError());
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            FloatValue("foobar");
        }.should.throwError());
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            FloatValue([0, 1]);
        }.should.throwError());
    });
});
