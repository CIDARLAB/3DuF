import paper from "paper";
import Registry from "../../core/registry";

export interface MouseToolCallback {
    (event: MouseEvent): void;
}
export default class MouseTool {

    /**
     * Creates an instance of MouseTool. This is the base class for all mouse tools.
     * @memberof MouseTool
     */
    constructor() {}

    /**
     * This function is called when the mouse is released.
     *
     * @param {MouseEvent} event
     * @memberof MouseTool
     */
    up(event: MouseEvent): void {
        MouseTool.defaultFunction("up");
    }

    /**
     * This function is called when the mouse is pressed.
     *
     * @param {MouseEvent} event
     * @memberof MouseTool
     */
    down(event: MouseEvent): void {
        MouseTool.defaultFunction("down");
    }

    /**
     * This function is called when the mouse is moved.
     *
     * @param {MouseEvent} event
     * @memberof MouseTool
     */
    move(event: MouseEvent): void {
        MouseTool.defaultFunction("move");
    }

    /**
     * This function is called when the right mouse button is clicked.
     *
     * @param {MouseEvent} event
     * @memberof MouseTool
     */
    rightdown(event: MouseEvent): void {
        MouseTool.defaultFunction("rightdown");
    }

    /**
     * This fucntion is a convenience function that can be called to clean up the tool.
     *
     * @memberof MouseTool
     */
    cleanup(): void {
        console.log("Default Message: You have to implement the method cleanup!");
    }

    /**
     * This is the dummy function that is called when no function is set.
     *
     * @static
     * @param {string} value
     * @returns
     * @memberof MouseTool
     */
    static defaultFunction(value: string) {
        return function(): void {
            console.log("No " + value + " function set.");
        };
    }

    /**
     * This function returns the position of the mouse event in the paper coordinate system.
     *
     * @static
     * @param {MouseEvent} event
     * @returns {paper.Point}
     * @memberof MouseTool
     */
    static getEventPosition(event: MouseEvent):paper.Point {
        if (Registry.viewManager !== null) {
            return Registry.viewManager.getEventPosition(event);
        }
        throw new Error("No view manager set!");
    }
}
