import ViewManager from "../app/view/viewManager";
import Step2MouseTool from "./tools/step2MouseTool";

export default class GuideViewManager extends ViewManager {
    constructor() {
        super();
        this.setDefaultInteractionTool();
    }

    startStep1() {
        console.log("test");
    }

    setDefaultInteractionTool() {
        const activeTool = new Step2MouseTool(this);
        this.mouseAndKeyboardHandler.leftMouseTool = activeTool;
        this.mouseAndKeyboardHandler.rightMouseTool = activeTool;
    }
}
