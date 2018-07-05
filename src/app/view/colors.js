import Feature from "../core/feature";
//Colors taken from: http://www.google.ch/design/spec/style/color.html
module.exports.RED_500 = "#F44336";
module.exports.INDIGO_500 = "#3F51B5";
module.exports.GREEN_500 = "#4CAF50";
module.exports.GREEN_100 = "#C8E6C9";
module.exports.GREEN_A200 = "#69F0AE";
module.exports.DEEP_PURPLE_500 = "#673AB7";
module.exports.PURPLE_200 = "#E1BEE7";
module.exports.PURPLE_100 = "#E1BEE7";
module.exports.TEAL_100 = "#B2DFDB";
module.exports.BLUE_50 = "#e3f2fd";
module.exports.BLUE_100 = "#BBDEFB";
module.exports.BLUE_200 = "#90CAF9";
module.exports.BLUE_300 = "#64B5F6";
module.exports.BLUE_500 = "#2196F3";
module.exports.GREY_200 = "#EEEEEE";
module.exports.GREY_300 = "#E0E0E0";
module.exports.GREY_400 = "#BDBDBD";
module.exports.LIGHT_GREEN_100 = "#DCEDC8";
module.exports.GREY_700 = "#616161";
module.exports.GREY_500 = "#9E9E9E";
module.exports.AMBER_50 = "#FFF8E1";
module.exports.PINK_500 = "#E91E63";
module.exports.PINK_300 = "#F06292";
module.exports.BLACK = "#000000";
module.exports.WHITE = "#FFFFFF";

var defaultColorKeys = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
var darkColorKeys = ["300", "400", "500", "600", "700", "800", "900"];

var indigo = {
	"900": "#" + "1A237E",
	"800": "#" + "283593",
	"700": "#" + "303F9F",
	"600": "#" + "3949AB",
	"500": "#" + "3F51B5",
	"400": "#" + "5C6BC0",
	"300": "#" + "7986CB",
	"200": "#" + "9FA8DA",
	"100": "#" + "C5CAE9",
	"50": "#" + "E8EAF6",
	"A100": "#" + "8C9EFF",
	"A200": "#" + "536DFE",
	"A400": "#" + "3D5AFE",
	"A700": "#" + "304FFE",
};

var red = {
	"900": "#" + "B71C1C",
	"800": "#" + "C62828",
	"700": "#" + "D32F2F",
	"600": "#" + "E53935",
	"500": "#" + "F44336",
	"400": "#" + "EF5350",
	"300": "#" + "E57373",
	"200": "#" + "EF9A9A",
	"100": "#" + "FFCDD2",
	"50": "#" + "FFEBEE",
	"A100": "#" + "FF8A80",
	"A200": "#" + "FF5252",
	"A400": "#" + "FF1744",
	"A700": "#" + "D50000"
};

var blue = {
    "900": "#" + "1A237E",
    "800": "#" + "283593",
    "700": "#" + "303F9F",
    "600": "#" + "3949AB",
    "500": "#" + "3F51B5",
    "400": "#" + "5C6BC0",
    "300": "#" + "7986CB",
    "200": "#" + "9FA8DA",
    "100": "#" + "C5CAE9",
    "50": "#" + "E8EAF6",
    "A100": "#" + "8C9EFF",
    "A200": "#" + "536DFE",
    "A400": "#" + "3D5AFE",
    "A700": "#" + "304FFE",
};

var layerColors = {
	"indigo": indigo,
	"red": red,
	"blue": blue
};

var decimalToIndex = function(decimal, indices){
	return Math.round((indices-1) * decimal);
};

var decimalToLayerColor = function(decimal, layerColors, orderedKeys){
	let index = decimalToIndex(decimal, orderedKeys.length);
	let key = orderedKeys[index];
	return layerColors["700"];
};

var renderAllColors = function(layer, orderedKeys){
	for (let i =0 ; i < orderedKeys.length; i ++){
		
		new paper.Path.Circle({
			position: new paper.Point(0+(i*1000), 0),
			fillColor: layer[orderedKeys[i]],
			radius: 500
		});
	}

	for (let i = 0; i < orderedKeys.length; i ++){
		let color = decimalToLayerColor(i/orderedKeys.length, layer, orderedKeys);
		new paper.Path.Circle({
			position: new paper.Point(0+(i*1000), 2000),
			fillColor: layer[orderedKeys[i]],
			radius: 500
		});
	}
};

var getLayerColors = function(layer){
    if(!layer){
        throw new Error("Undefined color");
    }
	if (layer.color) {
        return layerColors[layer.color];
    }
	else {
        if(layer.name == 'flow'){
            return layerColors["indigo"];
        }else if(layer.name == 'control'){
            return layerColors["red"];
        }else if(layer.name == 'cell'){
            return layerColors["green"];
        }
    }
};

var getDefaultLayerColor = function(layer){
	return getLayerColors(layer)["500"];
};

var getDefaultFeatureColor = function(typeString, setString, layer){
	if (layer){
		let height = Feature.getDefaultsForType(typeString, setString)["height"];
		let decimal = height; // layer.estimateLayerHeight();
		if (!layer.flip) decimal = 1-decimal;
		let colors = getLayerColors(layer);
		return decimalToLayerColor(decimal, colors, darkColorKeys);
	}
	else {
		return decimalToLayerColor(0,layerColors["indigo"], darkColorKeys);
	}
};

module.exports.getDefaultLayerColor = getDefaultLayerColor;
module.exports.getDefaultFeatureColor = getDefaultFeatureColor;
module.exports.getLayerColors = getLayerColors;
module.exports.decimalToLayerColor = decimalToLayerColor;
module.exports.defaultColorKeys = defaultColorKeys;
module.exports.darkColorKeys = darkColorKeys;
module.exports.layerColors = layerColors;
module.exports.renderAllColors = renderAllColors;