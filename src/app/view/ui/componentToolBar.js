import {setButtonColor} from "../../utils/htmlUtils";
import {GREY_200, BLACK, WHITE} from '../colors';
const Colors = require("../colors");

const inactiveBackground = GREY_200;
const inactiveText = BLACK;
const activeText = WHITE;

export default class ComponentToolBar{
    constructor(viewmanagerdelegate){

        this.__viewManagerDelegate = viewmanagerdelegate;

        //Create all component references

        this.__selectToolButton = document.getElementById("select_button");
        this.__insertTextButton = document.getElementById("insert_text_button");

        this.__channelButton = document.getElementById("channel_button");
        this.__connectionButton = document.getElementById("connection_button");
        this.__roundedChannelButton = document.getElementById("roundedchannel_button");
        this.__transitionButton = document.getElementById("transition_button");
        this.__circleValveButton = document.getElementById("circleValve_button");
        this.__valveButton = document.getElementById("valve_button");
        this.__valve3dButton = document.getElementById("valve3d_button");
        this.__portButton = document.getElementById("port_button");
        this.__viaButton = document.getElementById("via_button");
        this.__chamberButton = document.getElementById("chamber_button");
        this.__diamondButton = document.getElementById("diamond_button");
        this.__bettermixerButton = document.getElementById("bettermixer_button");
        this.__curvedmixerButton = document.getElementById("curvedmixer_button");
        this.__mixerButton = document.getElementById("mixer_button");
        this.__gradientGeneratorButton = document.getElementById("gradientgenerator_button");
        this.__treeButton = document.getElementById("tree_button");
        this.__ytreeButton = document.getElementById("ytree_button");
        this.__muxButton = document.getElementById("mux_button");
        this.__transposerButton = document.getElementById("transposer_button");
        this.__rotarymixerButton = document.getElementById("rotarymixer_button");
        this.__dropletgenButton = document.getElementById("dropletgen_button");
        this.__celltraplButton = document.getElementById("celltrapl_button");

        this.__alignmentMarksButton = document.getElementById("alignmentmarks_button");


        this.buttons = {
            "SelectButton": this.__selectToolButton,
            "InsertTextButton": this.__insertTextButton,
            "Channel": this.__channelButton,
            "Connection": this.__connectionButton,
            "RoundedChannel": this.__roundedChannelButton,
            "Transition": this.__transitionButton,
            "Via": this.__viaButton,
            "Port": this.__portButton,
            "CircleValve": this.__circleValveButton,
            "Valve3D": this.__valve3dButton,
            "Valve":this.__valveButton,
            "Chamber": this.__chamberButton,
            "DiamondReactionChamber": this.__diamondButton,
            "BetterMixer": this.__bettermixerButton,
            "CurvedMixer": this.__curvedmixerButton,
            "Mixer": this.__mixerButton,
            "GradientGenerator": this.__gradientGeneratorButton,
            "Tree": this.__treeButton,
            "YTree": this.__ytreeButton,
            "Mux":this.__muxButton,
            "Transposer":this.__transposerButton,
            "RotaryMixer":this.__rotarymixerButton,
            "DropletGen": this.__dropletgenButton,
            "CellTrapL": this.__celltraplButton,
            "AlignmentMarks": this.__alignmentMarksButton
        };

        this.__setupEventHandlers();
    }

