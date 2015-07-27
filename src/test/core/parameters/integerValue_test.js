var appRoot = "../../../app/";
var should = require("should");
var IntegerValue = require(appRoot + "core/parameters/integerValue");

describe("IntegerValue", function() {
    it("should allow a value of 1", function() {
        let val = new IntegerValue(1);
        val.type.should.equal("Integer");
        val.value.should.equal(1);
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            new IntegerValue(1.1)
        }).should.throwError();
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            new IntegerValue([0, 1])
        }).should.throwError();
    });
    it("should not allow a value of true", function() {
        (function() {
            new IntegerValue(true)
        }).should.throwError();
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            new IntegerValue('foobar')
        }).should.throwError();
    });
});