var PositionTool = require('./positionTool');
var Registry = require("../../core/registry");
var Feature = require("../../core/feature");
var SimpleQueue = require("../../utils/simpleQueue");
var PageSetup = require("../pageSetup");

class MultilayerPositionTool extends PositionTool{
    constructor(typeString, setString){
        super(typeString, setString);
    }

    createNewFeature(point){
        console.log("test");
        let flowlayer = Registry.currentDevice.layers[0];
        let controllayer = Registry.currentDevice.layers[1];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();
        flowlayer.addFeature(newFeature);

        newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();
        controllayer.addFeature(newFeature);
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