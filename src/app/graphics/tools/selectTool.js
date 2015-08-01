var Registry = require("../../core/registry");

class SelectTool extends paper.Tool{
	constructor(){
		super();
		this.currentPaperElement = null;
		this.currentFeature = null;
		this.onMouseDown = function(event){
			this.testAndSelect(event.point);
		};	
		this.onKeyDown = function(event){
			this.keyHandler(event);
		};
	}

	keyHandler(event){
		if (event.key == "delete" || event.key == "backspace"){
			this.removeFeature();
		}
	}

	removeFeature(){
		if (this.currentFeature){
			Registry.currentDevice.removeFeature(this.currentFeature);
			this.currentPaperElement.remove();
			Registry.canvasManager.render();
		}
	}

	testAndSelect(point){
		let target = this.hitFeature(point);
		if (target) {
			if (target == this.currentPaperElement) console.log("Doubleclick?");
			else this.selectFeature(target);
		}
		else this.deselectFeature();
	}

	hitFeature(point){
		let target = Registry.canvasManager.hitFeatureInDevice(point);
		return target;
	}

	selectFeature(paperElement){
		this.deselectFeature();
		this.currentPaperElement = paperElement;
		this.currentFeature = Registry.currentDevice.getFeatureByID(paperElement.featureID);
		paperElement.selected = true;
	}

	deselectFeature(){
		if (this.currentPaperElement) this.currentPaperElement.selected = false;
		this.currentPaperElement = null;
		this.currentFeature = null;
	}

	abort(){
		this.deselectFeature();
	}
}

module.exports = SelectTool;