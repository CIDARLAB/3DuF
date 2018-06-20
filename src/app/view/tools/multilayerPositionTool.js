var PositionTool = require('./positionTool');
var Registry = require("../../core/registry");
//var Feature = require("../../core/feature");
import Feature from '../../core/feature';
var SimpleQueue = require("../../utils/simpleQueue");
var PageSetup = require("../pageSetup");

class MultilayerPositionTool extends PositionTool{
    constructor(typeString, setString){
        super(typeString, setString);
    }

    createNewFeature(point){
        let featureIDs = [];
        let flowlayer = Registry.currentDevice.layers[0];
        let controllayer = Registry.currentDevice.layers[1];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();
        flowlayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        let newtypestring = this.typeString + "_control";
        let paramstoadd = newFeature.getParams();
        newFeature = Feature.makeFeature(newtypestring, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.getID();
        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        super.createNewComponent(this.typeString, params_to_copy, featureIDs );
    }

    static getTarget(point){
        let target = Registry.viewManager.snapToGrid(point);
        return [target.x, target.y];
    }

    showTarget(){
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }
}

module.exports = MultilayerPositionTool;