var should = require("should");
var Values = require("../app/core/values");

describe("ParamTypes", function(){
	var unique = {"start": "Point", "end": "Point"};
	var heritable = {"width": "Float", "height": "Float"};
	var testParams = {
		"start": new Values.PointValue([0,1]), 
		"end": new Values.PointValue([1,2]),
		"width": new Values.FloatValue(.5),
		"height": new Values.FloatValue(.2)
	};
	var types;

	describe("#init", function(){
		it("should initialize with valid paramTypes", function(){
			var types = new Values.ParamTypes(unique, heritable);
			types.unique["start"].should.equal("Point");
			types.heritable["width"].should.equal("Float");
		});
	});
	describe("#checkParams", function(){
		beforeEach(function(){
			types = new Values.ParamTypes(unique, heritable);
		});
		it("should approve a set of all known-good parameters", function(){
			types.checkParams(testParams);
		});
		it("should approve a set of known-good parameters missing a heritable value", function(){
			var deleteParams = testParams;
			delete deleteParams["height"];
			(function() { types.checkParams(deleteParams)}).should.not.throwError();
		});
		it("should not approve a set of parameters that are missing a unique value", function(){
			var deleteParams = testParams;
			delete deleteParams["start"];
			(function() { types.checkParams(deleteParams)}).should.throwError();
		});
		it("should not approve an empty set of parameters", function(){
			var emptyParams = {};
			(function() { types.checkParams(emptyParams)}).should.throwError();
		});
		it("should not approve a set of parameters with an unexpected ParamValue", function(){
			var extraParams = testParams;
			extraParams["foobar"] = new Values.FloatValue(.2);
			(function() { types.checkParams(oddParams)}).should.throwError();
		});
		it("should not approve a set of parameters with a malformed ParamValue", function(){
			var malParams = testParams;
			malParams["height"] = "foobarbaz";
			(function() { types.checkParams(malParams)}).should.throwError();
		});
		it("should not approve something that is not a set of parameters", function(){
			var badVar = "foobar";
			(function() { types.checkParams(badVar)}).should.throwError();
		});
	});
	describe("#sanitizeParams", function(){
		it("should create sanitized params objects for properly-formed key:value pairs", function(){
			let testParams = {
				"start": [0,1],
				"end": [-5, 15],
				"height": 10,
				"width": 4
			};
			(function() { types.sanitizeParams(testParams)}).should.not.throwError();
		});
		it("should create sanitized params objects for params with missing heritable values", function(){
			let testParams = {
				"start": [0,1],
				"end": [-5, 15],
			};
			(function() { types.sanitizeParams(testParams)}).should.not.throwError();
		});
		it("should complain if the input parameters are missing unique values", function(){
			let testParams = {
				"end": [-5, 15],
				"height": 10,
				"width": 4
			};
			(function() { types.sanitizeParams(testParams)}).should.throwError();
		});
	});
});