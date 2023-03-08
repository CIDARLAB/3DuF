import { ComponentAPI } from "@/componentAPI";
import { FeatureTypeMacro } from "./init";
import Layer from "./layer";

export default class GeometryElement {

    private _id: string;
    private _type: string;
    private _macro: FeatureTypeMacro;
    private _layer: Layer;

    constructor(id: string = ComponentAPI.generateID(), type:string, macro: FeatureTypeMacro, layer: Layer, params: { [k: string]: any } = {}) {
        this._id = id;
        this._type = type;
        this._macro = macro;
        this._layer = layer;
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

    toJSON() {[key: string] : any} {

    }
}