import MouseTool from "./mouseTool";

const Registry = require("../../core/registry");
import SimpleQueue from "../../utils/simpleQueue";
import Feature from "../../core/feature";
import paper from 'paper';


export default class ChannelTool extends MouseTool {
	constructor(typeString, setString) {
		super();
		this.typeString = typeString;
		this.setString = setString;
		this.startPoint = null;
		this.lastPoint = null;
		this.currentChannelID = null;
		this.currentTarget = null;
		this.dragging = false;
		let ref = this;

		this.showQueue = new SimpleQueue(function(){
			ref.showTarget();
		}, 20, false);

		this.updateQueue = new SimpleQueue(function(){
			ref.updateChannel();
		}, 20, false);

		this.down = function(event) {
			Registry.viewManager.killParamsWindow();
			paper.project.deselectAll();
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
		Registry.viewManager.updateTarget(this.typeString, this.setString, target);
	}

	initChannel() {
		this.startPoint = ChannelTool.getTarget(this.lastPoint);
		this.lastPoint = this.startPoint;
	}

	updateChannel() {
		if(this.lastPoint && this.startPoint){
			if (this.currentChannelID) {
			let target = ChannelTool.getTarget(this.lastPoint);
			let feat = Registry.currentLayer.getFeature(this.currentChannelID);
			feat.updateParameter("end", target);
			} else {
				let newChannel = ChannelTool.createChannel(this.startPoint, this.startPoint, this.typeString, this.setString);
				this.currentChannelID = newChannel.getID();
				Registry.currentLayer.addFeature(newChannel);
			}
		}
	}

	finishChannel(point) {
		let target = ChannelTool.getTarget(point);
		if (this.currentChannelID) {
			if (this.startPoint.x == target[0] && this.startPoint.y == target[1]) {
				Registry.currentLayer.removeFeatureByID(this.currentChannelID);
			}
		} else {
			this.updateChannel(point);
		}
		this.currentChannelID = null;
		this.startPoint = null;
        Registry.viewManager.saveDeviceState();
    }

	static createChannel(start, end, typestring = null, setstring = null) {
		return Feature.makeFeature(typestring, setstring, {
			start: start,
			end: end
		});
	}

	//TODO: Re-establish target selection logic from earlier demo
	static getTarget(point) {
		let target =  Registry.viewManager.snapToGrid(point);
		return [target.x, target.y]
	}
}