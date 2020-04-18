import Device from "../core/device";

import Port from "../library/port";
import Channel from "../library/channel";
import BetterMixer from "../library/betterMixer";
import RotaryMixer from "../library/rotaryMixer";
import AlignmentMarks from "../library/alignmentMarks";
import CellTrapL from "../library/celltrapL";
import Chamber from "../library/chamber";
import Connection from "../library/connection";
import CurvedMixer from "../library/curvedMixer";
import DiamondReactionChamber from "../library/diamondReactionChamber";
import DropletGenerator from "../library/dropletGenerator";
import GradientGenerator from "../library/gradientGenerator";
import Mux from "../library/mux";
import Pump from "../library/pump";
import Pump3D from "../library/pump3D";
import RoundedChannel from "../library/roundedChannel";
import ThermoCycler from "../library/thermoCycler"
import Transition from "../library/transition";
import Transposer from "../library/transposer";
import Valve from "../library/valve";
import Valve3D from "../library/valve3D";
import Tree from "../library/tree";
import YTree from "../library/ytree";
import LLChamber from "../library/llChamber";
import ThreeDMixer from "../library/threeDMixer";

export default class FeatureSet {
    constructor(definitions, tools, render2D, render3D, setString) {
        this.__definitions = definitions;
        this.__setString = setString;
        this.__tools = tools;
        this.__render2D = render2D;
        this.__render3D = render3D;
        //TODO: Replace this cumbersome mechanism for generating different feature variants, etc.
        this.__library = {
            Port: { object: new Port(), key: null },
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
            Chamber: { object: new Chamber(), key: null },
            Connection: { object: new Connection(), key: null },
            CurvedMixer: { object: new CurvedMixer(), key: null },
            DiamondReactionChamber: {
                object: new DiamondReactionChamber(),
                key: null
            },
            DropletGen: { object: new DropletGenerator(), key: null },
            GradientGenerator: { object: new GradientGenerator(), key: null },
            Mux: { object: new Mux(), key: "FLOW" },
            Mux_control: { object: new Mux(), key: "CONTROL" },
            Pump: { object: new Pump(), key: "FLOW" },
            Pump_control: { object: new Pump(), key: "CONTROL" },
            Pump3D: { object: new Pump3D(), key: "FLOW" },
            Pump3D_control: { object: new Pump3D(), key: "CONTROL" },
            RoundedChannel: { object: new RoundedChannel(), key: null },
            "ThermoCycler": { 
              object: new ThermoCycler(), 
              key: "FLOW"
            }
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
            "3DMixer_control": { object: new ThreeDMixer(), key: "CONTROL" }
        };

        // this.__checkDefinitions();
        console.warn("Skipping definition check over here ");
    }

    containsDefinition(featureTypeString) {
        if (this.__definitions.hasOwnProperty(featureTypeString)) return true;
        else return false;
    }

    /**
     * Returns the 3DuF type for MINT syntax (need to get rid of this in the future)
     * @param minttype
     * @return {string|null}
     */
    getTypeForMINT(minttype) {
        for (let key in this.__library) {
            if (minttype == this.__library[key].object.mint) {
                return key;
            }
        }
        return null;
    }

    /**
     * Returns the default params and values for the entire library
     */
    getDefaults() {
        let output = {};
        for (let key in this.__library) {
            output[key] = this.__library[key].object.defaults;
        }
        return output;
    }

    getFeatureType(typeString) {
        let setString = this.name;
        let defaultName = "New " + setString + "." + typeString;
        return function(values, name = defaultName) {
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
    getDefinition(typeString) {
        // console.log("Called", typeString);
        //TODO:Clean up this hacky code and shift everything to use MINT convention
        if (!this.__library.hasOwnProperty(typeString)) {
            typeString = this.getTypeForMINT(typeString);
        }

        if (!this.__library.hasOwnProperty(typeString)) {
            console.error("Could not find the type in featureset definition !: " + typeString);
            return null;
        }

        let definition = this.__library[typeString].object;
        let ret = {
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

    getRender3D(typeString) {
        return this.__render3D[typeString];
    }

    /**
     * Returns the library/technology description instead of the function pointer as it was doing before
     * @param typeString
     * @return {*}
     */
    getRender2D(typeString) {
        return this.__library[typeString];
    }

    /**
     * Returns the Tool that is being used by the definition
     * @param typeString
     * @return {Document.tool|null}
     */
    getTool(typeString) {
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
    makeFeature(typeString, setString, values, name) {
        throw new Error("MAke featre in feature set is being called");
        console.log(setString);
        let set = getSet(setString);
        let featureType = getFeatureType(typeString);
        return featureType(values, name);
    }

    /**
     * Returns the component ports for a given component
     * @param params
     * @param typestring
     * @return {void|Array}
     */
    getComponentPorts(params, typestring) {
        let definition = this.__library[typestring].object;
        return definition.getPorts(params);
    }

    /**
     * Checks if the component definition in the library has the Inverse Render generation support
     * @param typestring
     * @return {*|boolean}
     */
    hasInverseRenderLayer(typestring) {
        let definition = this.__library[typestring].object;
        // Go through the renderkeys and check if inverse is available
        let renderkeys = definition.renderKeys;
        return renderkeys.includes("INVERSE");
    }

    __checkDefinitions() {
        for (let key in this.__definitions) {
            if (!this.__tools.hasOwnProperty(key) || !this.__render2D.hasOwnProperty(key) || !this.__render3D.hasOwnProperty(key)) {
                throw new Error("Feature set does not contain a renderer or tool definition for: " + key);
            }
        }
    }
}
