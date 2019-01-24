import PositionTool from "./positionTool";
const Registry = require("../../core/registry");
import Feature from '../../core/feature';

export default class ComponentPositionTool extends PositionTool{
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
        Registry.viewManager.saveDeviceState();


    }

    showTarget(){
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }
}
