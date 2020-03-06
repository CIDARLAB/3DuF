var should = require("should");
var BooleanValue = require("../../../app/core/parameters").BooleanValue;

describe("BooleanValue", function() {
    it("should allow a value of true", function() {
        let val = BooleanValue(true);
        val.getType().should.equal("Boolean");
        val.getValue().should.equal(true);
    });
    it("Should allow a value of false", function() {
        let val = BooleanValue(false);
        val.getType().should.equal("Boolean");
        val.getValue().should.equal(false);
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            BooleanValue([0, 1]);
        }.should.throwError());
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            BooleanValue(1.1);
        }.should.throwError());
    });
    it("should not allow a value of 1", function() {
        (function() {
            BooleanValue(1);
        }.should.throwError());
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            BooleanValue("foobar");
        }.should.throwError());
    });
    it("should not allow a malformed point [1,3,4]", function() {
        (function() {
            BooleanValue([1, 3, 4]);
        }.should.throwError());
    });
});
