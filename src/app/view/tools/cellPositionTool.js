var PositionTool = require('./positionTool');
var Registry = require("../../core/registry");
var Feature = require("../../core/feature");
var SimpleQueue = require("../../utils/simpleQueue");
var PageSetup = require("../pageSetup");

class CellPositionTool extends PositionTool{
    constructor(typeString, setString){
        super(typeString, setString);
    }

    createNewFeature(point){
        let flowlayer = Registry.currentDevice.layers[0];
        let cell_layer = Registry.currentDevice.layers[2];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();
        flowlayer.addFeature(newFeature);
        let newtypestring = this.typeString + "_cell";
        let paramstoadd = newFeature.getParams();
        newFeature = Feature.makeFeature(newtypestring, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.getID();
        cell_layer.addFeature(newFeature);
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

module.exports = CellPositionTool;