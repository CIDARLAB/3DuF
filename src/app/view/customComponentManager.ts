import ImportComponentDialog from "./ui/importComponentDialog";
import CustomComponent from "../core/customComponent";
import Registry from "../core/registry";
import ViewManager from "./viewManager";

export default class CustomComponentManager {
    viewManagerDelegate: ViewManager;
    importComponentDialog: ImportComponentDialog;
    private __library: Map<any, any>;

    /**
     * Default Constructor of the CustomComponentManger object
     * @param {*} viewManager
     */
    constructor(viewManager: ViewManager) {
        this.viewManagerDelegate = viewManager;
        this.importComponentDialog = new ImportComponentDialog(this);
        this.__library = new Map();

        // set up registry for custom tools
        Registry.featureDefaults.Custom = {};
    }

    /**
     * Gets the library
     * @memberof CustomComponentManager
     * @returns {}
     */
    get library() {
        return this.__library;
    }

    /**
     * Inserts a new component
     * @param {string} type Type of component
     * @param dxfdata DXF data
     * @param renderData Render data
     * @returns {void}
     * @memberof CustomComponentManager
     */
    importComponentFromDXF(type: string, dxfdata: any, renderData: any): void  {
        // console.log("Yay ! loaded the data", dxfdata);
        // console.log("Render Data", renderData);
        // Create DXF Objects
        const customcomponent = new CustomComponent(type, dxfdata);
        customcomponent.renderData = renderData;
        this.__library.set(type, customcomponent);
        this.viewManagerDelegate.addCustomComponentTool(type);
        (this.viewManagerDelegate as any).rightPanel.customComponentToolBar.updateToolBar();
    }

    /**
     * Import a new component from a JSON format
     * @param {CustomComponent} customcomponent Custom component object
     * @returns {void}
     * @memberof CustomComponentManager
     */
    __importComponentFromDeserializedJSON(customcomponent: CustomComponent): void  {
        this.__library.set(customcomponent.type, customcomponent);
        this.viewManagerDelegate.addCustomComponentTool(customcomponent.type);
        (this.viewManagerDelegate as any).rightPanel.customComponentToolBar.updateToolBar();
    }

    /**
     * Gets the custom component
     * @param {*} componenttype
     * @returns {}
     * @memberof CustomComponentManager
     */
    getCustomComponent(componenttype: string) {
        return this.__library.get(componenttype);
    }

    /**
     * Converts to JSON format
     * @returns {JSON}
     * @memberof CustomComponentManager
     */
    toJSON() {
        const ret: { [k: string]: any } = {};

        for (const key of this.__library.keys()) {
            const customcomponent = this.__library.get(key);
            // console.log("Key:", key);
            // console.log("Key:", customcomponent);
            ret[key] = customcomponent.toJSON();
        }

        // console.log("library", this.__library);
        // console.log("ret", ret);

        return ret;
    }

    /**
     * Loads from a JSON format
     * @param {JSON} json
     * @memberof CustomComponentManager
     * @returns {void}
     */
    loadFromJSON(json: { [k: string]: any }): void  {
        for (const key in json) {
            const customcomponent = CustomComponent.fromInterchangeV1(json[key]);

            this.__importComponentFromDeserializedJSON(customcomponent);
        }
    }

    /**
     * Checks if the library has a definition ?
     * @param {*} entity
     * @returns {}
     * @memberof CustomComponentManager
     */
    hasDefinition(entity: any): boolean  {
        return this.__library.has(entity);
    }
}