    __setupEventHandlers() {

        let ref = this;

        this.__channelButton.onclick = function() {
            Registry.viewManager.activateTool("Channel");

            ref.setActiveButton("Channel");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__connectionButton.onclick = function() {
            Registry.viewManager.activateTool("Connection", "Connection");

            ref.setActiveButton("Connection");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__selectToolButton.onclick = function(){
            Registry.viewManager.activateTool("MouseSelectTool");
            // if (this.activeButton) setButtonColor(this.buttons[this.activeButton], inactiveBackground, inactiveText);
            // ref.activeButton = "SelectButton";
            // setButtonColor(ref.buttons["SelectButton"], Colors.DEEP_PURPLE_500, activeText);
            ref.setActiveButton("SelectButton");
        };

        this.__roundedChannelButton.onclick = function() {
            Registry.viewManager.activateTool("RoundedChannel");

            ref.setActiveButton("RoundedChannel");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__transitionButton.onclick = function() {
            Registry.viewManager.activateTool("Transition");

            ref.setActiveButton("Transition");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__circleValveButton.onclick = function() {
            Registry.viewManager.activateTool("CircleValve");

            ref.setActiveButton("CircleValve");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__valve3dButton.onclick = function() {
            Registry.viewManager.activateTool("Valve3D");

            ref.setActiveButton("Valve3D");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__alignmentMarksButton.onclick = function() {
            Registry.viewManager.activateTool("AlignmentMarks");

            ref.setActiveButton("AlignmentMarks");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__valveButton.onclick = function() {
            Registry.viewManager.activateTool("Valve");

            ref.setActiveButton("Valve");
            ref.__viewManagerDelegate.switchTo2D();
        };


        this.__portButton.onclick = function() {
            Registry.viewManager.activateTool("Port");

            ref.setActiveButton("Port");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__viaButton.onclick = function() {
            Registry.viewManager.activateTool("Via");

            ref.setActiveButton("Via");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__chamberButton.onclick = function() {
            Registry.viewManager.activateTool("Chamber");

            ref.setActiveButton("Chamber");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__diamondButton.onclick = function() {
            Registry.viewManager.activateTool("DiamondReactionChamber");

            ref.setActiveButton("DiamondReactionChamber");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__bettermixerButton.onclick = function() {
            Registry.viewManager.activateTool("BetterMixer");

            ref.setActiveButton("BetterMixer");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__curvedmixerButton.onclick = function() {
            Registry.viewManager.activateTool("CurvedMixer");

            ref.setActiveButton("CurvedMixer");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__mixerButton.onclick = function() {
            Registry.viewManager.activateTool("Mixer");

            ref.setActiveButton("Mixer");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__gradientGeneratorButton.onclick = function(){
            Registry.viewManager.activateTool("GradientGenerator");

            ref.setActiveButton("GradientGenerator");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__treeButton.onclick = function() {
            Registry.viewManager.activateTool("Tree");

            ref.setActiveButton("Tree");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__ytreeButton.onclick = function() {
            Registry.viewManager.activateTool("YTree");

            ref.setActiveButton("YTree");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__muxButton.onclick = function() {
            Registry.viewManager.activateTool("Mux");

            ref.setActiveButton("Mux");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__transposerButton.onclick = function() {
            Registry.viewManager.activateTool("Transposer");

            ref.setActiveButton("Transposer");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__rotarymixerButton.onclick = function() {
            Registry.viewManager.activateTool("RotaryMixer");

            ref.setActiveButton("RotaryMixer");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__dropletgenButton.onclick = function() {
            Registry.viewManager.activateTool("DropletGen");

            ref.setActiveButton("DropletGen");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__celltraplButton.onclick = function() {
            Registry.viewManager.activateTool("CellTrapL");

            ref.setActiveButton("CellTrapL");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__insertTextButton.onclick = function(){
            if (this.activeButton) setButtonColor(this.buttons[this.activeButton], inactiveBackground, inactiveText);
            this.activeButton = "InsertTextButton";
            setButtonColor(this.buttons["InsertTextButton"], Colors.DEEP_PURPLE_500, activeText);
        };


    }

    setActiveButton(feature) {
        this.__viewManagerDelegate.killParamsWindow();
        //TODO: Make this less hacky so that it wont be such a big problem to modify the button selection criteria
        if (this.activeButton === "SelectButton" || this.activeButton === "InsertTextButton"){
            setButtonColor(this.buttons[this.activeButton], inactiveBackground, inactiveText);
        } else if (this.activeButton) {
            setButtonColor(this.buttons[this.activeButton], inactiveBackground, inactiveText);
        }
        this.activeButton = feature;
        if(feature === "SelectButton"){
            this.activeButton = "SelectButton";
            setButtonColor(this.buttons["SelectButton"], Colors.DEEP_PURPLE_500, activeText);
        }else{
            let color = Colors.getDefaultFeatureColor(this.activeButton, "Basic", Registry.currentLayer);
            setButtonColor(this.buttons[this.activeButton], color, activeText);

        }
    }
}