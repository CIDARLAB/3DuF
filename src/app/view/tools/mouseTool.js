var Registry = require("../../core/registry");

class MouseTool{
    constructor(){
        this.up = MouseTool.defaultFunction("up");
        this.down = MouseTool.defaultFunction("down");
        this.move = MouseTool.defaultFunction("move");
        this.rightdown = MouseTool.defaultFunction("rightdown");
    }

    static defaultFunction(string){
        return function(){
            console.log("No " + string + " function set.");
        }
    }

    static getEventPosition(event){
        return Registry.viewManager.getEventPosition(event);
    }
}

module.exports = MouseTool;