var Colors = require("../colors");
var ColorButton = require("./colorButton");
var Registry = require("../../core/registry");
var activeTextColor = Colors.WHITE;

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