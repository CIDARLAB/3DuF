var appRoot = "../../../app/";
var should = require("should");
var CircleValve = require(appRoot + "core/features/circleValve");

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
