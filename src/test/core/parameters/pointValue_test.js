var appRoot = "../../../app/";
var should = require("should");
var PointValue = require(appRoot + "core/parameters/pointValue");

describe("PointValue", function() {
    it("should allow the point [0,1]", function() {
        let val = new PointValue([0, 1]);
        val.type.should.equal("Point");
        val.value.length.should.equal(2);
        val.value[0].should.equal(0);
        val.value[1].should.equal(1);
    });
    it("should not allow a value of 1.1", function() {
        (function() {
            new PointValue(1.1)
        }).should.throwError();
    });
    it("should not allow a value of 1", function() {
        (function() {
            new PointValue(1)
        }).should.throwError();
    });
    it("should not allow a value of true", function() {
        (function() {
            new PointValue(true)
        }).should.throwError();
    });
    it("should not allow a value of 'foobar'", function() {
        (function() {
            new PointValue('foobar')
        }).should.throwError();
    });
    it("should not allow a malformed point [1,3,4]", function() {
        (function() {
            new PointValue([1, 3, 4])
        }).should.throwError();
    });
});