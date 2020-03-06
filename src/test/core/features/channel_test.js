var should = require("should");
var Feature = require("../../../app/core/feature");
var Channel = Feature.getFeatureGenerator("Channel", "Basic");

describe("Channel", function() {
    describe("#init", function() {
        it("can be initialized with only start and end points", function() {
            let chan = Channel({
                start: [0, 0],
                end: [1, 1]
            });
        });
        it("can be initialized with start, end, width, and height", function() {
            let chan = Channel({
                start: [0, 0],
                end: [1, 1],
                width: 0.4,
                height: 0.6
            });
            chan.getValue("width").should.equal(0.4);
            chan.getValue("height").should.equal(0.6);
        });
        it("cannot be initalized without start or end", function() {
            (function() {
                let chan = Channel({
                    start: [0, 0]
                });
            }.should.throwError());
            (function() {
                let chan = Channel({
                    end: [1, 1]
                });
            }.should.throwError());
            (function() {
                let chan = Channel({
                    width: 0.5,
                    height: 0.6
                });
            }.should.throwError());
            (function() {
                let chan = Channel({
                    width: 0.5,
                    height: 0.6,
                    end: [1, 100]
                });
            }.should.throwError());
        });
        it("cannot be initialized with malformed parameters", function() {
            (function() {
                let chan = Channel({
                    start: [0, 0],
                    end: "foobar"
                });
            }.should.throwError());
            (function() {
                let chan = Channel({
                    start: [0, 0],
                    end: [1, 1],
                    height: "foobar"
                });
            }.should.throwError());
            (function() {
                let chan = Channel({
                    start: 23,
                    end: [0, 1]
                });
            }.should.throwError());
            (function() {
                let chan = Channel({
                    start: [0, 0],
                    end: [1, 1],
                    heght: 23.5
                });
            }.should.throwError());
            (function() {
                let chan = Channel({
                    start: [0],
                    end: [1]
                });
            }.should.throwError());
        });
    });
});
