import ComponentPort from "../core/componentPort";
import paper from "paper"
import { paperObject } from "../core/init";
//import { ManufacturingInfo } from "../manufacturing/ManufacturingInfo";
import { LogicalLayerType  } from "../core/init";

export enum PositionToolType {
    FEATURE_POSITION_TOOL = "positionTool",
    COMPONENT_POSITION_TOOL = "componentPositionTool",
    MULTILAYER_POSITION_TOOL = "multilayerPositionTool",
    VALVE_INSERTION_TOOL = "valveInsertionTool"
}

export default class Template {
    protected __unique: { [key: string]: string } | null = null;
    protected __heritable: { [key: string]: string } | null = null;
    protected __defaults: { [key: string]: number } | null = null;
    protected __minimum: { [key: string]: number } | null = null;
    protected __maximum: { [key: string]: number } | null = null;
    protected __units: { [key: string]: string } | null = null;
    protected __placementTool: string | null = null;
    protected __toolParams: { [key: string]: string } | null = null; // { position: "position" };
    protected __featureParams: { [key: string]: string } | null = null;
    protected __targetParams: { [key: string]: string } | null = null;
    protected __mint: string | null = null;
    protected __renderKeys: Array<string> | null = null;
    protected _previewImage: string = "";
    protected __zOffsetKeys: { [key: string]: string } | null = null;
    protected __substrateOffset: { [key: string]: string } | null = null;

    /**
     *Creates an instance of Template.
     * @memberof Template
     */
    constructor() {
        this.__setupDefinitions();
    }

    /**
     * Returns the mint definition for the component definition
     *
     * @readonly
     * @type {string}
     * @memberof Template
     */
    get mint(): string {
        if (this.__mint === null) {
            throw new Error("User needs to provide unique MINT string for component type");
        }
        return this.__mint;
    }

    /**
     * Returns the z-offset-key for the given layer type
     *
     * @param {string}
     * @memberof Template
     */
    zOffsetKey(key: string): string {
        console.log("This: ", this);
        console.log("Keys: ", this.__zOffsetKeys);
        if (this.__zOffsetKeys != null) console.log("FLOW?: ", this.__zOffsetKeys.hasOwnProperty("FLOW"));
        if (this.__zOffsetKeys != null) console.log("FLOW?: ", this.__zOffsetKeys.hasOwnProperty(key));
        console.log("key: ", key);
        console.log("FLOW" == key);
        //if (this.__zOffsetKeys) throw new Error("The fuck");
        if (this.__zOffsetKeys === null) {
            throw new Error("zOffsetKey cannot be null instantiate in the __setupDefinitions");
        } else if (this.__zOffsetKeys.hasOwnProperty(key)) {
            console.log("Here");
            return this.__zOffsetKeys[key];
        } else {
            throw new Error("zOffsetKey does not contain key " + key);
        }
    }

    /**
     * Returns the z-offset-key for the given layer type
     *
     * @param {string}
     * @memberof Template
     */
    substrateOffset(key: string): string {
        if (this.__substrateOffset === null) {
            throw new Error("substrateOffset cannot be null instantiate in the __setupDefinitions");
        } else if (this.__substrateOffset.hasOwnProperty(key)) {
            return this.__substrateOffset[key];
        } else {
            throw new Error("substrateOffset does not contain key " + key);
        }
    }

    /**
     * TODO - Remove this thing's dependency
     */
    get featureParams(): { [key: string]: string } {
        if (this.__featureParams === null) {
            throw new Error("featureParams cannot be null instantiate in the __setupDefinitions");
        }

        return this.__featureParams;
    }

    /**
     * TODO - Remove this thing's dependency
     */
    get targetParams(): { [key: string]: string } {
        if (this.__targetParams === null) {
            throw new Error("targetParams cannot be null instantiate in the __setupDefinitions");
        }

        return this.__targetParams;
    }

    /**
     * Returns the placement tool for the component/feature
     *
     * @readonly
     * @type {string}
     * @memberof Template
     */
    get placementTool(): string {
        if (this.__placementTool === null) {
            throw new Error("placementtool cannot be null instantiate in the __setupDefinitions");
        }

        return this.__placementTool;
    }

    /**
     * Returns the tool params for the component
     *
     * @readonly
     * @type {{ [key: string]: string }}
     * @memberof Template
     */
    get toolParams(): { [key: string]: string } {
        if (this.__toolParams === null) {
            throw new Error("toolparams cannot be null instantiate in the __setupDefinitions");
        }

        return this.__toolParams;
    }

    /**
     * Returns the default value for the component params
     *
     * @readonly
     * @type {{ [key: string]: number }}
     * @memberof Template
     */
    get defaults(): { [key: string]: number } {
        if (this.__defaults === null) {
            throw new Error("defaults cannot be null instantiate in the __setupDefinitions");
        }

        return this.__defaults;
    }

