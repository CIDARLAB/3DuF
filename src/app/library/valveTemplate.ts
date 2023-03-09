import { extend } from "vue/types/umd";
import Template from "./template";
import { ValveType } from "../core/init";

export default class ValveTemplate extends Template{
    protected _valveType: ValveType = ValveType.NORMALLY_OPEN;
    constructor(valveType: ValveType) {
        super();
        this._valveType = valveType;
    }

    get valveType(): ValveType {
        return this._valveType;
    }
    
}