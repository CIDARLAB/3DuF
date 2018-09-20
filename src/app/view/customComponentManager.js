import ImportComponentDialog from "./ui/importComponentDialog";
import CustomComponent from "../core/customComponent";
const Registry = require('../core/registry');

export default class CustomComponentManager {
    constructor(viewManager){
        this.viewManagerDelegate = viewManager;
        this.importComponentDialog = new ImportComponentDialog(this);
        this.__library = new Map();

        //set up registry for custom tools
        Registry.featureDefaults["Custom"] = {};

    }

    get library(){
        return this.__library;
    }

    /**
     * inserts a new component
     * @param type
     * @param type
     * @param renderData
     * @param dxfdata
     * @param renderData
     */
    importComponentFromDXF(type, dxfdata, renderData){
        // console.log("Yay ! loaded the data", dxfdata);
        // console.log("Render Data", renderData);
        //Create DXF Objects
        let customcomponent = new CustomComponent(type, dxfdata);
        customcomponent.renderData = renderData;
        this.__library.set(type, customcomponent);
        this.viewManagerDelegate.addCustomComponentTool(type);
        this.viewManagerDelegate.rightPanel.customComponentToolBar.updateToolBar();
    }

    getCustomComponent(componenttype) {
        return this.__library.get(componenttype);
    }
}