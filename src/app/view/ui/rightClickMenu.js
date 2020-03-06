import * as HTMLUtils from "../../utils/htmlUtils";
import { createFeatureTable, revertToDefaultParams } from "./parameterMenu";
import * as Registry from "../../core/registry";

export default class RightClickMenu {
    constructor() {
        this.__featureRef = null;
        /*
        Figure out if we can fire the parameters menu
         */
        this.__contextMenu = document.getElementById("contextMenu");

        //Context menu buttons
        this.__copyButton = document.getElementById("context_button_copy");
        this.__deleteButton = document.getElementById("context_button_delete");
        this.__moveButton = document.getElementById("context_button_move");
        this.__revertToDefaultsButton = document.getElementById("context_button_revert");
        this.__copyToAllButton = document.getElementById("context_button_copytoall");
        this.__renameComponentButton = document.getElementById("context_button_rename");
        this.__generateArrayButton = document.getElementById("context_button_arraygen");

        //Textfield stuff
        this.__renameComponentTextField = document.getElementById("rename_component_textfield");
        this.__renameIsVisible = false;
        this.__renameSaveButton = document.getElementById("context_rename_button_save");
        this.__renameCancelButton = document.getElementById("context_rename_button_cancel");
        this.__renameTextInput = document.getElementById("componentname_textinput");
        //Collapse the textrename text input
        this.__collapseTextInput();

        let ref = this;

        //Event handlers
        this.__revertToDefaultsButton.addEventListener("click", function(event) {
            revertToDefaultParams(ref.__featureTable, ref.__typeString, ref.__setString);
        });
        this.__deleteButton.addEventListener("click", function(event) {
            Registry.viewManager.view.deleteSelectedFeatures();
            ref.close();
        });
        this.__copyButton.addEventListener("click", function(event) {
            Registry.viewManager.initiateCopy();
            ref.close();
        });
        this.__copyToAllButton.addEventListener("click", function(event) {
            console.log("Change all the component parameters", event);
            Registry.viewManager.changeAllDialog.showDialog();
            ref.close();
        });
        this.__renameComponentButton.addEventListener("click", function(event) {
            console.log("Show rename button", event);
            if (ref.__renameIsVisible) {
                //Hide
                HTMLUtils.addClass(ref.__renameComponentTextField, "collapse");
            } else {
                //Show
                HTMLUtils.removeClass(ref.__renameComponentTextField, "collapse");
                ref.__renameTextInput.value = ref.getComponentName();
            }
            ref.__renameIsVisible = !ref.__renameIsVisible;
        });

        this.__moveButton.addEventListener("click", function(event) {
            ref.__activateMove();
        });

        this.__generateArrayButton.addEventListener("click", function(event) {
            ref.__activateGenerateArray();
        });

        //Save Rename
        this.__renameSaveButton.addEventListener("click", function(event) {
            let nametext = ref.__renameTextInput.value;
            ref.setComponentName(nametext);
        });

        ///Cancel Rename
        this.__renameCancelButton.addEventListener("click", function(event) {
            let nametext = ref.getComponentName();
            document.getElementById("componentname_textinput").value = nametext;
        });
    }

    show(event, feature) {
        console.log("Feature", feature);
        this.__featureRef = feature;

        //TODO: Figure out if feature belongs to component
        this.__typeString = feature.getType();
        this.__setString = feature.getSet();

        this.__contextMenu.style.left = "" + (event.clientX + 30) + "px";
        this.__contextMenu.style.top = "" + (event.clientY - 20) + "px";
        this.__contextMenu.style.opacity = 0.8;

        //Delete any table in the context menu
        let table = this.__contextMenu.querySelector("table");
        if (table) {
            this.__contextMenu.removeChild(table);
        }

        //Insert the table under the buttons
        this.__featureTable = createFeatureTable(this.__typeString, this.__setString);
        this.__contextMenu.appendChild(this.__featureTable);

        HTMLUtils.removeClass(this.__featureTable, "hidden-block");
        HTMLUtils.addClass(this.__featureTable, "shown-block");

        HTMLUtils.removeClass(this.__contextMenu, "hidden-block");
        HTMLUtils.addClass(this.__contextMenu, "shown-block");
    }

    close() {
        this.__collapseTextInput();
        HTMLUtils.removeClass(this.__featureTable, "shown-block");
        HTMLUtils.addClass(this.__featureTable, "hidden-block");
        HTMLUtils.removeClass(this.__contextMenu, "shown-block");
        HTMLUtils.addClass(this.__contextMenu, "hidden-block");

        //TODO: Need to delete the child table, need to check if this is the same thing
        // if(this.__featureTable){
        //     this.__contextMenu.removeChild(this.__featureTable);
        // }
    }

    setComponentName(nametext) {
        let id = this.__featureRef.getID();
        //Find component for the feature id
        let component = Registry.currentDevice.getComponentForFeatureID(id);
        if (component) {
            component.setName(nametext);
            console.log("renamed component", component);
        } else {
            throw new Error("Could not find component to rename");
        }
    }

    getComponentName() {
        let id = this.__featureRef.getID();
        //Find component for the feature id
        let component = Registry.currentDevice.getComponentForFeatureID(id);
        if (component) {
            return component.getName();
        } else {
            throw new Error("Could not find component to rename");
        }
    }

    __collapseTextInput() {
        this.__renameIsVisible = false;
        HTMLUtils.addClass(this.__renameComponentTextField, "collapse");
    }

    __activateGenerateArray() {
        this.close();
        Registry.viewManager.activateTool("GenerateArrayTool");
        let component = Registry.currentDevice.getComponentForFeatureID(this.__featureRef.getID());
        Registry.viewManager.tools["GenerateArrayTool"].activate(component);
    }

    __activateMove() {
        this.close();
        Registry.viewManager.activateTool("MoveTool");
        let component = Registry.currentDevice.getComponentForFeatureID(this.__featureRef.getID());
        Registry.viewManager.tools["MoveTool"].activate(component);
    }
}
