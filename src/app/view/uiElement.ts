import Parameter from "../core/parameter";
import { ComponentAPI } from "@/componentAPI";

export default class UIElement {
    protected __type: string;
    protected __position: [number, number];
    protected __height: number;
    protected __featureIDs: Array<string>;
    protected __id: string;

    //constructor(type: string, paramdata: { [index: string]: Parameter }, featureIDs: Array<string>, id: string = ComponentAPI.generateID()) {
    constructor(id: string = ComponentAPI.generateID()) {
        this.__position = [0, 0];
        this.__height = 0;
        this.__type = "BlankUIElement";
        this.__featureIDs = [];
        // this.__position = paramdata.position.value;
        // this.__height = paramdata.height.value;
        // this.__type = type;
        // this.__featureIDs = featureIDs;
        this.__id = id;
    }

    get type(): string {
        return this.__type;
    }

    get featureIDs(): Array<string> {
        return this.__featureIDs;
    }

    get position(): [number, number] {
        return this.__position;
    }

    get id(): string {
        return this.__id;
    }

    hasFeatureID(featureID: string): boolean {
        if (this.__featureIDs.includes(featureID)) return true;
        else return false;
    }

    draw(): void  {
        console.log(`Drawing at ${this.__position[0]}, ${this.__position[1]}`);
    }
}
