var should = require("should");
var Feature = require("../../../app/core/feature");
var CircleValve = Feature.getFeatureGenerator("CircleValve", "Basic");

describe("CircleValve", function() {
    describe("#init", function() {
        it("can be initialized with only position", function() {
            let circ = CircleValve({
                position: [0, 0]
            });
        });
        it("can be initialized with position, radius1, radius2, and height", function() {
            let circ = CircleValve({
                position: [0, 0],
                radius1: 0.6,
                radius2: 0.8,
                height: 0.6
            });
            circ.getValue("radius1").should.equal(0.6);
            circ.getValue("radius2").should.equal(0.8);
            circ.getValue("height").should.equal(0.6);
        });
        it("cannot be initalized without position", function() {
            (function() {
                let circ = CircleValve({
                    height: 5.5
                });
            }.should.throwError());
            (function() {
                let circ = CircleValve({
                    width: 4
                });
            }.should.throwError());
            (function() {
                let circ = CircleValve({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
            (function() {
                let circ = CircleValve({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
        });
        it("cannot be initialized with malformed parameters", function() {
            (function() {
                let circ = CircleValve({
                    position: [4, -5],
                    height: "foobar"
                });
            }.should.throwError());
            (function() {
                let circ = CircleValve({
                    position: [13, 3],
                    height: 0.5,
                    radius1: "foobar"
                });
            }.should.throwError());
            (function() {
                let circ = CircleValve({
                    position: [25, 4],
                    end: [0, 1]
                });
            }.should.throwError());
            (function() {
                let circ = CircleValve({
                    start: [0, 0],
                    end: [1, 1],
                    heght: 23.5
                });
            }.should.throwError());
            (function() {
                let circ = CircleValve({
                    start: [0],
                    end: [1]
                });
            }.should.throwError());
        });
    });
});
