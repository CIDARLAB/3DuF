var appRoot = "../../../app/";
var should = require("should");
var Port = require(appRoot + "core/features/port");

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