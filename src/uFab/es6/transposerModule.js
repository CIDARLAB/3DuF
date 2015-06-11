'use strict';

var uFab = require('./uFab');
var Module = require('./Module').Module;

class Transposer extends Module{
	constructor(featureDefaults, transposerParams){
		super(featureDefaults);
		this.transposerParams = transposerParams;
		this.makeFeatures();
	}	

	refresh(){
		this.clearFeatures();
		this.makeFeatures();
	}

	clearFeatures(){
		for (var feature in this.features){
			this.features[feature].destroy();
		}
		this.features = [];
	}

	makeFeatures(){
		this.updateValues();
		this.makeValves();
		this.makeVias();
		this.makeChannels();
		this.makePneumaticChannels();
		this.makePorts();
	}

	makeValves(){
		var x = this.xValues;
		var y = this.yValues;
		var positions = [
			[x.valveMid, y.flowBot],
			[x.valveLeft, y.valveLow],
			[x.valveRight, y.valveLow],
			[x.valveLeft, y.valveHigh],
			[x.valveMid, y.valveTop],
			[x.valveRight, y.valveHigh]
		]

		for (var pos in positions){
			var v = this.makeValve(positions[pos]);
			this.features.push(v);
			this.transposerParams.controlLayer.addFeature(v);
		}
	}

	makeVias(){
		var x = this.xValues;
		var y = this.yValues;
		var positions = [
			[x.valveLeft, y.pneuMid],
			[x.valveRight, y.pneuMid]
		];

		for (var pos in positions){
			var v = this.makeVia(positions[pos]);
			this.features.push(v);
			this.transposerParams.flowLayer.addFeature(v);
		}
	}

	makePorts(){
		var x = this.xValues;
		var y = this.yValues;

		var viaLeft = [x.valveLeft, y.pneuMid];
		var viaRight = [x.valveRight, y.pneuMid];

		var v1 = this.makePort(viaLeft);
		var v2 = this.makePort(viaRight);
		this.features.push(v1);
		this.transposerParams.controlLayer.addFeature(v1);
		this.features.push(v2);
		this.transposerParams.controlLayer.addFeature(v2);
	}

	makeChannels(){
		var x = this.xValues;
		var y = this.yValues;

		var fBotLeft = [x.flowLeft, y.flowBot];
		var fBotRight = [x.flowRight, y.flowBot];
		var fTopLeft = [x.flowLeft, y.valveTop];
		var fTopRight = [x.flowRight, y.valveTop];
		var fBotValveLeft = [x.valveLeft, y.flowBot];
		var fBotValveRight = [x.valveRight, y.flowBot];
		var fTopValveLeft = [x.valveLeft, y.valveTop];
		var fTopValveRight = [x.valveRight, y.valveTop];
		var fLowerValveLeft = [x.valveLeft, y.valveLow];
		var fLowerValveRight = [x.valveRight, y.valveLow];
		var fUpperValveLeft = [x.valveLeft, y.valveHigh];
		var fUpperValveRight = [x.valveRight, y.valveHigh];
		var fLowerMid = [x.valveMid, y.valveLow];
		var fUpperMid = [x.valveMid, y.valveHigh];
		var viaLeft = [x.valveLeft, y.pneuMid];
		var viaRight = [x.valveRight, y.pneuMid];

		var positionPairs = [
			[fBotLeft, fBotRight],
			[fTopLeft, fTopRight],
			[fBotValveLeft, viaLeft],
			[fTopValveRight, viaRight],
			[fTopValveLeft, fUpperValveLeft],
			[fUpperValveLeft, fUpperMid],
			[fUpperMid, fLowerMid],
			[fLowerMid, fLowerValveRight],
			[fLowerValveRight, fBotValveRight]
		];

		for (var pos in positionPairs){
			var start = positionPairs[pos][0];
			var end = positionPairs[pos][1];
			var f = this.makeChannel(start, end);
			this.features.push(f);
			this.transposerParams.flowLayer.addFeature(f);
		}

		var f = this.makeChannel(viaLeft,viaRight);
		this.features.push(f);
		this.transposerParams.controlLayer.addFeature(f);
	}

