'use strict';

var uFab = require('./uFab');
var Module = require('./Module').Module;

class Transposer extends Module{
	constructor(featureDefaults, transposerParams){
		super(featureDefaults);
		this.transposerParams = transposerParams;
		this.makeFeatures();

	}	

	makeFeatures(){
		this.updateValues();
		this.makeValves();
		this.makeVias();
		this.makeChannels();
		this.makePneumaticChannels();
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

	makeChannels(){
		//TODO: Make the flow channels!
		// Don't forget that these go in two different layers!
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

		console.log(positionPairs);

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
		var buff = this.transposerParams.buffer;

		var flowBot = this.transposerParams.position[1];
		var pneuBot = flowBot - valveWidth - buff - pneuWidth;
		var valveLow = flowBot + valveWidth + buff + pneuWidth;
		var pneuMid = valveLow + valveWidth + buff + viaWidth;
		var valveHigh = pneuMid + viaWidth + buff + valveWidth;
		var valveTop = valveHigh + valveWidth + buff + pneuWidth;
		var pneuTop = valveTop + valveWidth + buff + pneuWidth;
		var exitTop = pneuTop + buff;

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

		console.log(pos);
		return pos;
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