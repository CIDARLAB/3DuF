var Params = require('./params');
var Parameters = require('./parameters');
var Parameter = require("./parameter");
var StringValue = Parameters.StringValue;
var FeatureSets = require("../featureSets");
var Registry = require("./registry");
import Feature from "./feature";

export default class EdgeFeature extends Feature{
    constructor(edgeObjects, params, id = Feature.generateID()){
        super("EDGE", "Basic", params, id, id, "EDGE");
        if(edgeObjects){
            this.__edgeObjects = edgeObjects;
        }else{
            this.__edgeObjects = [];
        }
    }

}
