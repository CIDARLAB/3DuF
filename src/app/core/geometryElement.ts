import { ComponentAPI } from "@/componentAPI";
import { FeatureTypeMacro, GeometryElementInterchangeV1_2 } from "./init";
import Layer from "./layer";
import Params from "./params";

export default class GeometryElement {

    private _id: string;
    private _type: string;
    private _macro: FeatureTypeMacro;
    private _layer: Layer;

    private _params: Params;

    constructor(id: string = ComponentAPI.generateID(), type:string, macro: FeatureTypeMacro, layer: Layer, params: { [k: string]: any } = {}) {
        this._id = id;
        this._type = type;
        this._macro = macro;
        this._layer = layer;

        // Initilize the params
        this._params = new Params(params, new Map<string, string>(), new Map<string, string>());
    }

    get id(): string {
        return this._id;
    }

    get type(): string {
        return this._type;
    }

    get macro(): FeatureTypeMacro {
        return this._macro;
    }

    get layer(): Layer {
        return this._layer;
    }

    get params(): Params {
        return this._params;
    }

    toInterchageV1_2(): GeometryElementInterchangeV1_2 {
        return {
            id: this._id,
            macro: this._macro,
            params: this._params.toJSON(),
            type: this._type,
            mgflayerID: this._layer.id
        };
    }
}