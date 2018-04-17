var Registry = require("../../core/registry");
var MouseTool = require("./MouseTool");
var SimpleQueue = require("../../utils/simpleQueue");
var PageSetup = require("../pageSetup");

class SelectTool extends MouseTool {
	constructor() {
		super();
		this.dragging = false;
		this.dragStart = null;
		this.lastPoint = null;
		this.currentSelectBox = null;
		this.currentSelection = [];
		let ref = this;
		this.updateQueue = new SimpleQueue(function() {
			ref.dragHandler();
		}, 20);
		this.down = function(event) {
			PageSetup.killParamsWindow();
			ref.mouseDownHandler(event);
			ref.dragging = true;
			ref.showTarget();
		};
		this.move = function(event) {
			if (ref.dragging) {
				ref.lastPoint = MouseTool.getEventPosition(event);
				ref.updateQueue.run();
			}
			ref.showTarget();
		}
		this.up = function(event) {
			ref.dragging = false;
			ref.mouseUpHandler(MouseTool.getEventPosition(event));
			ref.showTarget();
		}

	}

	keyHandler(event) {
		if (event.key == "delete" || event.key == "backspace") {
			console.log("Removing feature");
			this.removeFeatures();
		}
		if (event.key == "c") {
			console.log("Detected a ctrlC");
			console.log(this.currentSelection);
		}
	}

	dragHandler() {
		if (this.dragStart) {
			if (this.currentSelectBox) {
				this.currentSelectBox.remove();
			}
			this.currentSelectBox = this.rectSelect(this.dragStart, this.lastPoint);
		}
	}

	showTarget() {
		Registry.viewManager.removeTarget();
	}

	mouseUpHandler(point) {
		if (this.currentSelectBox) {
			this.currentSelection = Registry.viewManager.hitFeaturesWithViewElement(this.currentSelectBox)
			this.selectFeatures();
		}
		this.killSelectBox();
	}

	removeFeatures() {
		if (this.currentSelection.length > 0) {
			for (let i = 0; i < this.currentSelection.length; i++) {
				let paperFeature = this.currentSelection[i];
				Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
			}
			this.currentSelection = [];
			Registry.canvasManager.render();
		}
	}

	mouseDownHandler(event) {
		let point = MouseTool.getEventPosition(event);
		let target = this.hitFeature(point);
		if (target) {
			if (target.selected) {
				let feat = Registry.currentDevice.getFeatureByID(target.featureID);
				Registry.viewManager.updateDefaultsFromFeature(feat);
				let func = PageSetup.paramsWindowFunction(feat.getType(), feat.getSet());
				func(event);
			} else {
				this.deselectFeatures();
				this.selectFeature(target);
			}


		} else {
			this.deselectFeatures();
			this.dragStart = point;
		}
	}

	killSelectBox() {
		if (this.currentSelectBox) {
			this.currentSelectBox.remove();
			this.currentSelectBox = null;
		}
		this.dragStart = null;
	}

	hitFeature(point) {
		let target = Registry.viewManager.hitFeature(point);
		return target;
	}

	selectFeature(paperElement) {
		this.currentSelection.push(paperElement);
		paperElement.selected = true;
	}

	selectFeatures() {
		if (this.currentSelection) {
			for (let i = 0; i < this.currentSelection.length; i++) {
				let paperFeature = this.currentSelection[i];
				paperFeature.selected = true;
			}
		}
	}

	deselectFeatures() {
		paper.project.deselectAll();
		this.currentSelection = [];
	}

	abort() {
		this.deselectFeatures();
		this.killSelectBox();
	}

	rectSelect(point1, point2) {
		let rect = new paper.Path.Rectangle(point1, point2);
		rect.fillColor = new paper.Color(0, .3, 1, .4);
		rect.strokeColor = new paper.Color(0, 0, 0);
		rect.strokeWidth = 2;
		rect.selected = true;
		return rect;
	}
}

module.exports = SelectTool;