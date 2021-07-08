import uuid from "node-uuid";

class Registry {
    /*
    Place where we store the data necessary for the text label
    TODO: Change this from this awful hacky implementation
  */
    text = "";

    //TODO: Convert this into multiple text layers for use with multiple layers
    textLayer = null;
    id_counter = 0;
    threeRenderer = null;

    registeredParams = {};
    featureDefaults = {};
    currentDevice = null;
    canvasManager = null;
    currentLayer = null;
    currentTextLayer = null;
    currentGrid = null;
    view = null;
    viewManager = null;
    featureSet = null;

    generateID() {
        return uuid.v1();
    }
}

const instance = new Registry();

export default instance;
