var should = require("should");
var IntegerValue = require("../../../app/core/parameters").IntegerValue;

describe("IntegerValue", function() {
    it("should allow a value of 1", function() {
        let val = IntegerValue(1);
        val.getType().should.equal("Integer");
        val.getValue().should.equal(1);
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            IntegerValue(1.1);
        }.should.throwError());
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            IntegerValue([0, 1]);
        }.should.throwError());
    });
    it("should not allow a value of true", function() {
        (function() {
            IntegerValue(true);
        }.should.throwError());
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            IntegerValue("foobar");
        }.should.throwError());
    });
});
