var Features = require("../../core/features");
var Registry = require("../../core/registry");

class ValveTool extends paper.Tool{
	constructor(valveClass){
		super();
		this.valveClass = valveClass;
		this.currentValveID = null;
		this.onMouseDown = function(event){
			let newValve = new this.valveClass({
				"position": [event.point.x, event.point.y]
			});
			this.currentValveID = newValve.id;
			Registry.currentLayer.addFeature(newValve);
			Registry.canvasManager.render();
		};	
	}

	abort(){
		Registry.currentLayer.removeFeatureByID(this.currentValveID);
		Registry.canvasManager.render();
	}
}

module.exports = ValveTool;