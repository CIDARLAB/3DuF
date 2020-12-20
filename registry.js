import uuid from "node-uuid";

let registeredParams = {};
let featureDefaults = {};
let currentDevice = null;
let canvasManager = null;
let currentLayer = null;
let currentTextLayer = null;
let currentGrid = null;
let view = null;
let viewManager = null;
let featureSet = null;

/*
Place where we store the data necessary for the text label
TODO: Change this from this awful hacky implementation
 */
var text = "";

//TODO: Convert this into multiple text layers for use with multiple layers
var textLayer = null;
var id_counter = 0;
var threeRenderer = null;

export function generateID() {
    return uuid.v1();
}

export { registeredParams, currentDevice, currentLayer, canvasManager, viewManager, currentGrid, featureDefaults, threeRenderer, text, featureSet };
