import { setButtonColor } from "../../utils/htmlUtils";

import Registry from "../../core/registry";
import * as Colors from "../colors";
const inactiveButtonBackground = Colors.GREY_200;
const inactiveButtonText = Colors.BLACK;
const activeButtonText = Colors.WHITE;

export default class LayerToolBar {
    constructor() {
        this.__toolBar = document.getElementById("layer-toolbar");
        if (!this.__toolBar) {
            console.error("Could not find the LayerToolBar on the HTML page");
        }

        this.__layerButtons = new Map(); // Simple Reference System

        this.__activeLayer = null;

        this.__levelCount = 0;

        this.__addNewLevelButton = document.getElementById("add-new-level");

        const ref = this;

        const registryref = Registry;

        this.__addNewLevelButton.addEventListener("click", function(event) {
            // Create new layers in the data model
            registryref.viewManager.createNewLayerBlock();

            // Update the UI
            ref.__levelCount += 1;

            ref.__generateUI();
        });

        this.__generateUI();
    }

    __generateButtonHandlers() {
        const flowButtons = document.querySelectorAll(".flow-button");
        const controlButtons = document.querySelectorAll(".control-button");

        const ref = this;

        for (let i = 0; i < flowButtons.length; i++) {
            const flowButton = flowButtons[i];
            flowButton.onclick = function(event) {
                Registry.currentLayer = Registry.currentDevice.layers[flowButton.dataset.layerindex];
                ref.setActiveLayer(flowButton.dataset.layerindex);
                Registry.viewManager.updateActiveLayer();
            };
        }

        for (let i = 0; i < controlButtons.length; i++) {
            const controlButton = controlButtons[i];
            controlButton.onclick = function(event) {
                Registry.currentLayer = Registry.currentDevice.layers[controlButton.dataset.layerindex];
                ref.setActiveLayer(controlButton.dataset.layerindex);
                Registry.viewManager.updateActiveLayer();
            };
        }
    }

    setActiveLayer(layerName) {
        // Decolor the active button
        if (this.__activeLayer) {
            setButtonColor(this.__layerButtons.get(this.__activeLayer), inactiveButtonBackground, inactiveButtonText);
        }

        let bgColor; // = Colors.getDefaultLayerColor(Registry.currentLayer);
        if (layerName % 3 === 0) {
            bgColor = Colors.INDIGO_500;
        } else if (layerName % 3 === 1) {
            bgColor = Colors.RED_500;
        } else {
            bgColor = Colors.GREEN_500;
        }

        setButtonColor(this.__layerButtons.get(layerName), bgColor, activeButtonText);

        this.__activeLayer = layerName;
    }

    /**
     * Adds the UI elements for the new block
     * @private
     */
    __addNewLevel(index) {
        // Copy the the first button group
        const buttongroup = document.querySelector("#template-layer-block");
        const copy = buttongroup.cloneNode(true);

        // Make the delete button visible since the first layer ui keeps it hidden
        copy.querySelector(".delete-level").style.visibility = "visible";

        // Change all the parameters for the UI elements

        // Update the level index for the layerblock
        copy.dataset.levelindex = String(index);

        // Change the Label
        const label = copy.querySelector(".level-index");
        label.innerHTML = "LEVEL " + (index + 1);

        // Change the button indices
        const flowbutton = copy.querySelector(".flow-button");
        flowbutton.dataset.layerindex = String(index * 3);
        setButtonColor(flowbutton, inactiveButtonBackground, inactiveButtonText);

        const controlbutton = copy.querySelector(".control-button");
        controlbutton.dataset.layerindex = String(index * 3 + 1);
        setButtonColor(controlbutton, inactiveButtonBackground, inactiveButtonText);

        // Add reference to the deletebutton
        const deletebutton = copy.querySelector(".delete-level");
        deletebutton.dataset.levelindex = String(index);

        return copy;
    }

    /**
     *  Updates the button references held by the toolbar object, this is to allow me to easily modify
     *  the buttons based on what layer index we are using
     * @private
     */
    __updateLayerButtonReferences() {
        const flowButtons = document.querySelectorAll(".flow-button");
        const controlButtons = document.querySelectorAll(".control-button");

        for (let i = 0; i < flowButtons.length; i++) {
            const flowButton = flowButtons[i];
            this.__layerButtons.set(flowButton.dataset.layerindex, flowButton);
        }

        for (let i = 0; i < controlButtons.length; i++) {
            const controlButton = controlButtons[i];
            this.__layerButtons.set(controlButton.dataset.layerindex, controlButton);
        }
    }

    /**
     * Generates all the event handlers for the action buttons
     * @private
     */
    __generateLevelActionButtonHandlers() {
        const deleteButtons = document.querySelectorAll(".delete-level");

        const ref = this;

        for (let i = 0; i < deleteButtons.length; i++) {
            const deletebutton = deleteButtons[i];
            deletebutton.addEventListener("click", function(event) {
                ref.deleteLevel(parseInt(deletebutton.dataset.levelindex));
            });
        }
    }

    /**
     * Deletes the level at the given index
     * @param levelindex Integer
     */
    deleteLevel(levelindex) {
        // First tell the viewmanager to delete the levels
        Registry.viewManager.deleteLayerBlock(levelindex);
        // Next delete the ux buttons
        const buttongroups = this.__toolBar.querySelectorAll(".layer-block");

        for (let i = 0; i < buttongroups.length; i++) {
            if (buttongroups[i].dataset.levelindex === levelindex) {
                this.__toolBar.removeChild(buttongroups[i]);
            }
        }

        this.__levelCount -= 1;

        this.__generateUI();

        Registry.currentLayer = Registry.currentDevice.layers[0];
        this.setActiveLayer("0");
        Registry.viewManager.updateActiveLayer();
    }

    __generateUI() {
        // Clear out all the UI elements
        const buttongroups = this.__toolBar.querySelectorAll(".layer-block");

        // Delete all things except the first one
        for (let i = buttongroups.length - 1; i > 0; i--) {
            const node = buttongroups[i];
            this.__toolBar.removeChild(node);
        }

        // Create the UI elements for everything
        for (let i = 1; i <= this.__levelCount; i++) {
            const copy = this.__addNewLevel(i);
            this.__toolBar.appendChild(copy);
        }
        this.__updateLayerButtonReferences();
        this.__generateButtonHandlers();
        this.__generateLevelActionButtonHandlers();
    }
}
