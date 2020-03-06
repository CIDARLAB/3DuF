import * as Colors from "../colors";
import ColorButton from "./colorButton";
import * as Registry from "../../core/registry";

export default class featureButton extends ColorButton {
    constructor(id, typeString, setString) {
        super(id);
        this.type = typeString;
        this.set = setString;
    }

    getActiveColor() {
        Colors.getDefaultFeatureColor(this.typeString, this.setString, Registry.currentLayer);
    }

    activate() {
        this.setBackgroundColor(this.getActiveColor());
        this.setTextColor(this.activeTextColor);
    }
}
