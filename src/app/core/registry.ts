import uuid from "node-uuid";
import { registerSets } from "../featureSets";
import FeatureSet from "../featureSets/featureSet";
import * as Basic from "@/app/featureSets/basic";

class Registry {
    /*
    Place where we store the data necessary for the text label
    TODO: Change this from this awful hacky implementation
  */
    constructor() {
        // registerSets({ Basic: Basic });
    }

    //TODO: Convert this into multiple text layers for use with multiple layers
    id_counter = 0;
    threeRenderer = null;

    featureDefaults = {
        Basic: new FeatureSet(Basic.definitions, Basic.tools, Basic.render2D, Basic.render3D, "Basic").getDefaults()
    };
    public currentDevice = null;
    canvasManager = null;
    currentLayer = null;
    currentTextLayer = null;
    currentGrid = null;
    view = null;
    viewManager = null;
    featureSet = null;

    generateID(): string {
        return uuid.v1();
    }
}

const instance = new Registry();

export default instance;
