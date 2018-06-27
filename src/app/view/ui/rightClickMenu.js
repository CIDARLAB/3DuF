import * as HTMLUtils from "../../utils/htmlUtils";
import {createFeatureTable, revertToDefaultParams} from "./parameterMenu";

export default class RightClickMenu {

    constructor(feature, point){
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

        //TODO: Figure out if feature belongs to component
        this.__typeString = feature.getType();
        this.__setString = feature.getSet();

        let ref = this;

        //Event handlers
        this.__revertToDefaultsButton.addEventListener('click', function (event) {
            revertToDefaultParams(ref.__featureTable, ref.__typeString, ref.__setString);
        });
        this.__deleteButton.addEventListener('click', function (event) {
            Registry.viewManager.view.deleteSelectedFeatures();
            ref.close();
        });
        this.__copyButton.addEventListener('click', function (event) {
            Registry.viewManager.initiateCopy();
            ref.close();
        });
        this.__copyToAllButton.addEventListener('click', function (event) {
            console.log("Change all the component parameters", event);
            Registry.viewManager.changeAllDialog.showDialog();
            ref.close();
        });

    }

    show(event){
        this.__contextMenu.style.left = "" + (event.clientX + 30)+ "px";
        this.__contextMenu.style.top = "" + (event.clientY - 20) + "px";
        this.__contextMenu.style.opacity = 0.8;

        //Delete any table in the context menu
        let table = this.__contextMenu.querySelector("table");
        if(table){
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

    close(){
        HTMLUtils.removeClass(this.__featureTable, "shown-block");
        HTMLUtils.addClass(this.__featureTable, "hidden-block");
        HTMLUtils.removeClass(this.__contextMenu, "shown-block");
        HTMLUtils.addClass(this.__contextMenu, "hidden-block");

        //TODO: Need to delete the child table, need to check if this is the same thing
        // if(this.__featureTable){
        //     this.__contextMenu.removeChild(this.__featureTable);
        // }
    }

}