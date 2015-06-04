(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var big_ugly_JSON = JSON.parse('{"device": {"name": "transposer_med", "height": 51, "width": 75.8}, "layers": {"c": {"features": ["urn:uuid:7b2f768e-e99f-473d-bc73-47985ee9b0cf", "urn:uuid:7b2f768e-e99f-473d-bc73-47985ee9b0cf", "urn:uuid:946d6532-cf34-4b1d-8675-d93f6b998104", "urn:uuid:946d6532-cf34-4b1d-8675-d93f6b998104", "urn:uuid:0e110548-170e-44cd-9473-1f525ac75c1d", "urn:uuid:0e110548-170e-44cd-9473-1f525ac75c1d", "urn:uuid:55371b2e-150b-4a80-9256-e5b8d7f96c2c", "urn:uuid:55371b2e-150b-4a80-9256-e5b8d7f96c2c", "urn:uuid:5432fd20-c4d8-4e0f-a32b-81867f7a3ff0", "urn:uuid:5432fd20-c4d8-4e0f-a32b-81867f7a3ff0", "urn:uuid:6875b5c1-bd5d-4aca-86b0-97b1bdf24e22", "urn:uuid:6875b5c1-bd5d-4aca-86b0-97b1bdf24e22", "urn:uuid:6a907a99-0bb0-4538-89a6-1c44ff312894", "urn:uuid:6a907a99-0bb0-4538-89a6-1c44ff312894", "urn:uuid:2865a2cd-28c5-42f3-bb0d-4cc91438fb4f", "urn:uuid:2865a2cd-28c5-42f3-bb0d-4cc91438fb4f", "urn:uuid:82e731f3-0452-487b-b694-f33b5acff542", "urn:uuid:82e731f3-0452-487b-b694-f33b5acff542", "urn:uuid:d363683a-d9ac-4980-9d88-8526d6d9dffb", "urn:uuid:d363683a-d9ac-4980-9d88-8526d6d9dffb", "urn:uuid:daeb8b02-782d-48c9-b25d-07043f575c3e", "urn:uuid:daeb8b02-782d-48c9-b25d-07043f575c3e", "urn:uuid:cb4af447-a432-4991-a3db-d58aec3404c2", "urn:uuid:ef6f7d5a-6c6e-40c6-9d53-b39c375f6d14", "urn:uuid:a1b87ff2-1e13-4dc8-bdca-522f47f9a18c", "urn:uuid:38af6c40-ef06-412a-84c4-3b71e5a22f23", "urn:uuid:56cdc545-3fcc-42f0-b9b9-fd3672117808", "urn:uuid:f04653e7-4656-4f2c-8124-983e927b76f4", "urn:uuid:23f653c3-d221-4be0-8e66-d77fbb65674e", "urn:uuid:27f42484-b4b4-4acb-b515-d8e68e7bcd8a", "urn:uuid:fb47ba73-2ead-4fb6-87d4-679f38492f97", "urn:uuid:da122f20-5a39-4378-bf4c-43047f704138", "urn:uuid:7d7379b5-35b4-4a53-9de0-542987c8d881", "urn:uuid:128bd93d-ca0f-4320-b77b-98b660ecee3c", "urn:uuid:68387756-9e52-412c-a91b-c67563e300ba", "urn:uuid:1105d850-f116-449f-989d-82950af38d00"], "ID": "c", "flip": true, "color": "Red", "z_offset": 1.2}, "f": {"features": ["urn:uuid:a07eb02c-1491-44ca-b219-f05f6eea35e7", "urn:uuid:a07eb02c-1491-44ca-b219-f05f6eea35e7", "urn:uuid:48666511-d02a-4440-b901-2448de91f9f3", "urn:uuid:48666511-d02a-4440-b901-2448de91f9f3", "urn:uuid:0d13a06f-2af6-4a69-9f94-47b48fafd9f4", "urn:uuid:0d13a06f-2af6-4a69-9f94-47b48fafd9f4", "urn:uuid:9328da25-a0b7-4e25-9575-039b3bf6f556", "urn:uuid:9328da25-a0b7-4e25-9575-039b3bf6f556", "urn:uuid:c5ac53af-fd28-40ef-b99d-ca06c129ed32", "urn:uuid:c5ac53af-fd28-40ef-b99d-ca06c129ed32", "urn:uuid:f9179d54-62ca-492c-8b6c-589d5617f4fe", "urn:uuid:80e5b6c2-87d8-4f90-a7a5-1cb4bb6d336e", "urn:uuid:40e7709b-75c4-4eeb-901b-e2dfc3b3dffd", "urn:uuid:9d3c60bb-b473-4b03-a5c3-321697dce0fc", "urn:uuid:1a4dd466-ad47-476c-a75a-60d0bdb8fc1e", "urn:uuid:8b93590b-4ebe-4b93-a464-d874436e7186", "urn:uuid:f1905afe-254c-4651-aabe-3c37c47bc939", "urn:uuid:3ff94e71-6db9-4c97-909b-7b483d467a1a", "urn:uuid:6781df12-2f32-4002-9604-4ec71aaed8e5", "urn:uuid:3498af49-23df-49cc-909c-8dab3d4907c7", "urn:uuid:b48c3cb1-3e23-4f4f-a867-c044ee6f7cf7", "urn:uuid:9aff3255-d094-4eee-bc46-5accbb3d2f43", "urn:uuid:dfafadb4-18e0-4375-8455-a25a65acd55c", "urn:uuid:a989e9b2-370c-4422-bfd9-47bad317246b"], "ID": "f", "flip": false, "color": "Blue", "z_offset": 0}}, "features": {"urn:uuid:0d13a06f-2af6-4a69-9f94-47b48fafd9f4": {"ID": "urn:uuid:0d13a06f-2af6-4a69-9f94-47b48fafd9f4", "type": "channel", "layer": "f", "feature_params": {"start": [40.21, 20], "width": 0.41, "height": 0.1, "end": [40.21, 31.02]}}, "urn:uuid:5432fd20-c4d8-4e0f-a32b-81867f7a3ff0": {"ID": "urn:uuid:5432fd20-c4d8-4e0f-a32b-81867f7a3ff0", "type": "channel", "layer": "c", "feature_params": {"start": [40.21, 28.415], "width": 0.41, "height": 0.1, "end": [49.015, 28.415]}}, "urn:uuid:23f653c3-d221-4be0-8e66-d77fbb65674e": {"ID": "urn:uuid:23f653c3-d221-4be0-8e66-d77fbb65674e", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [47.92, 20]}}, "urn:uuid:fb47ba73-2ead-4fb6-87d4-679f38492f97": {"ID": "urn:uuid:fb47ba73-2ead-4fb6-87d4-679f38492f97", "type": "valve", "layer": "c", "feature_params": {"radius2": 1.2, "radius1": 1.4, "height": 0.8999999999999999, "position": [37.11, 20]}}, "urn:uuid:a07eb02c-1491-44ca-b219-f05f6eea35e7": {"ID": "urn:uuid:a07eb02c-1491-44ca-b219-f05f6eea35e7", "type": "channel", "layer": "f", "feature_params": {"start": [30, 20], "width": 0.41, "height": 0.1, "end": [50.42, 20]}}, "urn:uuid:6a907a99-0bb0-4538-89a6-1c44ff312894": {"ID": "urn:uuid:6a907a99-0bb0-4538-89a6-1c44ff312894", "type": "channel", "layer": "c", "feature_params": {"start": [37.11, 20], "width": 0.41, "height": 0.1, "end": [31.405, 20]}}, "urn:uuid:1a4dd466-ad47-476c-a75a-60d0bdb8fc1e": {"ID": "urn:uuid:1a4dd466-ad47-476c-a75a-60d0bdb8fc1e", "type": "via", "layer": "f", "feature_params": {"radius2": 0.7, "radius1": 0.8, "height": 1.0999999999999999, "position": [34.010000000000005, 25.509999999999998]}}, "urn:uuid:1105d850-f116-449f-989d-82950af38d00": {"ID": "urn:uuid:1105d850-f116-449f-989d-82950af38d00", "type": "valve", "layer": "c", "feature_params": {"radius2": 1.2, "radius1": 1.4, "height": 0.8999999999999999, "position": [46.41, 28.415]}}, "urn:uuid:38af6c40-ef06-412a-84c4-3b71e5a22f23": {"ID": "urn:uuid:38af6c40-ef06-412a-84c4-3b71e5a22f23", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [30, 31.02]}}, "urn:uuid:daeb8b02-782d-48c9-b25d-07043f575c3e": {"ID": "urn:uuid:daeb8b02-782d-48c9-b25d-07043f575c3e", "type": "channel", "layer": "c", "feature_params": {"start": [49.015, 22.605], "width": 0.41, "height": 0.1, "end": [50.42, 22.605]}}, "urn:uuid:f1905afe-254c-4651-aabe-3c37c47bc939": {"ID": "urn:uuid:f1905afe-254c-4651-aabe-3c37c47bc939", "type": "via", "layer": "f", "feature_params": {"radius2": 0.7, "radius1": 0.8, "height": 1.0999999999999999, "position": [30, 20]}}, "urn:uuid:7b2f768e-e99f-473d-bc73-47985ee9b0cf": {"ID": "urn:uuid:7b2f768e-e99f-473d-bc73-47985ee9b0cf", "type": "channel", "layer": "c", "feature_params": {"start": [34.010000000000005, 25.509999999999998], "width": 0.41, "height": 0.1, "end": [46.41, 25.509999999999998]}}, "urn:uuid:ef6f7d5a-6c6e-40c6-9d53-b39c375f6d14": {"ID": "urn:uuid:ef6f7d5a-6c6e-40c6-9d53-b39c375f6d14", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [46.41, 25.509999999999998]}}, "urn:uuid:f9179d54-62ca-492c-8b6c-589d5617f4fe": {"ID": "urn:uuid:f9179d54-62ca-492c-8b6c-589d5617f4fe", "type": "port", "layer": "f", "feature_params": {"radius": 0.7, "height": 0.1, "position": [30, 20]}}, "urn:uuid:a1b87ff2-1e13-4dc8-bdca-522f47f9a18c": {"ID": "urn:uuid:a1b87ff2-1e13-4dc8-bdca-522f47f9a18c", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [30, 20]}}, "urn:uuid:2865a2cd-28c5-42f3-bb0d-4cc91438fb4f": {"ID": "urn:uuid:2865a2cd-28c5-42f3-bb0d-4cc91438fb4f", "type": "channel", "layer": "c", "feature_params": {"start": [31.405, 31.02], "width": 0.41, "height": 0.1, "end": [43.31, 31.02]}}, "urn:uuid:a989e9b2-370c-4422-bfd9-47bad317246b": {"ID": "urn:uuid:a989e9b2-370c-4422-bfd9-47bad317246b", "type": "standoff", "layer": "f", "feature_params": {"radius2": 1.2, "radius1": 1.2, "height": 1.2, "position": [3, 48]}}, "urn:uuid:3ff94e71-6db9-4c97-909b-7b483d467a1a": {"ID": "urn:uuid:3ff94e71-6db9-4c97-909b-7b483d467a1a", "type": "via", "layer": "f", "feature_params": {"radius2": 0.7, "radius1": 0.8, "height": 1.0999999999999999, "position": [30, 31.02]}}, "urn:uuid:3498af49-23df-49cc-909c-8dab3d4907c7": {"ID": "urn:uuid:3498af49-23df-49cc-909c-8dab3d4907c7", "type": "via", "layer": "f", "feature_params": {"radius2": 0.7, "radius1": 0.8, "height": 1.0999999999999999, "position": [50.42, 31.02]}}, "urn:uuid:f04653e7-4656-4f2c-8124-983e927b76f4": {"ID": "urn:uuid:f04653e7-4656-4f2c-8124-983e927b76f4", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [50.42, 31.02]}}, "urn:uuid:40e7709b-75c4-4eeb-901b-e2dfc3b3dffd": {"ID": "urn:uuid:40e7709b-75c4-4eeb-901b-e2dfc3b3dffd", "type": "port", "layer": "f", "feature_params": {"radius": 0.7, "height": 0.1, "position": [50.42, 20]}}, "urn:uuid:c5ac53af-fd28-40ef-b99d-ca06c129ed32": {"ID": "urn:uuid:c5ac53af-fd28-40ef-b99d-ca06c129ed32", "type": "channel", "layer": "f", "feature_params": {"start": [46.41, 31.02], "width": 0.41, "height": 0.1, "end": [46.41, 25.509999999999998]}}, "urn:uuid:82e731f3-0452-487b-b694-f33b5acff542": {"ID": "urn:uuid:82e731f3-0452-487b-b694-f33b5acff542", "type": "channel", "layer": "c", "feature_params": {"start": [31.405, 20], "width": 0.41, "height": 0.1, "end": [31.405, 31.02]}}, "urn:uuid:946d6532-cf34-4b1d-8675-d93f6b998104": {"ID": "urn:uuid:946d6532-cf34-4b1d-8675-d93f6b998104", "type": "channel", "layer": "c", "feature_params": {"start": [40.21, 28.415], "width": 0.41, "height": 0.1, "end": [46.41, 28.415]}}, "urn:uuid:b48c3cb1-3e23-4f4f-a867-c044ee6f7cf7": {"ID": "urn:uuid:b48c3cb1-3e23-4f4f-a867-c044ee6f7cf7", "type": "standoff", "layer": "f", "feature_params": {"radius2": 1.2, "radius1": 1.2, "height": 1.2, "position": [3, 3]}}, "urn:uuid:9d3c60bb-b473-4b03-a5c3-321697dce0fc": {"ID": "urn:uuid:9d3c60bb-b473-4b03-a5c3-321697dce0fc", "type": "port", "layer": "f", "feature_params": {"radius": 0.7, "height": 0.1, "position": [50.42, 31.02]}}, "urn:uuid:8b93590b-4ebe-4b93-a464-d874436e7186": {"ID": "urn:uuid:8b93590b-4ebe-4b93-a464-d874436e7186", "type": "via", "layer": "f", "feature_params": {"radius2": 0.7, "radius1": 0.8, "height": 1.0999999999999999, "position": [46.41, 25.509999999999998]}}, "urn:uuid:6781df12-2f32-4002-9604-4ec71aaed8e5": {"ID": "urn:uuid:6781df12-2f32-4002-9604-4ec71aaed8e5", "type": "via", "layer": "f", "feature_params": {"radius2": 0.7, "radius1": 0.8, "height": 1.0999999999999999, "position": [50.42, 20]}}, "urn:uuid:dfafadb4-18e0-4375-8455-a25a65acd55c": {"ID": "urn:uuid:dfafadb4-18e0-4375-8455-a25a65acd55c", "type": "standoff", "layer": "f", "feature_params": {"radius2": 1.2, "radius1": 1.2, "height": 1.2, "position": [72.8, 48]}}, "urn:uuid:9328da25-a0b7-4e25-9575-039b3bf6f556": {"ID": "urn:uuid:9328da25-a0b7-4e25-9575-039b3bf6f556", "type": "channel", "layer": "f", "feature_params": {"start": [34.010000000000005, 20], "width": 0.41, "height": 0.1, "end": [34.010000000000005, 25.509999999999998]}}, "urn:uuid:d363683a-d9ac-4980-9d88-8526d6d9dffb": {"ID": "urn:uuid:d363683a-d9ac-4980-9d88-8526d6d9dffb", "type": "channel", "layer": "c", "feature_params": {"start": [31.405, 20], "width": 0.41, "height": 0.1, "end": [47.92, 20]}}, "urn:uuid:0e110548-170e-44cd-9473-1f525ac75c1d": {"ID": "urn:uuid:0e110548-170e-44cd-9473-1f525ac75c1d", "type": "channel", "layer": "c", "feature_params": {"start": [40.21, 22.605], "width": 0.41, "height": 0.1, "end": [34.010000000000005, 22.605]}}, "urn:uuid:128bd93d-ca0f-4320-b77b-98b660ecee3c": {"ID": "urn:uuid:128bd93d-ca0f-4320-b77b-98b660ecee3c", "type": "valve", "layer": "c", "feature_params": {"radius2": 1.2, "radius1": 1.4, "height": 0.8999999999999999, "position": [40.21, 28.415]}}, "urn:uuid:6875b5c1-bd5d-4aca-86b0-97b1bdf24e22": {"ID": "urn:uuid:6875b5c1-bd5d-4aca-86b0-97b1bdf24e22", "type": "channel", "layer": "c", "feature_params": {"start": [49.015, 22.605], "width": 0.41, "height": 0.1, "end": [49.015, 28.415]}}, "urn:uuid:7d7379b5-35b4-4a53-9de0-542987c8d881": {"ID": "urn:uuid:7d7379b5-35b4-4a53-9de0-542987c8d881", "type": "valve", "layer": "c", "feature_params": {"radius2": 1.2, "radius1": 1.4, "height": 0.8999999999999999, "position": [40.21, 22.605]}}, "urn:uuid:56cdc545-3fcc-42f0-b9b9-fd3672117808": {"ID": "urn:uuid:56cdc545-3fcc-42f0-b9b9-fd3672117808", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [50.42, 20]}}, "urn:uuid:80e5b6c2-87d8-4f90-a7a5-1cb4bb6d336e": {"ID": "urn:uuid:80e5b6c2-87d8-4f90-a7a5-1cb4bb6d336e", "type": "port", "layer": "f", "feature_params": {"radius": 0.7, "height": 0.1, "position": [30, 31.02]}}, "urn:uuid:9aff3255-d094-4eee-bc46-5accbb3d2f43": {"ID": "urn:uuid:9aff3255-d094-4eee-bc46-5accbb3d2f43", "type": "standoff", "layer": "f", "feature_params": {"radius2": 1.2, "radius1": 1.2, "height": 1.2, "position": [72.8, 3]}}, "urn:uuid:da122f20-5a39-4378-bf4c-43047f704138": {"ID": "urn:uuid:da122f20-5a39-4378-bf4c-43047f704138", "type": "valve", "layer": "c", "feature_params": {"radius2": 1.2, "radius1": 1.4, "height": 0.8999999999999999, "position": [43.31, 31.02]}}, "urn:uuid:68387756-9e52-412c-a91b-c67563e300ba": {"ID": "urn:uuid:68387756-9e52-412c-a91b-c67563e300ba", "type": "valve", "layer": "c", "feature_params": {"radius2": 1.2, "radius1": 1.4, "height": 0.8999999999999999, "position": [34.010000000000005, 22.605]}}, "urn:uuid:55371b2e-150b-4a80-9256-e5b8d7f96c2c": {"ID": "urn:uuid:55371b2e-150b-4a80-9256-e5b8d7f96c2c", "type": "channel", "layer": "c", "feature_params": {"start": [40.21, 22.605], "width": 0.41, "height": 0.1, "end": [49.015, 22.605]}}, "urn:uuid:cb4af447-a432-4991-a3db-d58aec3404c2": {"ID": "urn:uuid:cb4af447-a432-4991-a3db-d58aec3404c2", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [34.010000000000005, 25.509999999999998]}}, "urn:uuid:48666511-d02a-4440-b901-2448de91f9f3": {"ID": "urn:uuid:48666511-d02a-4440-b901-2448de91f9f3", "type": "channel", "layer": "f", "feature_params": {"start": [30, 31.02], "width": 0.41, "height": 0.1, "end": [50.42, 31.02]}}, "urn:uuid:27f42484-b4b4-4acb-b515-d8e68e7bcd8a": {"ID": "urn:uuid:27f42484-b4b4-4acb-b515-d8e68e7bcd8a", "type": "port", "layer": "c", "feature_params": {"radius": 0.7, "height": 0.1, "position": [50.42, 22.605]}}}}');

var Feature = (function () {
	function Feature(featureData) {
		_classCallCheck(this, Feature);

		this.ID = Feature.__parseOptionalID(featureData);
		this.color = Feature.__parseOptionalColor(featureData);
		this.type = featureData.type;
		this.params = featureData.params;
		this.layer = null;
	}

	_createClass(Feature, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				ID: this.ID,
				color: this.color,
				type: this.type,
				layer: this.layer.ID,
				feature_params: this.params
			};
		}
	}], [{
		key: 'generateID',

		//From: http://byronsalau.com/blog/how-to-create-a-guid-uuid-in-javascript/
		value: function generateID() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				    v = c === 'x' ? r : r & 3 | 8;
				return v.toString(16);
			});
		}
	}, {
		key: '__fromJSON',
		value: function __fromJSON(featureJSON) {
			var feat = new Feature({
				ID: featureJSON.ID,
				color: featureJSON.color,
				type: featureJSON.type,
				params: featureJSON.feature_params });
			return feat;
		}
	}, {
		key: '__parseOptionalColor',
		value: function __parseOptionalColor(featureData) {
			if (featureData.hasOwnProperty('color') && featureData.color != undefined && featureData.color != null) {
				return featureData.color;
			} else {
				return 'layer';
			}
		}
	}, {
		key: '__parseOptionalID',
		value: function __parseOptionalID(featureData) {
			if (featureData.hasOwnProperty('ID')) {
				return featureData.ID;
			} else {
				return Feature.generateID();
			}
		}
	}]);

	return Feature;
})();

