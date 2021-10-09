import paper from "paper";
import Registry from "../../core/registry";

export interface MouseToolCallback {
    (event: MouseEvent): void;
}
export default class MouseTool {
    constructor() {}

    up(callback: MouseToolCallback) {
        MouseTool.defaultFunction("up");
    }

    down(callback: MouseToolCallback) {
        MouseTool.defaultFunction("down");
    }

    move(callback: MouseToolCallback) {
        MouseTool.defaultFunction("move");
    }

    rightdown(callback: MouseToolCallback) {
        MouseTool.defaultFunction("rightdown");
    }

    cleanup() {
        console.log("Default Message: You have to implement the method cleanup!");
    }

    static defaultFunction(value: string) {
        return function(): void {
            console.log("No " + value + " function set.");
        };
    }

    static getEventPosition(event: MouseEvent) {
        if (Registry.viewManager !== null) {
            return Registry.viewManager.getEventPosition(event);
        }
    }
}
