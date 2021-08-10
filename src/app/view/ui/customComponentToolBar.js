import * as HTMLUtils from "../../utils/htmlUtils";
import ComponentToolBar from "./componentToolBar";
import Registry from "../../core/registry";

export default class CustomComponentToolBar {
    constructor(customComponentManagerDelegate) {
        this.__customComponentManagerDelegate = customComponentManagerDelegate;

        this.__library = this.__customComponentManagerDelegate.library;

        // Generate the ToolBar
        this.__toolBar = document.getElementById("customComponentToolBar");
        if (this.__toolBar === null) {
            throw new Error("Could not find DOM element for the custom component toolbar");
        }

        this.updateToolBar();
    }

    updateToolBar() {
        // Clear the toolbar
        this.__clearToolBar();
        // console.log("custom component library", this.__library);
        for (const [key, value] of this.__library.entries()) {
            // console.log("Iterating though custom component library", key, value);
            const button = this.__createNewToolButton(key, value);
            this.__toolBar.appendChild(button);
        }

        // Generate the Event Handler
        const toolbuttons = this.__toolBar.querySelectorAll(".generated-button");

        // console.log("toolbuttons",toolbuttons);

        for (let i = 0; i < toolbuttons.length; i++) {
            this.__addClickEventListener(toolbuttons[i]);
        }
    }

    __clearToolBar() {
        // console.log("Clear the custom component toolbar UI");
        const buttons = this.__toolBar.querySelectorAll(".generated-button");
        for (let i = 0; i < buttons.length; i++) {
            // console.log("Removing:", buttons[i]);
            this.__toolBar.removeChild(buttons[i]);
        }
    }

    __createNewToolButton(key, customcomponent) {
        // console.log("Creating button for:", key);
        // Copy the the first button group
        const button = document.querySelector("#template-custom-component-button");
        const copy = button.cloneNode(true);
        copy.dataset.type = customcomponent.type;

        // Make the delete button visible since the first layer ui keeps it hidden
        copy.style.visibility = "visible";
        copy.style.display = "block";

        HTMLUtils.addClass(copy, "generated-button");

        const mainbutton = copy.querySelector(".custom-component-button");

        mainbutton.innerHTML = customcomponent.entity;
        // mainbutton.dataset.type = customcomponent.type;

        const paramsbutton = copy.querySelector(".params-button");
        paramsbutton.dataset.type = customcomponent.type;

        return copy;
    }

    __addClickEventListener(toolbutton) {
        const identifier = toolbutton.dataset.type;
        const mainbutton = toolbutton.querySelector(".custom-component-button");

        const ref = this;
        const registryref = Registry;
        mainbutton.addEventListener("click", function(e) {
            // console.log(e);
            // let identifier = e.target.dataset.type;
            // console.log("Main Button was clicked:", identifier);
            registryref.viewManager.activateTool(identifier);
        });

        const paramsbutton = toolbutton.querySelector(".params-button");

        paramsbutton.onclick = ComponentToolBar.getParamsWindowCallbackFunction(identifier, "Custom");
    }
}
