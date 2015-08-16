var Colors = require("../colors");
var inactiveBackgroundColor = Colors.GREY_200;
var inactiveTextColor = Colors.BLACK;

class ColorButton{
	constructor(id){
		this.button = document.getElementById(id);
	}

	setBackgroundColor(color){
		this.button.style.background = color;
	}

	setTextColor(color){
		this.button.style.color = color;
	}

	setClick(func){
		this.button.onclick = func;
	}

	deactivate(bgColor = inactiveBackgroundColor, setTextColor = inactiveTextColor){
		this.setBackgroundColor(bgColor);
		this.setTextColor(setTextColor);
	}
}