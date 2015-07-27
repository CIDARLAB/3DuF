var appRoot = "../../../app/";
var should = require("should");
var Channel = require(appRoot + "core/features/channel");

describe('Channel', function() {
    describe("#init", function() {
        it("can be initialized with only start and end points", function() {
            let chan = new Channel({
                "start": [0, 0],
                "end": [1, 1]
            });
        });
        it("can be initialized with start, end, width, and height", function() {
            let chan = new Channel({
                "start": [0, 0],
                "end": [1, 1],
                "width": .4,
                "height": .6
            });
            chan.params.getValue("width").should.equal(.4);
            chan.params.getValue("height").should.equal(.6);
        });
        it("cannot be initalized without start or end", function() {
            (function() {
                let chan = new Channel({
                    "start": [0, 0]
                })
            }).should.throwError();
            (function() {
                let chan = new Channel({
                    "end": [1, 1]
                })
            }).should.throwError();
            (function() {
                let chan = new Channel({
                    "width": .5,
                    "height": .6
                })
            }).should.throwError();
            (function() {
                let chan = new Channel({
                    "width": .5,
                    "height": .6,
                    "end": [1, 100]
                })
            }).should.throwError();

        });
        it("cannot be initialized with malformed parameters", function() {
            (function() {
                let chan = new Channel({
                    "start": [0, 0],
                    "end": "foobar"
                })
            }).should.throwError();
            (function() {
                let chan = new Channel({
                    "start": [0, 0],
                    "end": [1, 1],
                    "height": "foobar"
                })
            }).should.throwError();
            (function() {
                let chan = new Channel({
                    "start": 23,
                    "end": [0, 1]
                })
            }).should.throwError();
            (function() {
                let chan = new Channel({
                    "start": [0, 0],
                    "end": [1, 1],
                    "heght": 23.5
                })
            }).should.throwError();
            (function() {
                let chan = new Channel({
                    "start": [0],
                    "end": [1]
                })
            }).should.throwError();
        });
    });
});