var should = require("should");
var utils = require("../../app/utils/geometryUtils");

describe("GeometryUtils", function() {
    describe("#degToRad", function() {
        it("should return pi/2 for 90 degrees", function() {
            utils.degToRad(90).should.equal(Math.PI / 2);
        });
        it("should return 0 for 0 degrees", function() {
            utils.degToRad(0).should.equal(0);
        });
        it("should return pi for 180 degrees", function() {
            utils.degToRad(180).should.equal(Math.PI);
        });
        it("should return pi/6 for 30 degrees", function() {
            utils.degToRad(30).should.equal(Math.PI / 6);
        });
        it("should return pi/3 for 60 degrees", function() {
            utils.degToRad(60).should.equal(Math.PI / 3);
        });
    });

    describe("#radToDeg", function() {
        it("should return 180 for pi", function() {
            utils.radToDeg(Math.PI).should.equal(180);
        });
        it("should return 90 for pi/2", function() {
            utils.radToDeg(Math.PI / 2).should.equal(90);
        });
        it("should return 360 for pi*2", function() {
            utils.radToDeg(Math.PI * 2).should.equal(360);
        });
    });

    describe("#computeAngleFrompoints", function() {
        it("should return 45 degrees for [-1,0], [0,1]", function() {
            utils.computeAngleFromPoints([-1, 0], [0, 1]).should.equal(45);
        });
        it("should return -225 degrees for [0,1], [-1,0]", function() {
            utils.computeAngleFromPoints([0, 1], [-1, 0]).should.equal(-135);
        });
        it("should return 90 degrees for [0,0], [0,1]", function() {
            utils.computeAngleFromPoints([0, 0], [0, 1]).should.equal(90);
        });
        it("should return -90 degrees for [0,1], [0,0]", function() {
            utils.computeAngleFromPoints([0, 1], [0, 0]).should.equal(-90);
        });
    });

    describe("#computeAngle", function() {
        it("should return 0 degrees for (1,0)", function() {
            utils.computeAngle(1, 0).should.equal(0);
        });
        it("should return 180 degrees for (-1,0)", function() {
            utils.computeAngle(-1, 0).should.equal(180);
        });
        it("should return 90 degrees for (0,1)", function() {
            utils.computeAngle(0, 1).should.equal(90);
        });
        it("should return -90 degrees for (0,-1)", function() {
            utils.computeAngle(0, -1).should.equal(-90);
        });
        it("should return 45 degrees for (1,1)", function() {
            utils.computeAngle(1, 1).should.equal(45);
        });
    });

    describe("#computeDistance", function() {
        it("should return 1 for (1,0)", function() {
            utils.computeDistance(1, 0).should.equal(1);
        });
        it("should return 0 for (0,0)", function() {
            utils.computeDistance(0, 0).should.equal(0);
        });
        it("should return 1 for (-1,0)", function() {
            utils.computeDistance(-1, 0).should.equal(1);
        });
        it("should return 1 for (0,1)", function() {
            utils.computeDistance(0, 1).should.equal(1);
        });
        it("should return 1 for (0,-1)", function() {
            utils.computeDistance(0, -1).should.equal(1);
        });
        it("should return 3 for (0,3)", function() {
            utils.computeDistance(0, 3).should.equal(3);
        });
        it("should return 5 for (3,4)", function() {
            utils.computeDistance(3, 4).should.equal(5);
        });
        it("should return 5 for (-3,-4", function() {
            utils.computeDistance(-3, -4).should.equal(5);
        });
        it("should return 5 for (3,-4)", function() {
            utils.computeDistance(3, -4).should.equal(5);
        });
        it("should return 5 for (-3,4)", function() {
            utils.computeDistance(-3, 4).should.equal(5);
        });
    });

    describe("#computeDistanceBetweenPoints", function() {
        it("should return 1 for [0,0], [0,1]", function() {
            utils.computeDistanceBetweenPoints([0, 0], [0, 1]).should.equal(1);
        });
        it("should return 1 for [0,1], [0,0]", function() {
            utils.computeDistanceBetweenPoints([0, 1], [0, 0]).should.equal(1);
        });
        it("should return 2 for [1,0], [-1,0]", function() {
            utils.computeDistanceBetweenPoints([1, 0], [-1, 0]).should.equal(2);
        });
        it("should return 2 for [-1,0], [1,0]", function() {
            utils.computeDistanceBetweenPoints([-1, 0], [1, 0]).should.equal(2);
        });
        it("should return 5 for [0,0], [3,4]", function() {
            utils.computeDistanceBetweenPoints([0, 0], [3, 4]).should.equal(5);
        });
        it("should return 5 for [3,4], [0,0]", function() {
            utils.computeDistanceBetweenPoints([3, 4], [0, 0]).should.equal(5);
        });
    });

    describe("#computeEndPoint", function() {
        it("should return [3,4] for [0,0], 53.13 degrees, 5 length", function() {
            var end = utils.computeEndPoint([0, 0], 53.13, 5);
            end[0].should.be.approximately(3, 0.01);
            end[1].should.be.approximately(4, 0.01);
        });
        it("should return [4,3] for [0,0], 36.86 degrees, 5 length", function() {
            var end = utils.computeEndPoint([0, 0], 36.86, 5);
            end[0].should.be.approximately(4, 0.01);
            end[1].should.be.approximately(3, 0.01);
        });
        it("should return [4,-3] for [0,0], -36.86 degrees, 5 length", function() {
            var end = utils.computeEndPoint([0, 0], -36.86, 5);
            end[0].should.be.approximately(4, 0.01);
            end[1].should.be.approximately(-3, 0.01);
        });
        it("should return [-3,-4] for [0,0], 126.86 degrees, 5 length", function() {
            var end = utils.computeEndPoint([0, 0], -126.86, 5);
            end[0].should.be.approximately(-3, 0.01);
            end[1].should.be.approximately(-4, 0.01);
        });
        it("should return [1,1] for [0,0], 45 degrees, 1.41421 length", function() {
            var end = utils.computeEndPoint([0, 0], 45, 1.41421);
            end[0].should.be.approximately(1, 0.01);
            end[1].should.be.approximately(1, 0.01);
        });
        it("should return [2,2] for [1,1], 45 degrees, 1.41421 length", function() {
            var end = utils.computeEndPoint([1, 1], 45, 1.41421);
            end[0].should.be.approximately(2, 0.01);
            end[1].should.be.approximately(2, 0.01);
        });
    });
});
