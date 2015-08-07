var MouseTool = require("./mouseTool");
var Registry = require("../../core/registry");
var SimpleQueue = require("../../utils/SimpleQueue");

class PositionTool extends MouseTool{
    constructor(featureClass){
        super();
        this.featureClass = featureClass;
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
        let target = PositionTool.getTarget(point);
        let newFeature = new this.featureClass({
            position: [target.x, target.y]
        });
        this.currentFeatureID = newFeature.id;
        Registry.currentLayer.addFeature(newFeature); 
    }

    static getTarget(point){
        return Registry.viewManager.snapToGrid(point);
    }

    showTarget(){
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.featureClass.typeString(), [target.x, target.y]);
    }
}

module.exports = PositionTool;