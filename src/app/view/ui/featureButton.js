import * as Colors from "../colors";
import ColorButton from "./colorButton";
<<<<<<< HEAD
import Registry from '../../core/registry';
=======
import Registry from "../../core/registry";
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a

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
