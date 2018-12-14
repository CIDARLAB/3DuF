const Colors = require("../colors");
const ColorButton = require("./colorButton");
const Registry = require("../../core/registry");

class featureButton extends ColorButton {
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