var MouseTool = require("./mouseTool");
var Registry = require("../../core/registry");
//var Feature = require("../../core/feature");
import Feature from '../../core/feature';
var SimpleQueue = require("../../utils/simpleQueue");
var PageSetup = require("../pageSetup");
var PositionTool = require('./positionTool');

class ComponentPositionTool extends PositionTool{
    constructor(typeString, setString){
        super(typeString, setString);
    }

    createNewFeature(point){

        let featureIDs = [];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();


        Registry.currentLayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();


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

module.exports = ComponentPositionTool;