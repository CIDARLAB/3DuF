import Parameter from "../core/parameter";
import { ComponentAPI } from "@/componentAPI";
import UIElement from "./uiElement";

export default class TextElement extends UIElement {
    constructor(type: string, paramdata: { [index: string]: Parameter }, featureIDs: Array<string>, id: string = ComponentAPI.generateID()) {
        super(id);
        this.__position = paramdata.position.value;
        this.__height = paramdata.height.value;
        this.__type = type;
        this.__featureIDs = featureIDs;
    }
}
