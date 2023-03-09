import { GeometricOperationType } from "@/app/core/init";
import FeatureTemplate from "./featureTemplate";

export default class NormallyClosedValveModificationsGap extends FeatureTemplate {
    constructor() {
        super();
    }

    __setupDefinitions(): void {
        this._macro = "VALVE3D GAP";

        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            rotation: "Float",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            width: "Float",
            length: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            valveRadius: 1.2 * 1000,
            height: 250,
            gap: 0.6 * 1000,
            width: 2.4 * 1000,
            length: 2.4 * 1000
        };

        this.__units = {
            componentSpacing: "μm",
            valveRadius: "μm",
            height: "μm",
            gap: "μm",
            width: "μm",
            length: "μm",
            rotation: "°"
        };

        this.__minimum = {
            componentSpacing: 0,
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            rotation: 0,
            width: 10,
            length: 10

        };

        this.__maximum = {
            componentSpacing: 10000,
            valveRadius: 0.3 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            rotation: 180,
            width: 3 * 1000,
            length: 3 * 1000
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap"
        };

        this._geometricOperation = GeometricOperationType.DIFFERENCE;
        
    }

}