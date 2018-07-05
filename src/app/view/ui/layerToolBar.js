import {setButtonColor} from "../../utils/htmlUtils";

const Registry = require('../../core/registry');
const Colors = require('../colors');

const inactiveButtonBackground = Colors.GREY_200;
const inactiveButtonText = Colors.BLACK;
const activeButtonText = Colors.WHITE;


export default class LayerToolBar {
    constructor(){

        this.__toolBar = document.getElementById("layer-toolbar");
        if(!this.__toolBar){
            console.error("Could not find the LayerToolBar on the HTML page");
        }

        this.__layerButtons = new Map(); //Simple Reference System

        this.__activeLayer = null;


        this.__levelCount = 0;

        this.__addNewLevelButton = document.getElementById("add-new-level");

        let ref = this;

        let registryref = Registry;

        this.__addNewLevelButton.addEventListener('click', function (event) {
            //Update the UI
            ref.__addNewLevel();

            //Create new layers in the data model
            registryref.viewManager.createNewLayerBlock();
        });

        this.__generateButtonHandlers();
        this.__generateLevelActionButtonHandlers();
        this.__updateLayerButtonReferences();
    }


    __generateButtonHandlers() {
        let flowButtons = document.querySelectorAll(".flow-button");
        let controlButtons = document.querySelectorAll(".control-button");

        let ref = this;

        for(let i=0 ; i < flowButtons.length; i++){
            let flowButton = flowButtons[i];
            flowButton.onclick = function(event) {
                Registry.currentLayer = Registry.currentDevice.layers[flowButton.dataset.layerindex];
                ref.setActiveLayer(flowButton.dataset.layerindex);
                Registry.viewManager.updateActiveLayer();
            };

        }

        for(let i=0 ; i < controlButtons.length; i++){
            let controlButton = controlButtons[i];
            controlButton.onclick = function (event) {
                Registry.currentLayer = Registry.currentDevice.layers[controlButton.dataset.layerindex];
                ref.setActiveLayer(controlButton.dataset.layerindex);
                Registry.viewManager.updateActiveLayer();
            }
        }

    }

    setActiveLayer(layerName) {
        //Decolor the active button
        if (this.__activeLayer) {
            setButtonColor(this.__layerButtons.get(this.__activeLayer), inactiveButtonBackground, inactiveButtonText);
        }



        let bgColor;// = Colors.getDefaultLayerColor(Registry.currentLayer);
        if(layerName%3 == 0){
            bgColor = Colors.INDIGO_500;
        }else if (layerName%3 == 1){
            bgColor = Colors.RED_500;
        }else {
            bgColor = Colors.GREEN_500;
        }


        setButtonColor(this.__layerButtons.get(layerName), bgColor, activeButtonText);

        this.__activeLayer = layerName;
    }

    /**
     * Adds the UI elements for the new block
     * @private
     */
    __addNewLevel() {
        //Update the total number of layers in the system
        this.__levelCount+=1;


        //Copy the the first button group
        let buttongroup = this.__toolBar.querySelector('.layer-block');
        let copy = buttongroup.cloneNode(true);


        //Change all the parameters for the UI elements

        //Update the level index for the layerblock
        copy.dataset.levelindex = String(this.__levelCount);

        //Change the Label
        let label = copy.querySelector(".level-index");
        label.innerHTML = "LEVEL " + (this.__levelCount + 1);

        //Change the button indices
        let flowbutton = copy.querySelector(".flow-button");
        flowbutton.dataset.layerindex = String(this.__levelCount * 3);
        setButtonColor(flowbutton, inactiveButtonBackground, inactiveButtonText);

        let controlbutton = copy.querySelector(".control-button");
        controlbutton.dataset.layerindex = String(this.__levelCount * 3 + 1);
        setButtonColor(controlbutton, inactiveButtonBackground, inactiveButtonText);

        //Add the new elements to the toolbar
        this.__toolBar.appendChild(copy);

        //Add reference to the deletebutton
        let deletebutton = copy.querySelector(".delete-level");
        deletebutton.dataset.levelindex = String(this.__levelCount);

        //Reset Event Handlers and update references
        this.__generateButtonHandlers();
        this.__updateLayerButtonReferences();
        this.__generateLevelActionButtonHandlers();

        console.log("level count", this.__levelCount);

    }

    /**
     *  Updates the button references held by the toolbar object, this is to allow me to easily modify
     *  the buttons based on what layer index we are using
     * @private
     */
    __updateLayerButtonReferences() {
        let flowButtons = document.querySelectorAll(".flow-button");
        let controlButtons = document.querySelectorAll(".control-button");

        for(let i=0 ; i < flowButtons.length; i++){
            let flowButton = flowButtons[i];
            this.__layerButtons.set(flowButton.dataset.layerindex, flowButton);
        }

        for(let i=0 ; i < controlButtons.length; i++){
            let controlButton = controlButtons[i];
            this.__layerButtons.set(controlButton.dataset.layerindex, controlButton);
        }

    }

    /**
     * Generates all the event handlers for the action buttons
     * @private
     */
    __generateLevelActionButtonHandlers() {
        let deleteButtons = document.querySelectorAll(".delete-level");

        console.log("buttons", deleteButtons);

        let ref = this;

        for(let i=0; i < deleteButtons.length; i++){
            let deletebutton = deleteButtons[i];
            deletebutton.addEventListener('click', function (event) {
                ref.deleteLevel(parseInt(deletebutton.dataset.levelindex));
            });
        }
    }

    /**
     * Deletes the level at the given index
     * @param levelindex Integer
     */
    deleteLevel(levelindex) {
        console.log("Level to delete", levelindex);

        //First tell the viewmanager to delete the levels
        Registry.viewManager.deleteLayerBlock(levelindex);
        //Next delete the ux buttons
        let buttongroups = this.__toolBar.querySelectorAll('.layer-block');

        for(let i = 0; i<buttongroups.length; i++){
            if(buttongroups[i].dataset.levelindex == levelindex){
                console.log(buttongroups[i].dataset);
                this.__toolBar.removeChild(buttongroups[i]);
            }
        }

        this.__levelCount=-1;

        console.log("level count", this.__levelCount);

    }
}