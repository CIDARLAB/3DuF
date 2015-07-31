var Features = require("../../core/features");
var Registry = require("../../core/registry");

class ChannelTool extends paper.Tool{
	constructor(channelClass){
		super();
		this.channelClass = channelClass;
		this.onMouseDown = function(event){
			let newValve = new this.valveClass({
				"position": [event.point.x, event.point.y]
			});
			console.log(newValve);
			Registry.currentDevice.layers[0].addFeature(newValve);
			Registry.canvasManager.render();
		};	
	}
}

module.exports = ChannelTool;