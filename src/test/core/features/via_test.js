var should = require("should");
var Feature = require("../../../app/core/feature");
var Via = Feature.getFeatureGenerator("Via", "Basic");

describe("Via", function() {
    describe("#init", function() {
        it("can be initialized with only position", function() {
            let circ = Via({
                position: [0, 0]
            });
        });
        it("can be initialized with position, radius1, radius2, and height", function() {
            let circ = Via({
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
                let circ = Via({
                    height: 5.5
                });
            }.should.throwError());
            (function() {
                let circ = Via({
                    width: 4
                });
            }.should.throwError());
            (function() {
                let circ = Via({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
            (function() {
                let circ = Via({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
        });
        it("cannot be initialized with malformed parameters", function() {
            (function() {
                let circ = Via({
                    position: [4, -5],
                    height: "foobar"
                });
            }.should.throwError());
            (function() {
                let circ = Via({
                    position: [13, 3],
                    height: 0.5,
                    radius1: "foobar"
                });
            }.should.throwError());
            (function() {
                let circ = Via({
                    position: [25, 4],
                    end: [0, 1]
                });
            }.should.throwError());
            (function() {
                let circ = Via({
                    start: [0, 0],
                    end: [1, 1],
                    heght: 23.5
                });
            }.should.throwError());
            (function() {
                let circ = Via({
                    start: [0],
                    end: [1]
                });
            }.should.throwError());
        });
    });
});
