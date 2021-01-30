// var MouseTool = require("./positionTool");
// import * as  Registry from "../../core/registry";
// var Feature = require("../../core/feature");
// import SimpleQueue from "../../utils/simpleQueue";
// var PageSetup = require("../pageSetup");
import Selection from "../selection";
import positionTool from "./positionTool";

export default class CopyTool extends positionTool {
    constructor(typeString, setString, selection) {
        super(typeString, setString);
        this.__selection = selection;  // Selection, what we are copying
    }

    createNewFeature(point) {
        let [x,y] = positionTool.getTarget(point);
        this.__selection.replicate(x,y);
        Registry.viewManager.saveDeviceState();
    }
}
