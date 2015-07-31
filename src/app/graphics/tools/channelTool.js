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

	showTarget(point){
		if (this.currentTarget){
			this.currentTarget.remove();
		}
		point = ChannelTool.getTarget(point);
		this.currentTarget = ChannelTool.makeReticle(point);
	}

	initChannel(point){
		this.startPoint = ChannelTool.getTarget(point);
		let newChannel = this.createChannel(this.startPoint, this.startPoint);
		this.currentChannelID = newChannel.id;
		Registry.currentLayer.addFeature(newChannel);
		Registry.canvasManager.render();
	}

	//TODO: Re-render only the current channel, to improve perforamnce
	updateChannel(point){
		let target = ChannelTool.getTarget(point);
		let feat = Registry.currentLayer.getFeature(this.currentChannelID);
		feat.updateParameter("end", [target.x, target.y]);
		Registry.canvasManager.render();
	}

	finishChannel(point){
		if (this.currentChannel){
			if (this.startPoint.x == point.x && this.startPoint.y == point.y){
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