var should = require("should");
var StringValue = require("../../../app/core/parameters").StringValue;

describe("StringValue", function() {
    it("should allow a value of 'foobar'", function() {
        let val = StringValue("foobar");
        val.getType().should.equal("String");
        val.getValue().should.equal("foobar");
    });
    it("should not allow a value of true", function() {
        (function() {
            StringValue(true);
        }.should.throwError());
    });
    it("Should not allow a value of false", function() {
        (function() {
            StringValue(false);
        }.should.throwError());
    });
    it("should not allow the point [0,1]", function() {
        (function() {
            StringValue([0, 1]);
        }.should.throwError());
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            StringValue(1.1);
        }.should.throwError());
    });
    it("should not allow a value of 1", function() {
        (function() {
            StringValue(1);
        }.should.throwError());
    });
    it("should not allow a malformed point [1,3,4]", function() {
        (function() {
            StringValue([1, 3, 4]);
        }.should.throwError());
    });
});
