var Features = require("../../core/features");
var Registry = require("../../core/registry");
var MouseTool = require("./mouseTool");

class ChannelTool extends MouseTool {
	constructor(channelClass) {
		super();
		this.channelClass = channelClass;
		this.startPoint = null;
		this.currentChannelID = null;
		this.currentTarget = null;
		this.dragging = false;
		let ref = this;

		this.down = function(event) {
			ref.dragging = true;
			ref.initChannel(MouseTool.getEventPosition(event));
		};
		this.up = function(event) {
			ref.dragging = false;
			ref.finishChannel(MouseTool.getEventPosition(event))
		};
		this.move = function(event) {
			if (ref.dragging) {
				ref.updateChannel(MouseTool.getEventPosition(event));
				ref.showTarget(MouseTool.getEventPosition(event));
			}
			ref.showTarget(MouseTool.getEventPosition(event));
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
		Registry.canvasManager.render();
	}

	showTarget(point) {
		if (this.currentTarget) {
			this.currentTarget.remove();
		}
		point = ChannelTool.getTarget(point);
		this.currentTarget = ChannelTool.makeReticle(point);
	}

	initChannel(point) {
		this.startPoint = ChannelTool.getTarget(point);
	}

	//TODO: Re-render only the current channel, to improve perforamnce
	updateChannel(point) {
		if (this.currentChannelID) {
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

	finishChannel(point) {
		let target = ChannelTool.getTarget(point);
		if (this.currentChannelID) {
			if (this.startPoint.x == target.x && this.startPoint.y == target.y) {
				Registry.currentLayer.removeFeatureByID(this.currentChannelID);
				//TODO: This will be slow for complex devices, since it re-renders everything
				Registry.canvasManager.render();
			}
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