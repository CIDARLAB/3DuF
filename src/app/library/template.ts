import ComponentPort from "../core/componentPort";
import { DFMType } from "../manufacturing/manufacturingInfo";
//import { ManufacturingInfo } from "../manufacturing/manufacturingInfo";

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
    protected fabtype: { [key: string]: DFMType } | null = {"FLOW": DFMType.XY, "CONTROL": DFMType.XY};

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
        if (this.__zOffsetKeys === null) {
            throw new Error("zOffsetKey cannot be null instantiate in the __setupDefinitions");
        } else if (this.__zOffsetKeys.hasOwnProperty(key)) {
            return this.__zOffsetKeys[key];
        } else {
            throw new Error("zOffsetKey does not contain given key");
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
            throw new Error("zOffsetKey cannot be null instantiate in the __setupDefinitions");
        } else if (this.__substrateOffset.hasOwnProperty(key)) {
            return this.__substrateOffset[key];
        } else {
            throw new Error("substrateOffset does not contain given key");
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
        /*
        Check https://github.com/CIDARLAB/3DuF/wiki/Adding-new-components-v2 for more example data
         */
        throw new Error("User needs to provide method for component definition, look at examples");
    }

    /**
     * Replacing /src/app/view/render2D/primitiveSets2D/basic2D
     */

    /**
     * Returns the paperjs render for a given key (can be control/flow or anything user defined key that for future
     * compatibility.
     * @param key
     */
    render2D(params: { [key: string]: any }, key: string): any {
        throw new Error("User needs to provide method for component definition, look at examples");
    }

    render2DTarget(key: string, params: { [key: string]: any }): void {
        throw new Error("User needs to provide method for component definition, look at examples");
    }

    /**
     * Returns the ports for the component definition
     * @param params
     */
    getPorts(params: { [key: string]: any }): Array<ComponentPort> {
        throw new Error("User needs to provide method for component definition, look at examples");
    }

    getBounds(params: { [key: string]: any }) {
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
        return unitedBounds;
    }

    getDimensions(params: { [key: string]: any }): { xspan: any; yspan: any } {
        params.position = [0, 0];

        const unitedBounds = this.getBounds(params);
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
        const x_new = position[0] - positionUnitedBounds.topLeft.x;
        const y_new = position[1] - positionUnitedBounds.topLeft.y;
        return [x_new, y_new];
    }

    /**
     * Returns the fab type of the component
     *
     * @param {string} key
     * @returns {string}
     * @memberof Template
     */
    getFabType(key: string): DFMType {
        if (this.fabtype === null) {
            throw new Error("fabType cannot be null instantiate in the __setupDefinitions");
        } else if(this.fabtype.hasOwnProperty(key)) {
            return this.fabtype[key];
        } else {
            throw new Error("fabType does not have key: " + key);
        }
    }
}