	makePneumaticChannels(){
		var x = this.xValues;
		var y = this.yValues;

		var vBot = [x.valveMid, y.flowBot];
		var vBelow = [x.valveMid, y.pneuBot];
		var pBotLeft = [x.pneuLeft, y.pneuBot];
		var pTopLeft = [x.pneuLeft, y.pneuTop];
		var pTopMid = [x.valveMid, y.pneuTop];
		var vTopMid = [x.valveMid, y.valveTop];
		var pExitMid = [x.valveMid, y.exitTop];
		var pExitRight = [x.pneuRight, y.exitTop];
		var vTopLeft = [x.valveLeft, y.valveHigh];
		var pTopRight = [x.pneuRight, y.valveHigh];
		var vBotLeft = [x.valveLeft, y.valveLow];
		var pBotRight = [x.pneuRight, y.valveLow];

		var positionPairs = [
			[vBot, vBelow],
			[vBelow, pBotLeft],
			[pBotLeft, pTopLeft],
			[pTopLeft, pTopMid],
			[vTopMid, pExitMid],
			[pExitRight, pBotRight],
			[vTopLeft, pTopRight],
			[vBotLeft, pBotRight]
		];

		for (var pos in positionPairs){
			var start = positionPairs[pos][0];
			var end = positionPairs[pos][1];
			var p = this.makePneumaticChannel(start, end);
			this.features.push(p);
			this.transposerParams.controlLayer.addFeature(p);
		}
	}

	updateValues(){
		this.xValues = this.computeXValues();
		this.yValues = this.computeYValues();
	}

	computeXValues(){
		var pneuWidth = this.featureDefaults.PneumaticChannel.width/2;
		var valveWidth = this.featureDefaults.CircleValve.radius1;
		var buff = this.transposerParams.buffer;

		var flowLeft = this.transposerParams.position[0];
		var pneuLeft = flowLeft + pneuWidth + buff;
		var valveLeft = pneuLeft + pneuWidth + buff + valveWidth;
		var valveMid = valveLeft + buff + valveWidth * 2;
		var valveRight = valveMid + buff + valveWidth * 2;
		var pneuRight = valveRight + valveWidth + buff + pneuWidth;
		var flowRight = pneuRight + pneuWidth + buff;

		return {
			"flowLeft": flowLeft,
			"pneuLeft": pneuLeft,
			"valveLeft": valveLeft,
			"valveMid": valveMid,
			"valveRight": valveRight,
			"pneuRight": pneuRight,
			"flowRight": flowRight
		}
	}

	computeYValues(){
		var pneuWidth = this.featureDefaults.PneumaticChannel.width/2;
		var valveWidth = this.featureDefaults.CircleValve.radius1;
		var flowWidth = this.featureDefaults.Channel.width/2;
		var viaWidth = this.featureDefaults.Via.radius1;
		var portWidth = this.featureDefaults.Port.radius;
		var buff = this.transposerParams.buffer;

		var flowBot = this.transposerParams.position[1];
		var pneuBot = flowBot - valveWidth - buff - pneuWidth;
		var valveLow = flowBot + valveWidth + buff + pneuWidth;
		var pneuMid = valveLow + valveWidth + buff + viaWidth;
		var valveHigh = pneuMid + viaWidth + buff + valveWidth;
		var valveTop = valveHigh + valveWidth + buff + pneuWidth;
		var pneuTop = valveTop + valveWidth + buff + pneuWidth;
		var exitTop = pneuTop + pneuWidth + buff;

		var pos =  {
			"flowBot": flowBot,
			"pneuBot": pneuBot,
			"valveLow": valveLow,
			"pneuMid": pneuMid,
			"valveHigh": valveHigh,
			"valveTop": valveTop,
			"pneuTop": pneuTop,
			"exitTop": exitTop
		};

		return pos;
	}

	makePort(position){
		return new Port({
			"position": position,
			"radius": this.featureDefaults.Port.radius,
			"height": this.featureDefaults.Port.height
		});
	}


	makeValve(position){
		return new CircleValve({
			"position": position,
			"radius1": this.featureDefaults.CircleValve.radius1,
			"radius2": this.featureDefaults.CircleValve.radius2,
			"height": this.featureDefaults.CircleValve.height
		});
	}
		
	makeChannel(start, end){
		return new Channel({
			"start": start,
			"end": end, 
			"width": this.featureDefaults.Channel.width,
			"height": this.featureDefaults.Channel.height
		});
	}

	makePneumaticChannel(start, end){
		return new Channel({
			"start": start,
			"end": end, 
			"width": this.featureDefaults.PneumaticChannel.width,
			"height": this.featureDefaults.PneumaticChannel.height
		});
	}

	makeVia(position){
		return new Via({
			"position": position,
			"height": this.featureDefaults.Via.height,
			"radius1": this.featureDefaults.Via.radius1,
			"radius2": this.featureDefaults.Via.radius2
		})
	}
}

exports.Transposer = Transposer;