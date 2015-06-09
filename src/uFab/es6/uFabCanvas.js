'use strict';

var uFab = require('./uFab');

class uFabCanvas extends fabric.CanvasWithViewport{
	constructor(id){
		super(id);
		this.resizeCanvasElement();
		this.device = null;

		//I want these to be constant class variables, but I don't know how to do that. :(
		this.DEVICE_MARGIN_X = 5;
		this.DEVICE_MARGIN_Y = 5;
		this.DEFAULT_ZOOM = .95;
	}

	setDevice(device){
		this.device = device;
		this.resetZoom();
		this.resetViewPosition();
	}

	resetViewPosition(){
		this.viewport.position = new fabric.Point(this.DEVICE_MARGIN_X, this.DEVICE_MARGIN_Y);
	}

	increaseZoom(zoom){
		setZoom(this.viewport.zoom * 1.1);
	}

	decreaseZoom(){
		setZoom(this.viewport.zoom * .9);
	}

	setZoom(zoom){
		this.viewport.zoom = zoom;
	}

	resetZoom(){
		setZoom(this.computeOptimalZoom());
	}

	resizeCanvasElement(){
		var parent = $(this.ID).parent();
		var canvas = $(this.ID);
		canvas.width = parent.clientWidth;
		canvas.height = parent.clientHeight;
	}

	computeOptimalZoom(){
		var x_max = this.width * this.DEFAULT_ZOOM;
		var y_max = this.height * this.DEFAULT_ZOOM;
		var x_max_zoom = x_max / this.device.width;
		var y_max_zoom = y_max / this.device.height;
		if (x_max_zoom > y_max_zoom){
			return y_max_zoom;
		}
		else {
			return x_max_zoom;
		}
	}
}

exports.uFabCanvas = uFabCanvas;
