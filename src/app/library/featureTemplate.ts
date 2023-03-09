
import ComponentPort from "../core/componentPort";
import { GeometricOperationType, ToolPaperObject } from "../core/init";
import paper from "paper";
//import { ManufacturingInfo } from "../manufacturing/ManufacturingInfo";
import { LogicalLayerType  } from "../core/init";
import {PRIMITIVES_SERVER} from "../../componentAPI";
import Template from "./template";
export enum PositionToolType {
    FEATURE_POSITION_TOOL = "positionTool",
    COMPONENT_POSITION_TOOL = "componentPositionTool",
    MULTILAYER_POSITION_TOOL = "multilayerPositionTool",
    VALVE_INSERTION_TOOL = "valveInsertionTool"
}

export default class FeatureTemplate extends Template {

    private _geometricOperation: GeometricOperationType = GeometricOperationType.UNION;

    /**
     *Creates an instance of Template.
     * @memberof Template
     */
    constructor() {
        super();
    }

    /**
     * Get the Macro parameters for the feature
     *
     * @protected
     * @type {GeometricOperationType}
     * @memberof FeatureTemplate
     */
    protected get geometricOperation(): GeometricOperationType {
        return this._geometricOperation;
    }

    /**
     * Set the Macro parameters for the feature
     *
     * @protected
     * @memberof FeatureTemplate
     */
    protected set geometricOperation(value: GeometricOperationType) {
        this._geometricOperation = value;
    }

}

