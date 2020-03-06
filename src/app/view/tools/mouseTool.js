import * as Registry from "../../core/registry";

export default class MouseTool {
    constructor() {
        this.up = MouseTool.defaultFunction("up");
        this.down = MouseTool.defaultFunction("down");
        this.move = MouseTool.defaultFunction("move");
        this.rightdown = MouseTool.defaultFunction("rightdown");
    }

    cleanup() {
        console.log("Default Message: You have to implement the method cleanup!");
    }

    static defaultFunction(string) {
        return function() {
            console.log("No " + string + " function set.");
        };
    }

    static getEventPosition(event) {
        return Registry.viewManager.getEventPosition(event);
    }
}
