import Device from "./app/core/device";

import Port from "./app/library/port";
import Anode from "./app/library/anode"; // new from CK
import Cathode from "./app/library/cathode"; // new from CK
import Channel from "./app/library/channel";
import BetterMixer from "./app/library/betterMixer";
import RotaryMixer from "./app/library/rotaryMixer";
import AlignmentMarks from "./app/library/alignmentMarks";
import CellTrapL from "./app/library/celltrapL";
import Gelchannel from "./app/library/gelchannel"; // CK
import Chamber from "./app/library/chamber";
import Connection from "./app/library/connection";
import CurvedMixer from "./app/library/curvedMixer";
import DiamondReactionChamber from "./app/library/diamondReactionChamber";
import DropletGenerator from "./app/library/dropletGenerator";
import GradientGenerator from "./app/library/gradientGenerator";
import Mux from "./app/library/mux";
import Pump from "./app/library/pump";
import Pump3D from "./app/library/pump3D";
import RoundedChannel from "./app/library/roundedChannel";
import thermoCycler from "./app/library/thermoCycler";
import Transition from "./app/library/transition";
import Transposer from "./app/library/transposer";
import Valve from "./app/library/valve";
import Valve3D from "./app/library/valve3D";
import Tree from "./app/library/tree";
import YTree from "./app/library/ytree";
import LLChamber from "./app/library/llChamber";
import ThreeDMixer from "./app/library/threeDMixer";
import Via from "./app/library/via";

// new

import Filter from "./app/library/filter";
import CellTrapS from "./app/library/celltrapS";
import ThreeDMux from "./app/library/threeDMux";
import ChemostatRing from "./app/library/chemostatring";
import Incubation from "./app/library/incubation";
import Merger from "./app/library/merger";
import PicoInjection from "./app/library/picoinjection";
import Sorter from "./app/library/sorter";
import CapacitanceSensor from "./app/library/capacitancesensor";
import Splitter from "./app/library/splitter";
import Node from "./app/library/node";
import DropletGeneratorT from "./app/library/dropletGeneratorT";
import DropletGeneratorFlowFocus from "./app/library/dropletGeneratorFlowFocus";
import LogicArray from "./app/library/logicArray";
import { getComponentPorts, getDefinition, getRender2D, getRender3D, getTool } from "./app/featureSets";

export default class FeatureSet {
    __definitions: any;
    __library: any;
    __setString: any;
    __tools: any;
    __render2D: any;
    __render3D: any;
    name: any;
    setString: string | undefined;
    constructor(definitions: any, tools: any, render2D: any, render3D: any, setString: any) {
        this.__definitions = definitions;
        this.__setString = setString;
        this.__tools = tools;
        this.__render2D = render2D;
        this.__render3D = render3D;
        // TODO: Replace this cumbersome mechanism for generating different feature variants, etc.
        this.__library = {
            Port: { object: new Port(), key: null },
            Anode: { object: new Anode(), key: null }, // ck addition
            Cathode: { object: new Cathode(), key: null }, // ck addition
            Channel: { object: new Channel(), key: null },
            BetterMixer: { object: new BetterMixer(), key: "FLOW" },
            RotaryMixer: { object: new RotaryMixer(), key: "FLOW" },
            RotaryMixer_control: { object: new RotaryMixer(), key: "CONTROL" },
            AlignmentMarks: { object: new AlignmentMarks(), key: "FLOW" },
            AlignmentMarks_control: {
                object: new AlignmentMarks(),
                key: "CONTROL"
            },
            CellTrapL: { object: new CellTrapL(), key: "FLOW" },
            CellTrapL_cell: { object: new CellTrapL(), key: "CELL" },
            Gelchannel: { object: new Gelchannel(), key: "FLOW" }, // CK
            Gelchannel_cell: { object: new Gelchannel(), key: "CELL" }, // CK
            Chamber: { object: new Chamber(), key: null },
            CurvedMixer: { object: new CurvedMixer(), key: null },
            DiamondReactionChamber: {
                object: new DiamondReactionChamber(),
                key: null
            },

            Connection: { object: new Connection(), key: null },
            DropletGen: { object: new DropletGenerator(), key: null },
            GradientGenerator: { object: new GradientGenerator(), key: null },
            Mux: { object: new Mux(), key: "FLOW" },
            Mux_control: { object: new Mux(), key: "CONTROL" },
            Pump: { object: new Pump(), key: "FLOW" },
            Pump_control: { object: new Pump(), key: "CONTROL" },
            Pump3D: { object: new Pump3D(), key: "FLOW" },
            Pump3D_control: { object: new Pump3D(), key: "CONTROL" },
            RoundedChannel: { object: new RoundedChannel(), key: null },
            thermoCycler: { object: new thermoCycler(), key: "FLOW" },
            Transition: { object: new Transition(), key: null },
            Transposer: { object: new Transposer(), key: "FLOW" },
            Transposer_control: { object: new Transposer(), key: "CONTROL" },
            Tree: { object: new Tree(), key: null },
            YTree: { object: new YTree(), key: null },
            Valve: { object: new Valve(), key: null },
            Valve3D: { object: new Valve3D(), key: "FLOW" },
            Valve3D_control: { object: new Valve3D(), key: "CONTROL" },
            LLChamber: { object: new LLChamber(), key: "FLOW" },
            LLChamber_control: { object: new LLChamber(), key: "CONTROL" },
            "3DMixer": { object: new ThreeDMixer(), key: "FLOW" },
            "3DMixer_control": { object: new ThreeDMixer(), key: "CONTROL" },
            Via: { object: new Via(), key: "FLOW" },

            // new
            Filter: { object: new Filter(), key: "Flow" },
            CellTrapS: { object: new CellTrapS(), key: "FLOW" },
            CellTrapS_cell: { object: new CellTrapS(), key: "CELL" },
            "3DMux": { object: new ThreeDMux(), key: "FLOW" },
            "3DMux_control": { object: new ThreeDMux(), key: "CONTROL" },
            ChemostatRing: { object: new ChemostatRing(), key: "FLOW" },
            ChemostatRing_control: { object: new ChemostatRing(), key: "CONTROL" },
            Incubation: { object: new Incubation(), key: "FLOW" },
            Merger: { object: new Merger(), key: "FLOW" },
            PicoInjection: { object: new PicoInjection(), key: "FLOW" },
            Sorter: { object: new Sorter(), key: "FLOW" },
            Splitter: { object: new Splitter(), key: "FLOW" },
            CapacitanceSensor: { object: new CapacitanceSensor(), key: "FLOW" },
            Node: { object: new Node(), key: "FLOW" },
            DropletGenT: { object: new DropletGeneratorT(), key: null },
            DropletGenFlow: { object: new DropletGeneratorFlowFocus(), key: null },
            LogicArray: { object: new LogicArray(), key: "FLOW" },
            LogicArray_control: { object: new LogicArray(), key: "CONTROL" },
            LogicArray_cell: { object: new LogicArray(), key: "CELL" }
        };

        // this.__checkDefinitions();
        console.warn("Skipping definition check over here ");
    }


