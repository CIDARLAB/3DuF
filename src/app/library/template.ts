import ComponentPort from "../core/componentPort";

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

    /**
     *Creates an instance of Template.
     * @memberof Template
     */
    constructor() {
        this.__setupDefinitions();
    }

    get mint(): string {
        if (this.__mint === null) {
            throw new Error("User needs to provide unique MINT string for component type");
        }
        return this.__mint;
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

    get placementTool(): string {
        if (this.__placementTool === null) {
            throw new Error("placementtool cannot be null instantiate in the __setupDefinitions");
        }

        return this.__placementTool;
    }

    get toolParams(): { [key: string]: string } {
        if (this.__toolParams === null) {
            throw new Error("toolparams cannot be null instantiate in the __setupDefinitions");
        }

        return this.__toolParams;
    }

    get defaults(): { [key: string]: number } {
        if (this.__defaults === null) {
            throw new Error("defaults cannot be null instantiate in the __setupDefinitions");
        }

        return this.__defaults;
    }

    get minimum(): { [key: string]: number } {
        if (this.__minimum === null) {
            throw new Error("minimum cannot be null instantiate in the __setupDefinitions");
        }

        return this.__minimum;
    }

    get maximum(): { [key: string]: number } {
        if (this.__maximum === null) {
            throw new Error("maximum cannot be null instantiate in the __setupDefinitions");
        }

        return this.__maximum;
    }

    get units(): { [key: string]: string } {
        if (this.__units === null) {
            throw new Error("units cannot be null instantiate in the __setupDefinitions");
        }

        return this.__units;
    }

    get unique(): { [key: string]: string } {
        if (this.__unique === null) {
            throw new Error("unique cannot be null instantiate in the __setupDefinitions");
        }

        return this.__unique;
    }

    get heritable(): { [key: string]: string } {
        if (this.__heritable === null) {
            throw new Error("Heritable cannot be null instantiate in the __setupDefinitions");
        }
        return this.__heritable;
    }

    get renderKeys(): Array<string> {
        if (this.__renderKeys === null) {
            throw new Error("renderKeys cannot be null instantiate in the __setupDefinitions");
        }

        return this.__renderKeys;
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

    render2DTarget(key: string, params: { [key: string]: any }): void  {
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

    getDimensions(params: { [key: string]: any }): {xspan: any;
yspan: any;
}  {
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
}
