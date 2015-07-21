var should = require("should");
var Channel = require("../app/core/channel").Channel;
var CircleValve = require("../app/core/CircleValve").CircleValve;
var Via = require("../app/core/Via").Via;
var Port = require("../app/core/Port").Port;

describe('Channel', function(){
	describe("#init", function(){
		it("can be initialized with only start and end points", function(){
			let chan = new Channel({"start": [0,0], "end": [1,1]});
		});
		it("can be initialized with start, end, width, and height", function(){
			let chan = new Channel({"start": [0,0], "end": [1,1], "width": .4, "height": .6});
			chan.params.width.value.should.equal(.4);
			chan.params.height.value.should.equal(.6);
		});
		it("cannot be initalized without start or end", function(){
			(function(){let chan = new Channel({"start": [0,0]})}).should.throwError();
			(function(){let chan = new Channel({"end": [1,1]})}).should.throwError();
			(function(){let chan = new Channel({"width": .5, "height": .6})}).should.throwError();
			(function(){let chan = new Channel({"width": .5, "height": .6, "end": [1,100]})}).should.throwError();

		});
		it("cannot be initialized with malformed parameters", function(){
			(function(){let chan = new Channel({"start": [0,0], "end": "foobar"})}).should.throwError();
			(function(){let chan = new Channel({"start": [0,0], "end": [1,1], "height": "foobar"})}).should.throwError();
			(function(){let chan = new Channel({"start": 23, "end": [0,1]})}).should.throwError();
			(function(){let chan = new Channel({"start": [0,0], "end": [1,1], "heght": 23.5})}).should.throwError();
			(function(){let chan = new Channel({"start": [0], "end": [1]})}).should.throwError();
		});
	});
});

describe('CircleValve', function(){
	describe("#init", function(){
		it("can be initialized with only position", function(){
			let circ = new CircleValve({"position": [0,0]});
		});
		it("can be initialized with position, radius1, radius2, and height", function(){
			let circ = new CircleValve({"position": [0,0], "radius1": .6, "radius2": .8, "height": .6});
			circ.params.radius1.value.should.equal(.6);
			circ.params.radius2.value.should.equal(.8);
			circ.params.height.value.should.equal(.6);
		});
		it("cannot be initalized without position", function(){
			(function(){let circ = new CircleValve({"height": 5.5})}).should.throwError();
			(function(){let circ = new CircleValve({"width": 4})}).should.throwError();
			(function(){let circ = new CircleValve({"width": .5, "height": .6})}).should.throwError();
			(function(){let circ = new CircleValve({"width": .5, "height": .6})}).should.throwError();

		});
		it("cannot be initialized with malformed parameters", function(){
			(function(){let circ = new CircleValve({"position": [4,-5], "height": "foobar"})}).should.throwError();
			(function(){let circ = new CircleValve({"position": [13,3], "height": .5, "radius1": "foobar"})}).should.throwError();
			(function(){let circ = new CircleValve({"position": [25,4], "end": [0,1]})}).should.throwError();
			(function(){let circ = new CircleValve({"start": [0,0], "end": [1,1], "heght": 23.5})}).should.throwError();
			(function(){let circ = new CircleValve({"start": [0], "end": [1]})}).should.throwError();
		});
	});
});

describe('Via', function(){
	describe("#init", function(){
		it("can be initialized with only position", function(){
			let circ = new Via({"position": [0,0]});
		});
		it("can be initialized with position, radius1, radius2, and height", function(){
			let circ = new Via({"position": [0,0], "radius1": .6, "radius2": .8, "height": .6});
			circ.params.radius1.value.should.equal(.6);
			circ.params.radius2.value.should.equal(.8);
			circ.params.height.value.should.equal(.6);
		});
		it("cannot be initalized without position", function(){
			(function(){let circ = new Via({"height": 5.5})}).should.throwError();
			(function(){let circ = new Via({"width": 4})}).should.throwError();
			(function(){let circ = new Via({"width": .5, "height": .6})}).should.throwError();
			(function(){let circ = new Via({"width": .5, "height": .6})}).should.throwError();

		});
		it("cannot be initialized with malformed parameters", function(){
			(function(){let circ = new Via({"position": [4,-5], "height": "foobar"})}).should.throwError();
			(function(){let circ = new Via({"position": [13,3], "height": .5, "radius1": "foobar"})}).should.throwError();
			(function(){let circ = new Via({"position": [25,4], "end": [0,1]})}).should.throwError();
			(function(){let circ = new Via({"start": [0,0], "end": [1,1], "heght": 23.5})}).should.throwError();
			(function(){let circ = new Via({"start": [0], "end": [1]})}).should.throwError();
		});
	});
});

describe('Port', function(){
	describe("#init", function(){
		it("can be initialized with only position", function(){
			let circ = new Port({"position": [0,0]});
		});
		it("can be initialized with position, radius, and height", function(){
			let circ = new Port({"position": [0,0], "radius": .6, "height": .6});
			circ.params.radius.value.should.equal(.6);
			circ.params.height.value.should.equal(.6);
		});
		it("channot be initalized without position", function(){
			(function(){let circ = new Port({"height": 5.5})}).should.throwError();
			(function(){let circ = new Port({"width": 4})}).should.throwError();
			(function(){let circ = new Port({"width": .5, "height": .6})}).should.throwError();
			(function(){let circ = new Port({"width": .5, "height": .6})}).should.throwError();

		});
		it("cannot be initialized with malformed parameters", function(){
			(function(){let circ = new Port({"position": [4,-5], "height": "foobar"})}).should.throwError();
			(function(){let circ = new Port({"position": [13,3], "height": .5, "radius": "foobar"})}).should.throwError();
			(function(){let circ = new Port({"position": [25,4], "end": [0,1]})}).should.throwError();
			(function(){let circ = new Port({"start": [0,0], "end": [1,1], "heght": 23.5})}).should.throwError();
			(function(){let circ = new Port({"start": [0], "end": [1]})}).should.throwError();
		});
	});
});