    containsDefinition(featureTypeString: any) {
        if (this.__definitions.hasOwnProperty(featureTypeString)) return true;
        else return false;
    }

    /**
     * Returns the 3DuF type for MINT syntax (need to get rid of this in the future)
     * @param minttype
     * @return {string|null}
     */
    getTypeForMINT(minttype: string) {
        const checkmint = minttype;
        for (const key in this.__library) {
            if (checkmint == this.__library[key].object.mint) {
                return key;
            }
        }
        return null;
    }

    /**
     * Returns the default params and values for the entire library
     */
    getDefaults() {
        const output = {};
        for (const key in this.__library) {
            output[key] = this.__library[key].object.defaults;
        }
        return output;
    }

    getFeatureType(typeString: string) {
        const setString = this.name;
        const defaultName = "New " + setString + "." + typeString;
        return function (values: any, name = defaultName) {
            return Device.makeFeature(typeString, setString, values, name);
        };
    }

    getSetString() {
        return this.setString;
    }

    /**
     * Returns the definition of the given typestring
     * @param typeString
     * @return {null|{mint: *, defaults: *, unique: *, maximum: *, units: *, heritable: *, minimum: *}}
     */
    getDefinition(typeString: string | null) {
        // console.log("Called", typeString);
        // TODO:Clean up this hacky code and shift everything to use MINT convention
        if (!this.__library.hasOwnProperty(typeString)) {
            typeString = this.getTypeForMINT(typeString);
        }

        if (!this.__library.hasOwnProperty(typeString)) {
            console.error("Could not find the type in featureset definition !: " + typeString);
            return null;
        }

        const definition = this.__library[typeString].object;
        const ret = {
            unique: definition.unique,
            heritable: definition.heritable,
            units: definition.units,
            defaults: definition.defaults,
            minimum: definition.minimum,
            maximum: definition.maximum,
            mint: definition.mint
        };
        return ret;
    }

    getRender3D(typeString: string | number) {
        return this.__render3D[typeString];
    }

    /**
     * Returns the library/technology description instead of the function pointer as it was doing before
     * @param typeString
     * @return {*}
     */
    getRender2D(typeString: string | number) {
        return this.__library[typeString];
    }

    /**
     * Returns the Tool that is being used by the definition
     * @param typeString
     * @return {Document.tool|null}
     */
    getTool(typeString: string | number) {
        return this.__definitions[typeString].tool;
    }

    /**
     * Creates a Feature (Outdated, I think)
     * @param typeString
     * @param setString
     * @param values
     * @param name
     * @return {*}
     */
    makeFeature(typeString: any, setString: any, values: any, name: any) {
        throw new Error("MAke featre in feature set is being called");
        console.log(setString);
        const set = getSet(setString);
        const featureType = this.getFeatureType(typeString);
        return featureType(values, name);
    }

    /**
     * Returns the component ports for a given component
     * @param params
     * @param typestring
     * @return {void|Array}
     */
    getComponentPorts(params: any, typestring: string | number) {
        const definition = this.__library[typestring].object;
        return definition.getPorts(params);
    }

    /**
     * Checks if the component definition in the library has the Inverse Render generation support
     * @param typestring
     * @return {*|boolean}
     */
    hasInverseRenderLayer(typestring: string | number) {
        const definition = this.__library[typestring].object;
        // Go through the renderkeys and check if inverse is available
        const renderkeys = definition.renderKeys;
        return renderkeys.includes("INVERSE");
    }

    __checkDefinitions() {
        for (const key in this.__definitions) {
            if (!this.__tools.hasOwnProperty(key) || !this.__render2D.hasOwnProperty(key) || !this.__render3D.hasOwnProperty(key)) {
                throw new Error("Feature set does not contain a renderer or tool definition for: " + key);
            }
        }
    }
}

class componentAPI{
    getAllComponents(): string[] {
        var components = new Array();
        var setString = getSetString();
        var definition = getDefinition();
        var render2D = getRender2D();
        var render3D = getRender3D();
        var tool = getTool();
        var componentports = getComponentPorts();
        components.push(setString,definition,render2D,render3D,tool,componentports);
        return components;
    }

     getComponentwithMint(string key):   { 
        //  Unsure on how to pull from the getTypeForMINT function
        // Also not sure how to make this method looks to return a library object

    }
}