var Layer = (function () {
	function Layer(layerData) {
		_classCallCheck(this, Layer);

		this.color = layerData.color;
		this.ID = layerData.ID;
		this.ZOffset = layerData.z_offset;
		this.features = [];
		this.device = null;
	}

	_createClass(Layer, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				features: this.featuresToJSON(),
				z_offset: this.ZOffset,
				ID: this.ID
			};
		}
	}, {
		key: 'addFeature',
		value: function addFeature(feature) {
			feature.layer = this;
			this.features.push(feature);
			this.device.__addFeature(feature);
			return feature;
		}
	}, {
		key: 'featuresToJSON',
		value: function featuresToJSON() {
			var data = [];
			for (var feature in this.features) {
				data.push(this.features[feature].ID);
			}
			return data;
		}
	}], [{
		key: '__fromJSON',
		value: function __fromJSON(layerJSON) {
			return new Layer({
				color: layerJSON.color,
				ID: layerJSON.ID,
				z_offset: layerJSON.z_offset
			});
		}
	}]);

	return Layer;
})();

var Device = (function () {
	function Device(deviceData) {
		_classCallCheck(this, Device);

		this.height = deviceData.height;
		this.width = deviceData.width;
		this.ID = deviceData.ID;
		this.layers = {};
		this.features = {};
	}

	_createClass(Device, [{
		key: 'addLayer',
		value: function addLayer(layer) {
			if (this.layers.hasOwnProperty(layer.ID)) {
				throw 'layer ID ' + layer.ID + ' already exists in device ' + this.ID;
			} else {
				this.layers[layer.ID] = layer;
				layer.device = this;
			}
			return layer;
		}
	}, {
		key: '__addFeature',
		value: function __addFeature(feature) {
			if (this.features.hasOwnProperty(feature.ID)) {

				throw 'Feature with ID ' + feature.ID + ' already exists in device ' + this.ID;
			} else if (!this.layers.hasOwnProperty(feature.layer.ID)) {
				throw 'Layer ' + feature.layer.ID + ' does not exist in device ' + this.ID;
			} else {
				this.features[feature.ID] = feature;
			}
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return {
				device_data: this.deviceData,
				layers: this.layersToJSON(),
				features: this.featuresToJSON() };
		}
	}, {
		key: 'featuresToJSON',
		value: function featuresToJSON() {
			var data = {};
			for (var featureID in this.features) {
				data[featureID] = this.features[featureID].toJSON();
			}
			return data;
		}
	}, {
		key: 'layersToJSON',
		value: function layersToJSON() {
			var data = {};
			for (var layerID in this.layers) {
				data[layerID] = this.layers[layerID].toJSON();
			}
			return data;
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(deviceJSON) {
			var devData = {
				height: deviceJSON.device.height,
				width: deviceJSON.device.width,
				ID: deviceJSON.device.name };
			var dev = new Device(devData);

			for (var layerID in deviceJSON.layers) {
				dev.addLayer(Layer.__fromJSON(deviceJSON.layers[layerID]));
			}

			for (var featureID in deviceJSON.features) {
				var featData = deviceJSON.features[featureID];
				dev.layers[featData.layer].addFeature(Feature.__fromJSON(featData));
			}
			return dev;
		}
	}]);

	return Device;
})();

//var foo = Device.fromJSON(big_ugly_JSON);

var foo = new Device({ width: 30, height: 20, ID: 'foo' });
var lay = new Layer({ z_offset: 1.3, ID: 'bar', color: 'blue' });
foo.addLayer(lay);
var feat1 = new Feature({ type: 'channel', params: { someParam: 'whatever' } });
lay.addFeature(feat1);

console.log(JSON.stringify(foo.toJSON()));

},{}]},{},[1]);
