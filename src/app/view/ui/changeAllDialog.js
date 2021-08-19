import Registry from "@/app/core/registry";
export default class ChangeAllDialog {
    constructor() {
        this.__componentsToChangeMap = new Map();
        this.__dialog = document.getElementById("change_all_dialog");
        this.__similarComponents = [];
        this.__componentTable = document.getElementById("similar_components_table");
        this.__changeAllButton = document.getElementById("change_all_button");
        this.__paramsToChange = null;
        // Assign all event handlers

        const ref = this;

        this.__dialog.querySelector(".close").addEventListener("click", function () {
            ref.__dialog.close();
        });

        this.__changeAllButton.addEventListener("click", function (event) {
            // TODO: Change values of all the features associated with the components
            ref.__modifyComponentParams();
            ref.__dialog.close();
        });
    }

    /**
     * Method used to show the dialog
     */
    showDialog() {
        for (const i in this.__similarComponents) {
            this.__componentTable.deleteRow(-1);
        }

        const selectedcomponent = Registry.viewManager.view.selectedComponents[0];
        const selectedcomponenttype = selectedcomponent.type;
        const params = selectedcomponent.getParams();
        this.__paramsToChange = {};
        for (const key in params.heritable) {
            this.__paramsToChange[key] = params.getValue(key);
        }
        // //TODO: Find a better way to do this
        // if(this.__paramsToChange['position']){
        //     delete this.__paramsToChange['position'];
        // }
        const allcomponents = Registry.currentDevice.getComponents();

        const similarcomponents = [];

        // Find all the similar components
        for (const i in allcomponents) {
            const component = allcomponents[i];
            if (selectedcomponenttype === component.getType() && selectedcomponent.getID() !== component.getID()) {
                this.__componentsToChangeMap.set(component.getID(), true);
                similarcomponents.push(component);
            }
        }

        this.__similarComponents = similarcomponents;

        let tr;
        let cell;
        let componenttoadd;

        for (const i in similarcomponents) {
            componenttoadd = similarcomponents[i];
            tr = this.__componentTable.insertRow();
            cell = tr.insertCell(-1);
            cell.appendChild(this.__createOptionButton(componenttoadd.getID(), true));
            cell = tr.insertCell(-1);
            cell.innerHTML = componenttoadd.getName();
        }

        this.__dialog.showModal();
    }

    __createOptionButton(componentid, checked) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        // checkbox.name = "name";
        // checkbox.value = "value";
        checkbox.id = "select_" + componentid;
        checkbox.checked = checked;
        checkbox.value = componentid;
        // Track all the changes
        const ref = this;
        checkbox.addEventListener("change", function (event) {
            const id = event.target.value;
            ref.__componentsToChangeMap.set(id, event.target.checked);
        });

        return checkbox;
    }

    __modifyComponentParams() {
        for (const i in this.__similarComponents) {
            console.log(this.__similarComponents);
            const componenttochange = this.__similarComponents[i];
            if (this.__componentsToChangeMap.get(componenttochange.getID())) {
                // Call upateParameter for everything

                for (const key in this.__paramsToChange) {
                    componenttochange.updateParameter(key, this.__paramsToChange[key]);
                }
            }
        }
    }

    // __createOptionButton(componentid, checked) {
    //     let div = document.createElement("div");
    //     let label = document.createElement("label");
    //     label.className = "mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect";
    //     label.setAttribute("for", componentid);
    //     let input = document.createElement("input");
    //     input.setAttribute("type", "checkbox");
    //     input.setAttribute("id", "select_" + componentid);
    //     // if (checked) input.checked = true;
    //     input.className = "mdl-checkbox__input";
    //     label.appendChild(input);
    //     componentHandler.upgradeElement(label, "MaterialCheckbox");
    //     div.setAttribute("style", "margin-left: auto; margin-right: auto; display: block;width:12px;position:relative;");
    //     div.appendChild(label);
    //
    //
    //     //Track all the changes
    //     let ref = this;
    //     // input.addEventListener('update', function (event) {
    //     //     //
    //     //     console.log(event);
    //     // });
    //
    //     return div;
    // };
}
