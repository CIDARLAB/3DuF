import MouseTool from "./mouseTool";

<<<<<<< HEAD
import Registry from '../../core/registry';
=======
import Registry from "../../core/registry";
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
import TextFeature from "../../core/textFeature";
import SimpleQueue from "../../utils/simpleQueue";

import paper from "paper";
import PositionTool from "./positionTool";
import Params from "../../core/params";

export default class InsertTextTool extends MouseTool {
    text;

    constructor() {
        super();
        this.typeString = "TEXT";
        this.setString = "Standard";
        this.currentFeatureID = null;
        const ref = this;
        this.lastPoint = null;
        this.showQueue = new SimpleQueue(
            function () {
                ref.showTarget();
            },
            20,
            false
        );
        this.up = function (event) {
            // do nothing
        };
        this.move = function (event) {
            ref.lastPoint = MouseTool.getEventPosition(event);
            ref.showQueue.run();
        };
        this.down = function (event) {
            Registry.viewManager.killParamsWindow();
            paper.project.deselectAll();
            ref.createNewFeature(MouseTool.getEventPosition(event));
        };
    }

    createNewFeature(point) {
        let newFeature = TextFeature.makeFeature(
            this.text,
            this.typeString,
            this.setString,
            new Params(
                {
                    position: PositionTool.getTarget(point),
                    height: 200
                },
                { position: "Point" },
                { height: "Float", text: "String" }
            )
        );
        // this.currentFeatureID = newFeature.ID;
        Registry.currentLayer.addFeature(newFeature);
        Registry.viewManager.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    get text() {
        return this.text;
    }

    set text(text) {
        this.text = text;
    }
}
