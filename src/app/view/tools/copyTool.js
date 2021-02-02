// var MouseTool = require("./positionTool");
// import * as  Registry from "../../core/registry";
// var Feature = require("../../core/feature");
// import SimpleQueue from "../../utils/simpleQueue";
// var PageSetup = require("../pageSetup");
import Selection from "../selection";
import PositionTool from "./positionTool";

export default class CopyTool extends PositionTool {
    constructor(typeString, setString, selection) {
        super(typeString, setString);  // typeString == CopyString, setString == Copy
        this.__selection = selection;  // Selection, what we are copying
    }

    createNewFeature(point) {
        console.log("mouseDown Copy");
        let [x,y] = PositionTool.getTarget(point);
        this.__selection.replicate(x,y);
        Registry.viewManager.saveDeviceState();
    }

    showTarget() {  // TODO render Target
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }
}
