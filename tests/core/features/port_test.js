const should = require("should");
const Feature = require("../../../app/core/feature");
const Port = Feature.getFeatureGenerator("Port", "Basic");
const it = require("it");
const describe = require("describe");

describe("Port", function() {
    describe("#init", function() {
        it("can be initialized with only position", function() {
            const circ = Port({
                position: [0, 0]
            });
        });
        it("can be initialized with position, radius, and height", function() {
            const circ = Port({
                position: [0, 0],
                radius1: 0.6,
                height: 0.6
            });
            circ.getValue("radius1").should.equal(0.6);
            circ.getValue("height").should.equal(0.6);
        });
        it("channot be initalized without position", function() {
            (function() {
                const circ = Port({
                    height: 5.5
                });
            }.should.throwError());
            (function() {
                const circ = Port({
                    width: 4
                });
            }.should.throwError());
            (function() {
                const circ = Port({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
            (function() {
                const circ = Port({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
        });
        it("cannot be initialized with malformed parameters", function() {
            (function() {
                const circ = Port({
                    position: [4, -5],
                    height: "foobar"
                });
            }.should.throwError());
            (function() {
                const circ = Port({
                    position: [13, 3],
                    height: 0.5,
                    radius1: "foobar"
                });
            }.should.throwError());
            (function() {
                const circ = Port({
                    position: [25, 4],
                    end: [0, 1]
                });
            }.should.throwError());
            (function() {
                const circ = Port({
                    start: [0, 0],
                    end: [1, 1],
                    heght: 23.5
                });
            }.should.throwError());
            (function() {
                const circ = Port({
                    start: [0],
                    end: [1]
                });
            }.should.throwError());
        });
    });
});
