var Features = require("../../core/features");
var Registry = require("../../core/registry");
var MouseTool = require("./mouseTool");
var SimpleQueue = require("../../utils/simpleQueue");

class ChannelTool extends MouseTool {
	constructor(channelClass) {
		super();
		this.channelClass = channelClass;
		this.startPoint = null;
		this.lastPoint = null;
		this.currentChannelID = null;
		this.currentTarget = null;
		this.dragging = false;
		let ref = this;

		this.showQueue = new SimpleQueue(function(){
			ref.showTarget();
		}, 20, false)

		this.updateQueue = new SimpleQueue(function(){
			ref.updateChannel();
		}, 20, false);

		this.down = function(event) {
			ref.dragging = true;
			ref.initChannel();
		};
		this.up = function(event) {
			ref.dragging = false;
			ref.finishChannel(MouseTool.getEventPosition(event))
		};
		this.move = function(event) {
			ref.lastPoint = MouseTool.getEventPosition(event);
			if (ref.dragging) {
				ref.updateQueue.run();
			}
			ref.showQueue.run();
		}
	}

	static makeReticle(point) {
		let size = 10 / paper.view.zoom;
		let ret = paper.Path.Circle(point, size);
		ret.fillColor = new paper.Color(.5, 0, 1, .5);
		return ret;
	}

	abort() {
		ref.dragging = false;
		if (this.currentTarget) {
			this.currentTarget.remove();
		}
		if (this.currentChannelID) {
			Registry.currentLayer.removeFeatureByID(this.currentChannelID);
		}
	}

	showTarget(point) {
		let target = ChannelTool.getTarget(this.lastPoint);
		Registry.viewManager.updateTarget(this.channelClass.typeString(), [target.x, target.y]);
	}

	initChannel() {
		this.startPoint = ChannelTool.getTarget(this.lastPoint);
		this.lastPoint = this.startPoint;
	}

	//TODO: Re-render only the current channel, to improve perforamnce
	updateChannel() {
		if(this.lastPoint && this.startPoint){
			if (this.currentChannelID) {
			let target = ChannelTool.getTarget(this.lastPoint);
			let feat = Registry.currentLayer.getFeature(this.currentChannelID);
			feat.updateParameter("end", [target.x, target.y]);
			Registry.canvasManager.render();
			} else {
				let newChannel = this.createChannel(this.startPoint, this.startPoint);
				this.currentChannelID = newChannel.id;
				Registry.currentLayer.addFeature(newChannel);
			}
		}
	}

	finishChannel(point) {
		let target = ChannelTool.getTarget(point);
		if (this.currentChannelID) {
			if (this.startPoint.x == target.x && this.startPoint.y == target.y) {
				Registry.currentLayer.removeFeatureByID(this.currentChannelID);
				//TODO: This will be slow for complex devices, since it re-renders everything
				Registry.canvasManager.render();
			}
		} else {
			this.updateChannel(point);
		}
		this.currentChannelID = null;
		this.startPoint = null;
	}

	createChannel(start, end) {
		return new this.channelClass({
			"start": [start.x, start.y],
			"end": [end.x, end.y]
		});
	}

	//TODO: Re-establish target selection logic from earlier demo
	static getTarget(point) {
		return Registry.viewManager.snapToGrid(point);
	}
}

module.exports = ChannelTool;