    /**
     * Returns the min value for the component params
     *
     * @readonly
     * @type {{ [key: string]: number }}
     * @memberof Template
     */
    get minimum(): { [key: string]: number } {
        if (this.__minimum === null) {
            throw new Error("minimum cannot be null instantiate in the __setupDefinitions");
        }

        return this.__minimum;
    }

    /**
     * Returns the max value for the component params
     *
     * @readonly
     * @type {{ [key: string]: number }}
     * @memberof Template
     */
    get maximum(): { [key: string]: number } {
        if (this.__maximum === null) {
            throw new Error("maximum cannot be null instantiate in the __setupDefinitions");
        }

        return this.__maximum;
    }

    /**
     * Returns the units for the component params
     *
     * @readonly
     * @type {{ [key: string]: string }}
     * @memberof Template
     */
    get units(): { [key: string]: string } {
        if (this.__units === null) {
            throw new Error("units cannot be null instantiate in the __setupDefinitions");
        }

        return this.__units;
    }

    /**
     * Returns the unique params for the component definition
     *
     * @readonly
     * @type {{ [key: string]: string }}
     * @memberof Template
     */
    get unique(): { [key: string]: string } {
        if (this.__unique === null) {
            throw new Error("unique cannot be null instantiate in the __setupDefinitions");
        }

        return this.__unique;
    }

    /**
     * Returns the heritable properties for the component definition
     *
     * @readonly
     * @type {{ [key: string]: string }}
     * @memberof Template
     */
    get heritable(): { [key: string]: string } {
        if (this.__heritable === null) {
            throw new Error("Heritable cannot be null instantiate in the __setupDefinitions");
        }
        return this.__heritable;
    }

    /**
     * Returns the renderkeys for the component definition
     *
     * @readonly
     * @type {Array<string>}
     * @memberof Template
     */
    get renderKeys(): Array<string> {
        if (this.__renderKeys === null) {
            throw new Error("renderKeys cannot be null instantiate in the __setupDefinitions");
        }

        return this.__renderKeys;
    }

    /**
     * Returns the preview link for the component
     *
     * @readonly
     * @type {string}
     * @memberof Template
     */
    get previewImage(): string {
        return this._previewImage;
    }

    __setupDefinitions(): void {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            height: 1200
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position"
        };

        this.__targetParams = {
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "TEMPLATE";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };

        /*
        Check https://github.com/CIDARLAB/3DuF/wiki/Adding-new-components-v2 for more example data
         */
        //throw new Error("User needs to provide method for component definition, look at examples");
    }

    /**
     * Replacing /src/app/view/render2D/primitiveSets2D/basic2D
     */

    /**
     * Returns the paperjs render for a given key (can be control/flow or anything user defined key that for future
     * compatibility.
     * @param key
     */
    render2D(params: { [key: string]: any }, key: string): paperObject {
        console.error("Default component template being used. User needs to provide method for component definition, look at examples")
        const x = params.position[0];
        const y = params.position[1];

        const rect =  new paper.Path.Rectangle(new paper.Point(x - 100, y - 100), new paper.Size(5000, 5000));
        rect.fillColor = params.color;
        return rect;
        //throw new Error("User needs to provide method for component definition, look at examples");
    }

    render2DTarget(key: string, params: { [key: string]: any }): paperObject {
        throw new Error("User needs to provide method for component definition, look at examples");
    }

    /**
     * Returns the ports for the component definition
     * @param params
     */
    getPorts(params: { [key: string]: any }): Array<ComponentPort> {
        console.error("User needs to provide method for component definition, look at examples");
        const ports = [];
        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));
        return ports;
    }

    getBounds(params: { [key: string]: any }): paper.Rectangle | null {
        const renderkeys = this.renderKeys;
        const features = [];
        for (let i = 0; i < renderkeys.length; i++) {
            // console.log("Rendering layer: " + renderkeys[i]);
            const feature = this.render2D(params, renderkeys[i]);
            features.push(feature);
        }
        const unitedBounds = features.reduce((bbox, item) => {
            return !bbox ? item.bounds : bbox.unite(item.bounds);
        }, null);
        if (unitedBounds) {
            return unitedBounds;
        } else {
            return null;
        }
    }

    getDimensions(params: { [key: string]: any }): { xspan: any; yspan: any } {
        params.position = [0, 0];

        const unitedBounds = this.getBounds(params);
        if (unitedBounds === null) {
            throw new Error("No bounds found for component");
        }  
        const xspan = unitedBounds.width;
        const yspan = unitedBounds.height;
        // console.log("Dimensions:",xspan, yspan);
        return { xspan: xspan, yspan: yspan };
    }

    getDrawOffset(params: { [key: string]: any }) {
        params.position = [0, 0];
        params.rotation = 0;
        const position = params.position;
        const positionUnitedBounds = this.getBounds(params);
        // console.log(positionUnitedBounds.topLeft, position);
        if (positionUnitedBounds === null) {
            throw new Error("unitedBounds is null");
        }
        const x_new = position[0] - positionUnitedBounds.topLeft.x;
        const y_new = position[1] - positionUnitedBounds.topLeft.y;
        return [x_new, y_new];
    }
}
