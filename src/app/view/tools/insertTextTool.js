var MouseTool = require("./mouseTool");
var Registry = require("../../core/registry");
var TextFeature = require("../../core/textFeature");
var SimpleQueue = require("../../utils/simpleQueue");
var PageSetup = require("../pageSetup");
var Component = require("../../core/component");
var PositionTool = require("./positionTool");
let Params = require("../../core/params");

class InsertTextTool extends MouseTool {
    constructor() {
        super();
        this.typeString = "TEXT";
        this.setString = "STndard";
        this.currentFeatureID = null;
        let ref = this;
        this.lastPoint = null;
        this.showQueue = new SimpleQueue(function () {
            ref.showTarget();
        }, 20, false);
        this.up = function (event) {
            // do nothing
        };
        this.move = function (event) {
            ref.lastPoint = MouseTool.getEventPosition(event);
            ref.showQueue.run();
        };
        this.down = function (event) {
            PageSetup.killParamsWindow();
            paper.project.deselectAll();
            ref.createNewFeature(MouseTool.getEventPosition(event));
        }
    }

    createNewFeature(point) {
        let newFeature = TextFeature.makeFeature(Registry.text, this.typeString, this.setString, new Params({
            "position": PositionTool.getTarget(point),
            "height": 200
        }, { "position" : "Point" }, { "height": "Float", "text":"String" }));
        // this.currentFeatureID = newFeature.getID();
        Registry.currentLayer.addFeature(newFeature);
    }

    showTarget() {
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }
}

module.exports = InsertTextTool;