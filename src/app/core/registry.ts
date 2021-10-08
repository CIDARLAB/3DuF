import uuid from "node-uuid";
import { registerSets } from "../featureSets";
import FeatureSet from "../featureSets/featureSet";
import RenderLayer from "../view/renderLayer";
import ViewManager from "../view/viewManager";
import AdaptiveGrid from "../view/grid/adaptiveGrid";
import Device from "./device";
import * as Basic from "@/app/featureSets/basic";
import { ViewManager } from "..";

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
    public currentDevice: Device | null = null;
    canvasManager = null;
    currentLayer: RenderLayer | null = null;
    currentTextLayer = null;
    currentGrid: AdaptiveGrid | null = null;
    view = null;
    viewManager: ViewManager | null = null;
    featureSet = null;
}

const instance = new Registry();

export default instance;
