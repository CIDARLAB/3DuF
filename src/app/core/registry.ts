import uuid from "node-uuid";
import RenderLayer from "../view/renderLayer";
import ViewManager from "../view/viewManager";
import AdaptiveGrid from "../view/grid/adaptiveGrid";
import Device from "./device";
import Layer from "./layer";

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

    public currentDevice: Device | null = null;
    canvasManager = null;
    currentLayer: RenderLayer | null = null;
    currentTextLayer: Layer | null = null;
    currentGrid: AdaptiveGrid | null = null;
    view = null;
    viewManager: ViewManager | null = null;
}

const instance = new Registry();

export default instance;
