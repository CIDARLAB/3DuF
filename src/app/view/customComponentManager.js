import ImportComponentDialog from "./ui/importComponentDialog";
import CustomComponent from "../core/customComponent";

export default class CustomComponentManager {
    constructor(viewManager){
        this.viewManagerDelegate = viewManager;
        this.importComponentDialog = new ImportComponentDialog(this);
        this.library = new Map();

    }

    /**
     * inserts a new component
     * @param dxfdata
     */
    importComponentFromDXF(type, dxfdata){
        console.log("Yay ! loaded the data", dxfdata);
        //Create DXF Objects
        let customcomponent = new CustomComponent(type, dxfdata);
        this.library.set(name, customcomponent);
    }

}