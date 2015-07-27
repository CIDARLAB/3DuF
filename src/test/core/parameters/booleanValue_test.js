var appRoot = "../../../app/";
var should = require("should");
var BooleanValue = require(appRoot + "core/parameters/booleanValue");

describe("BooleanValue", function() {
    it("should allow a value of true", function() {
        let val = new BooleanValue(true);
        val.type.should.equal("Boolean");
        val.value.should.equal(true);
    });
    it("Should allow a value of false", function() {
        let val = new BooleanValue(false);
        val.type.should.equal("Boolean");
        val.value.should.equal(false);
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            new BooleanValue([0, 1])
        }).should.throwError();
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            new BooleanValue(1.1)
        }).should.throwError();
    });
    it("should not allow a value of 1", function() {
        (function() {
            new BooleanValue(1)
        }).should.throwError();
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            new BooleanValue('foobar')
        }).should.throwError();
    });
    it("should not allow a malformed point [1,3,4]", function() {
        (function() {
            new BooleanValue([1, 3, 4])
        }).should.throwError();
    });
});