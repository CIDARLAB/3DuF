import { setButtonColor } from "../../utils/htmlUtils";
import { GREY_200, BLACK, WHITE } from "../colors";
import InsertTextDialog from "./insertTextDialog";
import * as Colors from "../colors";
import * as ParameterMenu from "./parameterMenu";
import * as Registry from "../../core/registry";

const inactiveBackground = GREY_200;
const inactiveText = BLACK;
const activeText = WHITE;

export default class ComponentToolBar {
    constructor(viewmanagerdelegate) {
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
        this.__pumpButton = document.getElementById("pump_button");
        this.__pump3dButton = document.getElementById("pump3d_button");
        this.__portButton = document.getElementById("port_button");
        this.__anodeButton = document.getElementById("anode_button");//CK edit
        this.__cathodeButton = document.getElementById("cathode_button");//CK
        this.__viaButton = document.getElementById("via_button");
        this.__chamberButton = document.getElementById("chamber_button");
        this.__diamondButton = document.getElementById("diamond_button");
        this.__bettermixerButton = document.getElementById("bettermixer_button");
        this.__curvedmixerButton = document.getElementById("curvedmixer_button");
        this.__mixerButton = document.getElementById("mixer_button");
        this.__gradientGeneratorButton = document.getElementById("gradientgenerator_button");
        this.__thermoCyclerButton = document.getElementById("thermoCycler_button")
        this.__treeButton = document.getElementById("tree_button");
        this.__ytreeButton = document.getElementById("ytree_button");
        this.__muxButton = document.getElementById("mux_button");
        this.__transposerButton = document.getElementById("transposer_button");
        this.__rotarymixerButton = document.getElementById("rotarymixer_button");
        this.__dropletgenButton = document.getElementById("dropletgen_button");
        this.__celltraplButton = document.getElementById("celltrapl_button");
        this.__gelchannelButton = document.getElementById("gelchannel_button");//ck
        this.__alignmentMarksButton = document.getElementById("alignmentmarks_button");
        this.__llChamberButton = document.getElementById("llchamber_button");
        this.__threeDMixerButton = document.getElementById("3dmixer_button");

        //new 
        this.__filterButton = document.getElementById("filter_button");
        this.__celltrapsButton = document.getElementById("celltraps_button");
        this.__threeDMuxButton = document.getElementById("3dmux_button");
        // this.__chemostatRingButton = document.getElementById("chemostatring_button");
        this.__incubationButton = document.getElementById("incubation_button");
        this.__mergerButton = document.getElementById("merger_button");
        this.__picoinjectionButton = document.getElementById("picoinjection_button");
        this.__sorterButton = document.getElementById("sorter_button");
        this.__splitterButton = document.getElementById("splitter_button");
        this.__capacitancesensorButton = document.getElementById("capacitancesensor_button");
        this.__dropletgenTButton = document.getElementById("dropletgenT_button");
        this.__dropletgenFlowButton = document.getElementById("dropletgenFlow_button");
        this.__logicarrayButton = document.getElementById("logicarray_button");

        //Create all the parameter menu buttons

        this.__channelParams = document.getElementById("channel_params_button");
        this.__thermoCyclerParams = document.getElementById("thermoCycler_params_button");
        this.__connectionParams = document.getElementById("connection_params_button");
        this.__roundedChannelParams = document.getElementById("roundedchannel_params_button");
        this.__transitionParams = document.getElementById("transition_params_button");
        this.__circleValveParams = document.getElementById("circleValve_params_button");
        this.__valveParams = document.getElementById("valve_params_button");
        this.__valve3dParams = document.getElementById("valve3d_params_button");
        this.__pumpParams = document.getElementById("pump_params_button");
        this.__pump3dParams = document.getElementById("pump3d_params_button");
        this.__portParams = document.getElementById("port_params_button");
        this.__anodeParams = document.getElementById("anode_params_button");//ck
        this.__cathodeParams = document.getElementById("cathode_params_button");//ck
        this.__viaParams = document.getElementById("via_params_button");
        this.__chamberParams = document.getElementById("chamber_params_button");
        this.__diamondParams = document.getElementById("diamond_params_button");
        this.__bettermixerParams = document.getElementById("bettermixer_params_button");
        this.__curvedmixerParams = document.getElementById("curvedmixer_params_button");
        this.__mixerParams = document.getElementById("mixer_params_button");
        this.__gradientGeneratorParams = document.getElementById("gradientgenerator_params_button");
        this.__treeParams = document.getElementById("tree_params_button");
        this.__ytreeParams = document.getElementById("ytree_params_button");
        this.__muxParams = document.getElementById("mux_params_button");
        this.__transposerParams = document.getElementById("transposer_params_button");
        this.__rotarymixerParams = document.getElementById("rotarymixer_params_button");
        this.__dropletgenParams = document.getElementById("dropletgen_params_button");
        this.__celltraplParams = document.getElementById("celltrapl_params_button");
        this.__gelchannelParams = document.getElementById("gelchannel_params_button");//ck
        this.__alignmentMarksParams = document.getElementById("alignmentmarks_params_button");
        this.__llChamberParams = document.getElementById("llchamber_params_button");
        this.__threeDMixerParams = document.getElementById("3dmixer_params_button");

        this.__insertTextDialog = new InsertTextDialog();
        
        //new
        this.__filterParams = document.getElementById("filter_params_button");
        this.__celltrapsParams = document.getElementById("celltraps_params_button");
        this.__threeDMuxParams = document.getElementById("3dmux_params_button");
        // this.__chemostatRingParams = document.getElementById("chemostatring_params_button");
        this.__incubationParams = document.getElementById("incubation_params_button");
        this.__mergerParams = document.getElementById("merger_params_button");
        this.__picoinjectionParams = document.getElementById("picoinjection_params_button");
        this.__sorterParams = document.getElementById("sorter_params_button");
        this.__splitterParams = document.getElementById("splitter_params_button");
        this.__capacitancesensorParams = document.getElementById("capacitancesensor_params_button");
        this.__dropletgenTParams = document.getElementById("dropletgenT_params_button");
        this.__dropletgenFlowParams = document.getElementById("dropletgenFlow_params_button");
        this.__logicarrayParams = document.getElementById("logicarray_params_button");

        this.buttons = {
            SelectButton: this.__selectToolButton,
            InsertTextButton: this.__insertTextButton,
            Channel: this.__channelButton,
            Connection: this.__connectionButton,
            RoundedChannel: this.__roundedChannelButton,
            Transition: this.__transitionButton,
            Via: this.__viaButton,
            Port: this.__portButton,
            Anode: this.__anodeButton,//ck
            Cathode: this.__cathodeButton,//ck
            CircleValve: this.__circleValveButton,
            Valve3D: this.__valve3dButton,
            Valve: this.__valveButton,
            Pump3D: this.__pump3dButton,
            Pump: this.__pumpButton,
            Chamber: this.__chamberButton,
            DiamondReactionChamber: this.__diamondButton,
            BetterMixer: this.__bettermixerButton,
            CurvedMixer: this.__curvedmixerButton,
            Mixer: this.__mixerButton,
            GradientGenerator: this.__gradientGeneratorButton,
            Tree: this.__treeButton,
            YTree: this.__ytreeButton,
            Mux: this.__muxButton,
            thermoCycler: this.__thermoCyclerButton,
            Transposer: this.__transposerButton,
            RotaryMixer: this.__rotarymixerButton,
            DropletGen: this.__dropletgenButton,
            CellTrapL: this.__celltraplButton,
            Gelchannel: this.__gelchannelButton,//ck
            AlignmentMarks: this.__alignmentMarksButton,
            LLChamber: this.__llChamberButton,
            "3DMixer": this.__threeDMixerButton,

            //newly added part
            Filter: this.__filterButton,
            CellTrapS: this.__celltrapsButton,
            "3DMux": this.__threeDMuxButton,
            // ChemostatRing: this.__chemostatRingButton,
            Incubation: this.__incubationButton,
            Merger: this.__mergerButton,
            PicoInjection: this.__picoinjectionButton,
            Sorter: this.__sorterButton,
            Splitter: this.__splitterButton,
            CapacitanceSensor: this.__capacitancesensorButton,
            DropletGenT: this.__dropletgenTButton,
            DropletGenFlow: this.__dropletgenFlowButton,
            LogicArray: this.__logicarrayButton
        };
            

        this.__setupEventHandlers();

        this.__setupParamButtonEventHandlers();
        
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

        this.__selectToolButton.onclick = function() {
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
        // this.__circleValveButton.onclick = function() {
        //     Registry.viewManager.activateTool("CircleValve");
        //
        //     ref.setActiveButton("CircleValve");
        //     ref.__viewManagerDelegate.switchTo2D();
        // };
        this.__valve3dButton.onclick = function() {
            Registry.viewManager.activateTool("Valve3D");

            ref.setActiveButton("Valve3D");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__pumpButton.onclick = function() {
            Registry.viewManager.activateTool("Pump");

            ref.setActiveButton("Pump");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__pump3dButton.onclick = function() {
            Registry.viewManager.activateTool("Pump3D");

            ref.setActiveButton("Pump3D");
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
        
        this.__anodeButton.onclick = function() {//ck
            Registry.viewManager.activateTool("Anode");//ck

            ref.setActiveButton("Anode");//ck
            ref.__viewManagerDelegate.switchTo2D();//ck
        };//ck

        this.__cathodeButton.onclick = function() {//ck
            Registry.viewManager.activateTool("Cathode");//ck

            ref.setActiveButton("Cathode");//ck
            ref.__viewManagerDelegate.switchTo2D();//ck
        };//ck

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
        this.__threeDMixerButton.onclick = function() {
            Registry.viewManager.activateTool("3DMixer");

            ref.setActiveButton("3DMixer");
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

        this.__gradientGeneratorButton.onclick = function() {
            Registry.viewManager.activateTool("GradientGenerator");

            ref.setActiveButton("GradientGenerator");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__thermoCyclerButton.onclick = function() {
          Registry.viewManager.activateTool("thermoCycler");

          ref.setActiveButton("thermoCycler");
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
            this.__gelchannelButton.onclick = function() {//CK
            Registry.viewManager.activateTool("Gelchannel");//CK


            ref.setActiveButton("Gelchannel");//CK
            ref.__viewManagerDelegate.switchTo2D();//CK
        };//CK

        this.__insertTextButton.onclick = function() {
            if (ref.activeButton) setButtonColor(ref.buttons[ref.activeButton], inactiveBackground, inactiveText);
            ref.activeButton = "InsertTextButton";
            setButtonColor(ref.buttons["InsertTextButton"], Colors.DEEP_PURPLE_500, activeText);
        };

        this.__llChamberButton.onclick = function() {
            Registry.viewManager.activateTool("LLChamber");

            ref.setActiveButton("LLChamber");
            ref.__viewManagerDelegate.switchTo2D();
        };

        //new
        this.__dropletgenTButton.onclick = function() {
            Registry.viewManager.activateTool("DropletGenT");

            ref.setActiveButton("DropletGenT");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__dropletgenFlowButton.onclick = function() {
            Registry.viewManager.activateTool("DropletGenFlow");

            ref.setActiveButton("DropletGenFlow");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__filterButton.onclick = function() {
            Registry.viewManager.activateTool("Filter");

            ref.setActiveButton("Filter");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__celltrapsButton.onclick = function() {
            Registry.viewManager.activateTool("CellTrapS");

            ref.setActiveButton("CellTrapS");
            ref.__viewManagerDelegate.switchTo2D();
        };

        this.__threeDMuxButton.onclick = function() {
            Registry.viewManager.activateTool("3DMux");

            ref.setActiveButton("3DMux");
            ref.__viewManagerDelegate.switchTo2D();
        };

        // this.__chemostatRingButton.onclick = function() {
        //     Registry.viewManager.activateTool("ChemostatRing");

        //     ref.setActiveButton("ChemostatRing");
        //     ref.__viewManagerDelegate.switchTo2D();
        // };
        this.__incubationButton.onclick = function() {
            Registry.viewManager.activateTool("Incubation");

            ref.setActiveButton("Incubation");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__mergerButton.onclick = function() {
            Registry.viewManager.activateTool("Merger");

            ref.setActiveButton("Merger");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__picoinjectionButton.onclick = function() {
            Registry.viewManager.activateTool("PicoInjection");

            ref.setActiveButton("PicoInjection");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__sorterButton.onclick = function() {
            Registry.viewManager.activateTool("Sorter");

            ref.setActiveButton("Sorter");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__splitterButton.onclick = function() {
            Registry.viewManager.activateTool("Splitter");

            ref.setActiveButton("Splitter");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__capacitancesensorButton.onclick = function() {
            Registry.viewManager.activateTool("CapacitanceSensor");

            ref.setActiveButton("CapacitanceSensor");
            ref.__viewManagerDelegate.switchTo2D();
        };
        this.__logicarrayButton.onclick = function() {
            Registry.viewManager.activateTool("LogicArray");

            ref.setActiveButton("LogicArray");
            ref.__viewManagerDelegate.switchTo2D();
        };
    }

    setActiveButton(feature) {
        this.__viewManagerDelegate.killParamsWindow();
        //TODO: Make this less hacky so that it wont be such a big problem to modify the button selection criteria
        if (this.activeButton === "SelectButton" || this.activeButton === "InsertTextButton") {
            setButtonColor(this.buttons[this.activeButton], inactiveBackground, inactiveText);
        } else if (this.activeButton) {
            setButtonColor(this.buttons[this.activeButton], inactiveBackground, inactiveText);
        }
        this.activeButton = feature;
        if (feature === "SelectButton") {
            this.activeButton = "SelectButton";
            setButtonColor(this.buttons["SelectButton"], Colors.DEEP_PURPLE_500, activeText);
        } else {
            let color = Colors.getDefaultFeatureColor(this.activeButton, "Basic", Registry.currentLayer);
            setButtonColor(this.buttons[this.activeButton], color, activeText);
        }
    }

    __setupParamButtonEventHandlers() {
        this.__channelParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Channel", "Basic");
        this.__connectionParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Connection", "Basic");
        this.__roundedChannelParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("RoundedChannel", "Basic");
        // this.__circleValveParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("CircleValve", "Basic");
        this.__valve3dParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Valve3D", "Basic");
        this.__valveParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Valve", "Basic");
        this.__pump3dParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Pump3D", "Basic");
        this.__pumpParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Pump", "Basic");
        this.__portParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Port", "Basic");
        this.__anodeParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Anode", "Basic");//ck
        this.__cathodeParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Cathode", "Basic");//ck
        // this.__viaParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Via", "Basic");
        this.__chamberParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Chamber", "Basic");
        this.__diamondParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("DiamondReactionChamber", "Basic");
        this.__bettermixerParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("BetterMixer", "Basic");
        this.__curvedmixerParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("CurvedMixer", "Basic");
        this.__mixerParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Mixer", "Basic");
        this.__gradientGeneratorParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("GradientGenerator", "Basic");
        this.__treeParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Tree", "Basic");
        this.__ytreeParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("YTree", "Basic");
        this.__muxParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Mux", "Basic");
        this.__transposerParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Transposer", "Basic");
        this.__rotarymixerParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("RotaryMixer", "Basic");
        this.__dropletgenParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("DropletGen", "Basic");
        this.__transitionParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Transition", "Basic");
        this.__celltraplParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("CellTrapL", "Basic");
        this.__gelchannelParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Gelchannel", "Basic");//ck
        this.__alignmentMarksParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("AlignmentMarks", "Basic");
        this.__llChamberParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("LLChamber", "Basic");
        this.__threeDMixerParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("3DMixer", "Basic");

        //new
        this.__filterParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Filter", "Basic");
        this.__celltrapsParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("CellTrapS", "Basic");
        this.__threeDMuxParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("3DMux", "Basic");
        // this.__chemostatRingParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("ChemostatRing", "Basic");
        this.__incubationParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Incubation", "Basic");
        this.__mergerParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Merger", "Basic");
        this.__picoinjectionParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("PicoInjection", "Basic");
        this.__sorterParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Sorter", "Basic");
        this.__splitterParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("Splitter", "Basic");
        this.__capacitancesensorParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("CapacitanceSensor", "Basic");
        this.__dropletgenTParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("DropletGenT", "Basic");
        this.__dropletgenFlowParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("DropletGenFlow", "Basic");
        this.__logicarrayParams.onclick = ComponentToolBar.getParamsWindowCallbackFunction("LogicArray", "Basic");
    }

    static getParamsWindowCallbackFunction(typeString, setString, isTranslucent = false) {
        let makeTable = ParameterMenu.generateTableFunction("parameter_menu", typeString, setString, isTranslucent);
        return function(event) {
            Registry.viewManager.killParamsWindow();
            makeTable(event);
        };
    }
}
