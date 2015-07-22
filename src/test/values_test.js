var should = require("should");
var Values = require("../app/core/values");
var FloatValue = Values.FloatValue;
var IntegerValue = Values.IntegerValue;
var PointValue = Values.PointValue;
var BooleanValue = Values.BooleanValue;
var StringValue = Values.StringValue;
var makeParam = Values.makeParam;


describe("ParamValue", function(){
	describe("#toJSON", function(){
		it("can produce JSON without errors", function(){
			let type = "Foo";
			let value = 1.0
			let val = new Values.ParamValue(type, value);
			val.toJSON();
		});
	});
});

describe('FloatValue', function(){
	it("should allow a value of 1.1", function(){
		let val = new FloatValue(1.1);
		val.type.should.equal("Float");
		val.value.should.be.approximately(1.1,.00001);
	});
	it("should allow a value of 1", function(){
		let val = new FloatValue(1);
		val.type.should.equal("Float");
		val.value.should.be.approximately(1, .00001);
	});
	it("should not allow a value of true", function(){
		(function() {new FloatValue(true)}).should.throwError();
	});
	it("should not allow a value of 'foobar'", function(){
		(function() {new FloatValue("foobar")}).should.throwError();
	});
	it("should not allow the point [0,1]", function(){
		(function() {new FloatValue([0,1])}).should.throwError();
	});
});
describe("IntegerValue", function(){
	it("should allow a value of 1", function(){
		let val = new IntegerValue(1);
		val.type.should.equal("Integer");
		val.value.should.equal(1);
	});
	it("should not allow a value of 1.1", function(){
		(function() {new IntegerValue(1.1)}).should.throwError();
	});
	it("should not allow the point [0,1]", function(){
		(function() {new IntegerValue([0,1])}).should.throwError();
	});
	it("should not allow a value of true", function(){
		(function() {new IntegerValue(true)}).should.throwError();
	});
	it("should not allow a value of 'foobar'", function(){
		(function() {new IntegerValue('foobar')}).should.throwError();
	});
});
describe("PointValue", function(){
	it("should allow the point [0,1]", function(){
		let val = new PointValue([0,1]);
		val.type.should.equal("Point");
		val.value.length.should.equal(2);
		val.value[0].should.equal(0);
		val.value[1].should.equal(1);
	});
	it("should not allow a value of 1.1", function(){
		(function() {new PointValue(1.1)}).should.throwError();
	});
	it("should not allow a value of 1", function(){
		(function() {new PointValue(1)}).should.throwError();
	});
	it("should not allow a value of true", function(){
		(function() {new PointValue(true)}).should.throwError();
	});
	it("should not allow a value of 'foobar'", function(){
		(function() {new PointValue('foobar')}).should.throwError();
	});
	it("should not allow a malformed point [1,3,4]", function(){
		(function() {new PointValue([1,3,4])}).should.throwError();
	});
});
describe("BooleanValue", function(){
	it("should allow a value of true", function(){
		let val = new BooleanValue(true);
		val.type.should.equal("Boolean");
		val.value.should.equal(true);
	});
	it("Should allow a value of false", function(){
		let val = new BooleanValue(false);
		val.type.should.equal("Boolean");
		val.value.should.equal(false);
	});
	it("should not allow the point [0,1]", function(){
		(function() {new BooleanValue([0,1])}).should.throwError();
	});
	it("should not allow a value of 1.1", function(){
		(function() {new BooleanValue(1.1)}).should.throwError();
	});
	it("should not allow a value of 1", function(){
		(function() {new BooleanValue(1)}).should.throwError();
	});
	it("should not allow a value of 'foobar'", function(){
		(function() {new BooleanValue('foobar')}).should.throwError();
	});
	it("should not allow a malformed point [1,3,4]", function(){
		(function() {new BooleanValue([1,3,4])}).should.throwError();
	});
});

describe("StringValue", function(){
	it("should allow a value of 'foobar'", function(){
		let val = new StringValue("foobar");
		val.type.should.equal("String");
		val.value.should.equal("foobar");
	});
	it("should not allow a value of true", function(){
		(function() {new StringValue(true)}).should.throwError();
	});
	it("Should not allow a value of false", function(){
		(function() {new StringValue(false)}).should.throwError();
	});
	it("should not allow the point [0,1]", function(){
		(function() {new StringValue([0,1])}).should.throwError();
	});
	it("should not allow a value of 1.1", function(){
		(function() {new StringValue(1.1)}).should.throwError();
	});
	it("should not allow a value of 1", function(){
		(function() {new StringValue(1)}).should.throwError();
	});
	it("should not allow a malformed point [1,3,4]", function(){
		(function() {new StringValue([1,3,4])}).should.throwError();
	});
});

describe("#makeParam", function(){
	it("should allow properly-formed type:value pairs", function(){
		let str = makeParam(StringValue.typeString(), "foobar");
		let pnt = makeParam(PointValue.typeString(), [0,1]);
		let int = makeParam(IntegerValue.typeString(), 5);
		let flt = makeParam(FloatValue.typeString(), 5.5);
		let bln = makeParam(BooleanValue.typeString(), true);
	});
	it("should not allow improperly-formed type:value pairs", function(){
		(function() { let badStr = makeParam(StringValue.typeString(), [0,1])}).should.throwError();
		(function() { let badStr = makeParam(BooleanValue.typeString(), 10)}).should.throwError();
		(function() { let badStr = makeParam(PointValue.typeString(), true)}).should.throwError();
		(function() { let badStr = makeParam(IntegerValue.typeString(), 5.5)}).should.throwError();
		(function() { let badStr = makeParam(FloatValue.typeString(), "foobar")}).should.throwError();
	});
});

describe("#JSONToParam", function(){
	it("should convert valid JSON to a ParamValue object of the correct type", function(){
		let floatJSON = {
			"type": FloatValue.typeString(),
			"value": 3.6
		};
		let strJSON = {
			"type": StringValue.typeString(),
			"value": "foobar"
		};
		Values.JSONToParam(floatJSON);
		Values.JSONToParam(strJSON);
	});
	it("should fail when passed JSON with valid types but invalid values", function(){
		let floatJSON = {
			"type": FloatValue.typeString(),
			"value": "foobar"
		};
		let strJSON = {
			"type": StringValue.typeString(),
			"value": 3.6
		};
		(function(){Values.JSONToParam(floatJSON);}).should.throwError();
		(function(){Values.JSONToParam(strJSON);}).should.throwError();
	});
	it("should fail when passed JSON with unrecognized types", function(){
		let weirdJSON = {
			"type": "someWeirdThingWeHaveNeverHeardOf",
			"value": {"weirdness": "applesauce"}
		};
		(function(){Values.JSONToParam(weirdJSON);}).should.throwError();
	});
});

