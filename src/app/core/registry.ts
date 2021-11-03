import uuid from "node-uuid";
import { registerSets } from "../featureSets/index.js";
import FeatureSet from "../featureSets/featureSet";
import RenderLayer from "../view/renderLayer";
import ViewManager from "../view/viewManager";
import AdaptiveGrid from "../view/grid/adaptiveGrid";
import Device from "./device";
import * as Basic from "@/app/featureSets/basic";
import Layer from "./layer.js";

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

    featureDefaults: { [k: string]: any } = {
        Basic: new FeatureSet(Basic.definitions, Basic.tools, Basic.render2D, Basic.render3D, "Basic").getDefaults()
    };
    public currentDevice: Device | null = null;
    canvasManager = null;
    currentLayer: RenderLayer | null = null;
    currentTextLayer: Layer | null = null;
    currentGrid: AdaptiveGrid | null = null;
    view = null;
    viewManager: ViewManager | null = null;
    featureSet: FeatureSet | null = null;
}

const instance = new Registry();

export default instance;
