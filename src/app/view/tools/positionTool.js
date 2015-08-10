var MouseTool = require("./mouseTool");
var Registry = require("../../core/registry");
var SimpleQueue = require("../../utils/SimpleQueue");
var Features = require("../../core/features");

class PositionTool extends MouseTool{
    constructor(typeString){
        super();
        this.typeString = typeString;
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
            ref.createNewFeature(MouseTool.getEventPosition(event));
        }
    }

    createNewFeature(point){
        let newFeature = Features[this.typeString]({
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
        Registry.viewManager.updateTarget(this.typeString, target);
    }
}

module.exports = PositionTool;