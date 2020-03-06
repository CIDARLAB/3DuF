var should = require("should");
var PointValue = require("../../../app/core/parameters").PointValue;

describe("PointValue", function() {
    it("should allow the point [0,1]", function() {
        let val = PointValue([0, 1]);
        val.getType().should.equal("Point");
        val.getValue().length.should.equal(2);
        val.getValue()[0].should.equal(0);
        val.getValue()[1].should.equal(1);
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            PointValue(1.1);
        }.should.throwError());
    });
    it("should not allow a value of 1", function() {
        (function() {
            PointValue(1);
        }.should.throwError());
    });
    it("should not allow a value of true", function() {
        (function() {
            PointValue(true);
        }.should.throwError());
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            PointValue("foobar");
        }.should.throwError());
    });
    it("should not allow a malformed point [1,3,4]", function() {
        (function() {
            PointValue([1, 3, 4]);
        }.should.throwError());
    });
});
