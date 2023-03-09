
import ComponentPort from "../../core/componentPort";
import { GeometricOperationType, ToolPaperObject } from "../../core/init";
import paper from "paper";
//import { ManufacturingInfo } from "../manufacturing/ManufacturingInfo";
import { LogicalLayerType  } from "../../core/init";
import {PRIMITIVES_SERVER} from "../../../componentAPI";

export default class FeatureTemplate {

    protected _macro: string = "FeatureTemplate";
    protected _geometricOperation: GeometricOperationType = GeometricOperationType.UNION;
    protected __unique: { [key: string]: string } | null = null;
    protected __heritable: { [key: string]: string } | null = null;
    protected __defaults: { [key: string]: number } | null = null;
    protected __minimum: { [key: string]: number } | null = null;
    protected __maximum: { [key: string]: number } | null = null;
    protected __units: { [key: string]: string } | null = null;
    protected __toolParams: { [key: string]: string } | null = null; // { position: "position" };
    protected __featureParams: { [key: string]: string } | null = null;
    protected __targetParams: { [key: string]: string } | null = null;


    /**
     *Creates an instance of Template.
     * @memberof Template
     */
    constructor() {
        this.__setupDefinitions();
        this.__checkDefinitions();
    }

    __setupDefinitions(): void {
        //Throw an error if this function is not implemented
        throw new Error("Method not implemented.");
    }

    __checkDefinitions(): void {
        //Check that all the definitions are set
        if (this._macro === null) {
            throw new Error("Macro not defined");
        }
        if (this.__unique === null) {
            throw new Error("Unique parameters not defined");
        }
        if (this.__heritable === null) {
            throw new Error("Heritable parameters not defined");
        }
        if (this.__defaults === null) {
            throw new Error("Default parameters not defined");
        }
        if (this.__minimum === null) {
            throw new Error("Minimum parameters not defined");
        }
        if (this.__maximum === null) {
            throw new Error("Maximum parameters not defined");
        }
        if (this.__units === null) {
            throw new Error("Units not defined");
        }
        if (this.__toolParams === null) {
            throw new Error("Tool parameters not defined");
        }
        if (this.__featureParams === null) {
            throw new Error("Feature parameters not defined");
        }
        if (this.__targetParams === null) {
            throw new Error("Target parameters not defined");
        }
    }

    /**
     * Get the Macro parameters for the feature
     *
     * @type {GeometricOperationType}
     * @memberof FeatureTemplate
     */
    get geometricOperation(): GeometricOperationType {
        return this._geometricOperation;
    }

    /**
     * Get the Macro parameters for the feature
     * 
     * @type {string}
     * @memberof FeatureTemplate
     */
    get macro(): string {
        return this._macro;
    }

}

