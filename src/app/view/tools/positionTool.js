var MouseTool = require("./mouseTool");
var Registry = require("../../core/registry");
var Feature = require("../../core/feature");
var SimpleQueue = require("../../utils/simpleQueue");
var PageSetup = require("../pageSetup");

class PositionTool extends MouseTool{
    constructor(typeString, setString){
        super();
        this.typeString = typeString;
        this.setString = setString;
        this.currentFeatureID = null;
        let ref = this;
        this.lastPoint = null;
        this.showQueue = new SimpleQueue(function(){
            ref.showTarget();
        }, 20, false);
        this.up = function(event){
            // do nothing
        }
        this.move = function(event){
            ref.lastPoint = MouseTool.getEventPosition(event);
            ref.showQueue.run();
        }
        this.down = function(event){
            PageSetup.killParamsWindow();
            paper.project.deselectAll();
            ref.createNewFeature(MouseTool.getEventPosition(event));
        }
    }

    createNewFeature(point){
        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();
        Registry.currentLayer.addFeature(newFeature); 
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

module.exports = PositionTool;