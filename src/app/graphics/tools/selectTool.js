var Registry = require("../../core/registry");

class SelectTool extends paper.Tool{
	constructor(){
		super();
		this.dragStart = null;
		this.currentSelectBox = null;
		this.currentSelection = [];
		this.onMouseDown = function(event){
			this.mouseDownHandler(event.point);
		};	
		this.onKeyDown = function(event){
			this.keyHandler(event);
		};
		this.onMouseDrag = function(event){
			this.dragHandler(event.point);
		}
		this.onMouseUp = function(event){
			this.mouseUpHandler(event.point);
		}
	}

	keyHandler(event){
		if (event.key == "delete" || event.key == "backspace"){
			this.removeFeatures();
		}
	}

	dragHandler(point){
		if (this.dragStart){
			if (this.currentSelectBox){
				this.currentSelectBox.remove();
			}
			this.currentSelectBox = this.rectSelect(this.dragStart, point);
		}
	}

	mouseUpHandler(point){
		if (this.currentSelectBox){
			this.currentSelection = Registry.canvasManager.hitFeaturesWithPaperElement(this.currentSelectBox)
			this.selectFeatures();
		}
		this.killSelectBox();
	}

	removeFeatures(){
		if (this.currentSelection.length > 0){
			for (let i =0; i < this.currentSelection.length; i ++){
				let paperFeature = this.currentSelection[i];
				Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
			}
			this.currentSelection = [];
			Registry.canvasManager.render();
		}
	}

	mouseDownHandler(point){
		let target = this.hitFeature(point);
		if(target){
			if (target.selected) console.log("Doubleclick?");
			else {
				this.deselectFeatures();
				this.selectFeature(target);
			}
		} else {
			this.deselectFeatures();
			this.dragStart = point;
		}
	}

	killSelectBox(){
		if (this.currentSelectBox){
			this.currentSelectBox.remove();
			this.currentSelectBox = null;
		}
		this.dragStart = null;
	}

	hitFeature(point){
		let target = Registry.canvasManager.hitFeatureInDevice(point);
		return target;
	}

	selectFeature(paperElement){
		this.currentSelection.push(paperElement);
		paperElement.selected = true;
	}

	selectFeatures(){
		if (this.currentSelection){
			for (let i =0; i < this.currentSelection.length; i ++){
				let paperFeature = this.currentSelection[i];
				paperFeature.selected = true;
			}
		} 
	}

	deselectFeatures(){
		if (this.currentSelection){
			for (let i =0; i < this.currentSelection.length; i ++){
				let paperFeature = this.currentSelection[i];
				paperFeature.selected = false;
			}
		} 
		this.currentSelection = [];
	}

	abort(){
		this.deselectFeatures();
		this.killSelectBox();
		Registry.canvasManager.render();
	}

	rectSelect(point1, point2){
		let rect = new paper.Path.Rectangle(point1, point2);
		rect.fillColor = new paper.Color(0,.3,1,.4);
		rect.strokeColor = new paper.Color(0,0,0);
		rect.strokeWidth = 2;
		rect.selected = true;
		return rect;
	}
}

module.exports = SelectTool;