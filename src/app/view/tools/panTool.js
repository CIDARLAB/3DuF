var Registry = require("../../core/registry");
var MouseTool = require("./mouseTool");

class PanTool extends MouseTool {
    constructor(){
        super();
        this.startPoint = null;
        let ref = this;
        this.down = function(event){
            ref.dragging = true;
            ref.startPoint = MouseTool.getEventPosition(event);
        }
        this.up = function(event){
            ref.dragging = false;
            ref.startPoint = null;
        }
        this.move = function(event){
            if(ref.dragging){
                let point = MouseTool.getEventPosition(event);
                let delta = point.subtract(ref.startPoint);
                Registry.viewManager.moveCenter(delta);
            }
        }
    }
}

module.exports = PanTool;