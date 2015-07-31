var Registry = require("../../core/registry");

class PanTool extends paper.Tool{
	constructor(){
		super();
		this.startPoint = null;
		
		this.onMouseDown = function(event){
			this.startPoint = event.point;
		};	
		this.onMouseDrag = function(event){
			if(this.startPoint){
				let delta = event.point.subtract(this.startPoint);
				Registry.canvasManager.moveCenter(delta);
			}
		}
		this.onMouseUp = function(event){
			this.startPoint = null;
		}
	}
}

module.exports = PanTool;