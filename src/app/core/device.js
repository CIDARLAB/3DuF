var appRoot = "../";
var values = require('./values.js');
var Params = values.Params;
var Parameters = require(appRoot + "core/parameters");
var Feature = require('./feature')
var Layer = require('./layer');
var Group = require('./group');

var StringValue = Parameters.StringValue;
var FloatValue = Parameters.FloatValue;

/* The Device stores information about a design. */
class Device {
    constructor(width, height, name = "New Device") {
        this.defaults = {};
        this.layers = [];
        this.groups = [];
        this.params = {};
        this.name = new StringValue(name);
        this.params.width = new FloatValue(width);
        this.params.height = new FloatValue(height);
    }

    /* Sort the layers such that they are ordered from lowest to highest z_offset. */
    sortLayers() {
        this.layers.sort(function(a, b) {
            return a.params.z_offset.value - b.params.z_offset.value;
        });
    }

    /* Add a layer, and re-sort the layers array.*/
    addLayer(layer) {
        this.layers.push(layer);
        this.sortLayers();
    }

    addGroup(group) {
        this.groups.push(group);
        //TODO: Check to make sure that's OK!
    }

    addDefault(def) {
        this.defaults.push(def);
        //TODO: Establish what defaults are. Params?
    }

    __groupsToJSON() {
        let output = [];
        for (let i in this.groups) {
            output.push(this.groups[i].toJSON());
        }
        return output;
    }

    __layersToJSON() {
        let output = [];
        for (let i in this.layers) {
            output.push(this.layers[i].toJSON());
        }
        return output;
    }

    __loadLayersFromJSON(json) {
        for (let i in json) {
            this.addLayer(Layer.fromJSON(json[i]));
        }
    }

    //TODO: Figure this out!
    __loadGroupsFromJSON(json) {
        /*
        for (let i in json){
            this.addGroup(Group.fromJSON(json[i]));
        }
        */
    }

    //TODO: Figure this out!
    __loadDefaultsFromJSON(json) {
        /*
        for(let i in json){
            this.addDefault(json[i]);
        }
        */
    }

    //TODO: Replace Params and remove static method
    toJSON() {
        let output = {};
        output.name = this.name.toJSON();
        output.params = Params.toJSON(this.params);
        output.layers = this.__layersToJSON();
        output.groups = this.__groupsToJSON();
        output.defaults = this.defaults;
        return output;
    }

    static fromJSON(json) {
        let params = Params.fromJSON(json.params);
        let name = values.JSONToParam(json.name).value;
        let defaults = json.defaults;
        let newDevice = new Device(params.width.value, params.height.value, name);
        newDevice.__loadLayersFromJSON(json.layers);
        newDevice.__loadGroupsFromJSON(json.groups);
        newDevice.__loadDefaultsFromJSON(json.defaults);
        return newDevice;
    }
}

module.exports = Device;