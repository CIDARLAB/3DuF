import paper from "paper";
import Registry from "../../core/registry";

export interface MouseToolCallback {
    (event: MouseEvent): void;
}
export default class MouseTool {
    constructor() {}

    up(event: MouseEvent): void {
        MouseTool.defaultFunction("up");
    }

    down(event: MouseEvent): void {
        MouseTool.defaultFunction("down");
    }

    move(event: MouseEvent): void {
        MouseTool.defaultFunction("move");
    }

    rightdown(event: MouseEvent): void {
        MouseTool.defaultFunction("rightdown");
    }

    cleanup(): void {
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
