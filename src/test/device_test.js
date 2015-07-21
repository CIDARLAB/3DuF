var device = require('../app/device.js');
var should = require('should');

var dev = null;
var lay1 = null;
var lay2 = null;
var feat1 = null;
var feat2 = null;

var initDevice = function(){
	dev = new device.Device(50,60,"dev1");
	lay1 = new device.Layer(0,false,"layer1");
	lay2 = new device.Layer(1.2,true,"layer2");
	feat1 = new device.Feature("type1", "feat1");
	feat2 = new device.Feature("type2", "feat2");
}

describe("Device", function(){
	describe("#init", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should start with no layers", function(){
			dev.layers.length.should.equal(0);
		});
		it("should start with the correct width, height, and name", function(){
			dev.params.name.value.should.equal("dev1");
			dev.params.width.value.should.equal(50);
			dev.params.height.value.should.equal(60);
		});
		it("should be able to be constructed without a name", function(){
			(function() { let dev2 = new device.Device(50, 70)}).should.not.throwError();
		});
	});

	describe("#addLayer", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should let the user add a layer", function(){
			dev.addLayer(lay1);
			dev.layers.length.should.equal(1);
		});
		it("should let the user add multiple layers", function(){
			dev.addLayer(lay1);
			dev.addLayer(lay2);
			dev.layers.length.should.equal(2);
		});
		it("should place layers into the correct order", function(){
			dev.addLayer(lay2);
			dev.addLayer(lay1);
			dev.layers[0].should.be.exactly(lay1);
			dev.layers[1].should.be.exactly(lay2);
		});
	});
});

describe("Layer", function(){
	describe("#init", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should start with the correct z_offset, flip, and name", function(){
			lay1.params.z_offset.value.should.equal(0);
			lay1.params.flip.value.should.equal(false);
			lay1.params.name.value.should.equal("layer1");

			lay2.params.z_offset.value.should.equal(1.2);
			lay2.params.flip.value.should.equal(true);
			lay2.params.name.value.should.equal("layer2");
		});
		it("should be able to be constructed without a name", function(){
			(function() { let lay3 = new device.Layer(1.2, true)}).should.not.throwError();
		});
		it("should not permit a z_offset less than 0", function(){
			(function() { let lay3 = new device.Layer(-.6, false)}).should.throwError();
		});
		it("should start with 0 features", function(){
			lay1.featureCount.should.equal(0);
		});
	});


	describe("#addFeature", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should let the user add a feature", function(){
			lay1.addFeature(feat1);
			lay1.featureCount.should.equal(1);
		});
		it("should not let a user add a feature by id", function(){
			(function() { lay1.addFeature("some_ID")}).should.throwError();
		});
		it("should let the user add multiple features", function(){
			lay1.addFeature(feat1);
			lay1.addFeature(feat2);
			lay1.featureCount.should.equal(2);
		});
	});

	describe("#__ensureIsAFeature", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should not error if the value is a feature", function(){
			lay1.__ensureIsAFeature(feat1);
		});
		it("Should error if the value is not a feature", function(){
			(function() { lay1.__ensureIsAFeature("foo")}).should.throwError();
			(function() { lay1.__ensureIsAFeature(dev1)}).should.throwError();
			(function() { lay1.__ensureIsAFeature(lay2)}).should.throwError();
		});
	});

	describe("#removeFeature", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should let the user remove a feature", function(){
			lay1.featureCount.should.equal(0);
			lay1.addFeature(feat1);
			lay1.removeFeature(feat1);
			lay1.featureCount.should.equal(0);
		});
		it("should not let the user remove a feature by ID", function(){
			lay1.addFeature(feat1);
			(function() { lay1.removeFeature(feat1.id)}).should.throwError();
		});
		it("should not let the user remove a feature when empty", function(){
			(function() { lay1.removeFeature(feat1)}).should.throwError();
		});
		it("should not let the user remove a feature that does not exist", function(){
			lay1.addFeature(feat1);
			(function() { lay1.removeFeature(feat2)}).should.throwError();
		});
	});


	describe("#containsFeature", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should return true if the feature exists in the layer", function(){
			lay1.addFeature(feat1);
			lay1.containsFeature(feat1).should.equal(true);
			lay1.addFeature(feat2);
			lay1.containsFeature(feat2).should.equal(true);
		});
		it("should return false if the feature does not exist in the layer", function(){
			lay1.containsFeature(feat1).should.equal(false);
			lay1.addFeature(feat1);
			lay1.containsFeature(feat2).should.equal(false);
		});
		it("should return true after a feature has been added", function(){
			lay1.containsFeature(feat1).should.equal(false);
			lay1.addFeature(feat1);
			lay1.containsFeature(feat1).should.equal(true);
		});
		it("should not allow the user to check for the presence of something other than a feature", function(){
			(function() { lay1.containsFeature("foo")}).should.throwError();
			(function() { lay1.containsFeature(12)}).should.throwError();
			(function() { lay1.containsFeature("featureID")}).should.throwError();
			(function() { lay1.containsFeature(dev1)}).should.throwError();
		});
	});

	describe("#getFeature", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("should return a feature when passed an ID", function(){
			lay1.addFeature(feat1);
			lay1.getFeature(feat1.id).should.be.exactly(feat1);
		});
		it("should not allow the user to retrieve a feature for an ID that does not exist in the layer", function(){
			(function() { lay1.containsFeature(dev1)}).should.throwError();
		});
	});
});

describe("Feature", function(){
	describe("#init", function(){
		it("should be given a unique ID on initialization", function(){
			feat1.id.should.not.equal(feat2.id);
		});
	});
});