var appRoot = "../../../app/";
var should = require("should");
var StringValue = require(appRoot + "core/parameters/stringValue");

describe("StringValue", function() {
    it("should allow a value of 'foobar'", function() {
        let val = new StringValue("foobar");
        val.type.should.equal("String");
        val.value.should.equal("foobar");
    });
    it("should not allow a value of true", function() {
        (function() {
            new StringValue(true)
        }).should.throwError();
    });
    it("Should not allow a value of false", function() {
        (function() {
            new StringValue(false)
        }).should.throwError();
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            new StringValue([0, 1])
        }).should.throwError();
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            new StringValue(1.1)
        }).should.throwError();
    });
    it("should not allow a value of 1", function() {
        (function() {
            new StringValue(1)
        }).should.throwError();
    });
    it("should not allow a malformed point [1,3,4]", function() {
        (function() {
            new StringValue([1, 3, 4])
        }).should.throwError();
    });
});