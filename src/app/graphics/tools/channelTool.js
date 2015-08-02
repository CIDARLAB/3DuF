var Features = require("../../core/features");
var Registry = require("../../core/registry");

class ChannelTool extends paper.Tool{
	constructor(channelClass){
		super();
		this.channelClass = channelClass;
		this.startPoint = null;
		this.currentChannelID = null;
		this.currentTarget = null;

		this.onMouseDown = function(event){
			this.initChannel(event.point);
			this.showTarget(event.point);
		};	
		this.onMouseDrag = function(event){
			this.updateChannel(event.point);
			this.showTarget(event.point);
		};
		this.onMouseUp = function(event){
			this.finishChannel(event.point);
			this.showTarget(event.point);
		};
		this.onMouseMove = function(event){
			this.showTarget(event.point);
		}
	}

	static makeReticle(point){
		let size = 10 / paper.view.zoom;
		let ret = paper.Path.Circle(point, size);
		ret.fillColor = new paper.Color(.5,0,1,.5);
		return ret;
	}

	abort(){
		if (this.currentTarget){
			this.currentTarget.remove();
		}
		if (this.currentChannelID){
			Registry.currentLayer.removeFeatureByID(this.currentChannelID);
		}
		Registry.canvasManager.render();
	}

	showTarget(point){
		if (this.currentTarget){
			this.currentTarget.remove();
		}
		point = ChannelTool.getTarget(point);
		this.currentTarget = ChannelTool.makeReticle(point);
	}

	initChannel(point){
		this.startPoint = ChannelTool.getTarget(point);
	}

	//TODO: Re-render only the current channel, to improve perforamnce
	updateChannel(point){
		if(this.currentChannelID){
			let target = ChannelTool.getTarget(point);
			let feat = Registry.currentLayer.getFeature(this.currentChannelID);
			feat.updateParameter("end", [target.x, target.y]);
			Registry.canvasManager.render();
		} else {
			let newChannel = this.createChannel(this.startPoint, this.startPoint);
			this.currentChannelID = newChannel.id;
			Registry.currentLayer.addFeature(newChannel);
		}
		
	}

	finishChannel(point){
		let target = ChannelTool.getTarget(point);
		if (this.currentChannelID){
			if (this.startPoint.x == target.x && this.startPoint.y == target.y){
				Registry.currentLayer.removeFeatureByID(this.currentChannelID);
				//TODO: This will be slow for complex devices, since it re-renders everything
				Registry.canvasManager.render();
			}
		}
		this.currentChannelID = null;
		this.startPoint = null;
	}

	createChannel(start, end){
		return new this.channelClass({
			"start": [start.x, start.y],
			"end": [end.x, end.y]
		});
	}

	//TODO: Re-establish target selection logic from earlier demo
	static getTarget(point){	
		return Registry.canvasManager.snapToGrid(point);
	}
}

module.exports = ChannelTool;