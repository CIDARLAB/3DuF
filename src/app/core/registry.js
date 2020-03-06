import uuid from "node-uuid";

class Registry {

    text = "";
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

  construtor() {
    /*
      Place where we store the data necessary for the text label
      TODO: Change this from this awful hacky implementation
    */

    //TODO: Convert this into multiple text layers for use with multiple layers
  }

  generateID() {
      return uuid.v1();
  }
}

const instance = new Registry()

export default instance 





