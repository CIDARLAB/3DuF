var device = require('../app/core/device');
var should = require('should');
var values = require('../app/core/values');

var dev ;
var lay1;
var lay2;
var feat1;
var feat2;
var params1;
var layerParams;

var initDevice = function(){
	dev = new device.Device(50,60,"dev1");
	lay1 = new device.Layer(0,false,"layer1");
	lay2 = new device.Layer(1.2,true,"layer2");
	params1 = {
		"width": new values.FloatValue(1,3),
		"otherParam": new values.StringValue("foobar")
	};
	layerParams = {
		"z_offset": {
			"type": values.FloatValue.typeString(),
			"value": .2
		},
		"flip": {
			"type": values.BooleanValue.typeString(),
			"value": false
		}
	}
	feat1 = new device.Feature("type1", params1, new values.StringValue("feat1"));
	feat2 = new device.Feature("type2", params1, new values.StringValue("feat2"));
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
			dev.name.value.should.equal("dev1");
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

	describe("#toJSON", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("can output JSON with no layers or groups", function(){
			dev.toJSON();
		});
		it("can output JSON with one layer, no groups", function(){
			dev.addLayer(lay1);
			dev.toJSON();
		});
		it("can output JSON with two layers, no groups", function(){
			dev.addLayer(lay1);
			dev.addLayer(lay2);
			dev.toJSON();
		});
		it("can output JSON with layers and groups");
		it("can output JSON with layers which contain features", function(){
			dev.addLayer(lay1);
			lay1.addFeature(feat1);
			dev.addLayer(lay2);
			lay2.addFeature(feat2);
			dev.toJSON();
		});
	});

	describe("#fromJSON", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("can load a device from valid JSON", function(){
			lay1.addFeature(feat1);
			lay2.addFeature(feat2);
			let json = {
				"params": {
					"width": {
						"type": values.FloatValue.typeString(),
						"value": 59
					},
					"height": {
						"type": values.FloatValue.typeString(),
						"value": 23.5
					}
				},
				"name": {
					"type": values.StringValue.typeString(),
					"value": "myDevice"
				},
				"groups": [],
				"defaults": {},
				"layers": {
					"lay1": lay1.toJSON(),
					"lay2": lay2.toJSON()
				}
			};
			let dev2 = device.Device.fromJSON(json);
		});
		it("can load a Device from the output of toJSON", function(){
			dev.addLayer(lay1);
			dev.addLayer(lay2);
			lay1.addFeature(feat1);
			lay2.addFeature(feat2);
			let json = dev.toJSON();
			let dev2 = device.Device.fromJSON(json);
		});
		it("cannot load a device from malformed JSON", function(){
			let json = {
				"params": {
					"height": {
						"type": values.FloatValue.typeString(),
						"value": 23.5
					}
				},
				"name": {
					"type": values.StringValue.typeString(),
					"value": "myDevice"
				},
				"layers": {
					"lay1": lay1.toJSON(),
					"lay2": lay2.toJSON()
				}
			}
			let dev2;
			(function(){dev2 = device.Device.fromJSON(json)}).should.throwError();
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
			lay1.name.value.should.equal("layer1");

			lay2.params.z_offset.value.should.equal(1.2);
			lay2.params.flip.value.should.equal(true);
			lay2.name.value.should.equal("layer2");
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

	describe("#toJSON", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("can produce JSON when empty", function(){
			lay1.toJSON();
		});
		it("can produce JSON when containing a feature", function(){
			lay1.addFeature(feat1);
			lay1.toJSON();
		});
		it("can produce JSON when containing multiple features", function(){
			lay1.addFeature(feat1);
			lay1.addFeature(feat2);
			lay1.toJSON();
		});
	});

	describe("#fromJSON", function(){
		beforeEach(function initialize(){
			initDevice();
		});
		it("can construct a Layer from valid JSON", function(){
			let json = {
				"name": {
					"type": values.StringValue.typeString(),
					"value": "layer3"
				},
				"params": layerParams,
				"features": {
					"feat1": feat1.toJSON()
				}
			};

			let lay3 = device.Layer.fromJSON(json);
		});
		it("cannot construct a layer form invalid JSON", function(){
			let json = {
				"name": {
					"type": values.StringValue.typeString(),
					"value": "layer3"
				},
				"params": layerParams
			}
			let lay3;
			(function() {lay3 = device.Layer.fromJSON(json)}).should.throwError();
		});
		it("can construct a layer from the output of toJSON", function(){
			let json = lay2.toJSON();
			let lay3 = device.Layer.fromJSON(json);
		});
	});
});

describe("Feature", function(){
	describe("#init", function(){
		it("should be given a unique ID on initialization", function(){
			feat1.id.should.not.equal(feat2.id);
		});
		it("can be initalized with type and params", function(){
			let feat3 = new device.Feature("type1", params1);
		});
		it("can be initalized with type, params, and name", function(){
			let feat3 = new device.Feature("type1", params1, new values.StringValue("feat3"));
		});
	});

	describe("#toJSON", function(){
		it("can produce JSON when containing multiple parameters", function(){
			feat1.toJSON();
			feat2.toJSON();
		});
	});

	describe("#fromJSON", function(){
		it("can produce a Feature from valid JSON", function(){
			let json = {
				"id": "someValue",
				"type": "someType", 
				"params": {
					"width": {
						"type": values.FloatValue.typeString(),
						"value": 5.1
					},
					"height": {
						"type": values.IntegerValue.typeString(),
						"value": 3
					}
				},
				"name": {
					"type": values.StringValue.typeString(),
					"value": "foobar"
				}
			}
			let feat3 = device.Feature.fromJSON(json);
		});
		it("can produce a Feature from the output of toJSON", function(){
			let json = feat2.toJSON();
			let feat3 = device.Feature.fromJSON(json);
		});
		it("cannot produce a Feature from invalid JSON", function(){
			let json = {
				"params": {
					"width": {
						"type": values.FloatValue.typeString(),
						"value": 5.1
					},
					"height": {
						"type": values.IntegerValue.typeString(),
						"value": 3
					}
				}
			}
			let feat;
			(function() { feat = device.Feature.fromJSON(json)}).should.throwError();
		});
	});
});