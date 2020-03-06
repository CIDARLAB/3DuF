var should = require("should");
var Feature = require("../../../app/core/feature");
var Port = Feature.getFeatureGenerator("Port", "Basic");

describe("Port", function() {
    describe("#init", function() {
        it("can be initialized with only position", function() {
            let circ = Port({
                position: [0, 0]
            });
        });
        it("can be initialized with position, radius, and height", function() {
            let circ = Port({
                position: [0, 0],
                radius1: 0.6,
                height: 0.6
            });
            circ.getValue("radius1").should.equal(0.6);
            circ.getValue("height").should.equal(0.6);
        });
        it("channot be initalized without position", function() {
            (function() {
                let circ = Port({
                    height: 5.5
                });
            }.should.throwError());
            (function() {
                let circ = Port({
                    width: 4
                });
            }.should.throwError());
            (function() {
                let circ = Port({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
            (function() {
                let circ = Port({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
        });
        it("cannot be initialized with malformed parameters", function() {
            (function() {
                let circ = Port({
                    position: [4, -5],
                    height: "foobar"
                });
            }.should.throwError());
            (function() {
                let circ = Port({
                    position: [13, 3],
                    height: 0.5,
                    radius1: "foobar"
                });
            }.should.throwError());
            (function() {
                let circ = Port({
                    position: [25, 4],
                    end: [0, 1]
                });
            }.should.throwError());
            (function() {
                let circ = Port({
                    start: [0, 0],
                    end: [1, 1],
                    heght: 23.5
                });
            }.should.throwError());
            (function() {
                let circ = Port({
                    start: [0],
                    end: [1]
                });
            }.should.throwError());
        });
    });
});
