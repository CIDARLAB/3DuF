import ImportComponentDialog from "./ui/importComponentDialog";
import CustomComponent from "../core/customComponent";
import CustomComponentToolBar from "./ui/customComponentToolBar";

export default class CustomComponentManager {
    constructor(viewManager){
        this.viewManagerDelegate = viewManager;
        this.importComponentDialog = new ImportComponentDialog(this);
        this.__library = new Map();
        this.customComponentToolBar = new CustomComponentToolBar(this);

    }

    get library(){
        return this.__library;
    }

    /**
     * inserts a new component
     * @param dxfdata
     */
    importComponentFromDXF(type, dxfdata, renderData){
        console.log("Yay ! loaded the data", dxfdata);
        console.log("Render Data", renderData);
        //Create DXF Objects
        let customcomponent = new CustomComponent(type, dxfdata);
        customcomponent.renderData = renderData;
        this.__library.set(type, customcomponent);

        this.customComponentToolBar.updateToolBar();
    }

}