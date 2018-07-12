var MouseTool = require("./mouseTool");
var Registry = require("../../core/registry");
import Feature from '../../core/feature';
var SimpleQueue = require("../../utils/simpleQueue");
var Component = require("../../core/component");


export default class PositionTool extends MouseTool {
    constructor(typeString, setString) {
        super();
        this.typeString = typeString;
        this.setString = setString;
        this.currentFeatureID = null;
        let ref = this;
        this.lastPoint = null;
        this.showQueue = new SimpleQueue(function () {
            ref.showTarget();
        }, 20, false);
        this.up = function (event) {
            // do nothing
        };
        this.move = function (event) {
            ref.lastPoint = MouseTool.getEventPosition(event);
            ref.showQueue.run();
        };
        this.down = function (event) {
            Registry.viewManager.killParamsWindow();
            paper.project.deselectAll();
            ref.createNewFeature(MouseTool.getEventPosition(event));
        };
    }

    createNewFeature(point) {
        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();
        Registry.currentLayer.addFeature(newFeature);
    }

    static getTarget(point) {
        let target = Registry.viewManager.snapToGrid(point);
        return [target.x, target.y];
    }

    showTarget() {
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    /**
     * Creates a new component and adds it to the registry's current device
     * Note: Takes the feature ids as an array
     * TODO: Modify this to take the MINT String as another parameter
     * @param typeString Type of the Feature
     * @param params Map of all the paramters
     * @param featureIDs [String] Feature id's of all the features that will be a part of this component
     */
    createNewComponent(typeString, params, featureIDs) {
        let componentid = Feature.generateID();
        let newComponent = new Component(typeString, params, componentid, "TEST MINT", componentid);

        for (var i in featureIDs) {
            newComponent.addFeatureID(featureIDs[i]);
        }

        Registry.currentDevice.addComponent(newComponent);
    }
}

