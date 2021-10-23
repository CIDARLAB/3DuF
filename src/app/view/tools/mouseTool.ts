import { ViewManager } from "@/app";
import { Point } from "@/app/core/init";
import paper from "paper";
import Registry from "../../core/registry";

export interface MouseToolCallback {
    (event: MouseEvent): void;
}
export default class MouseTool {

    protected viewManagerDelegate: ViewManager;

    constructor(viewManager: ViewManager) {
        this.viewManagerDelegate = viewManager;
    }

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

    deactivate(): void{
        console.log("Default Message: You have to implement the method deactivate!");
    }

    static defaultFunction(value: string) {
        return function(): void {
            console.log("No " + value + " function set.");
        };
    }

    static getEventPosition(event: MouseEvent): Point {
        if (Registry.viewManager !== null) {
            let ret = Registry.viewManager.getEventPosition(event);
            if(ret === undefined){
                throw new Error("event position is undefined");
            }
            return ret;
        }
    }
}
