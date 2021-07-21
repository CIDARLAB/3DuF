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
import Template from "./app/library/template";
import Params from "./app/core/params";

export type LibraryEntryDefinition = {
    unique: { [key: string]: string };
    heritable: { [key: string]: number };
    units: { [key: string]: number };
    defaults: { [key: string]: number };
    minimum: { [key: string]: number };
    maximum: { [key: string]: number };
    mint: { [key: string]: number };
};

type LibraryEntry = {
    object: Template;
    key: string | null;
};

/**
 * Component API Class that contains all the components and their definitions,
 * Replaces the FeatureSet API in the future and simplifies all the extension
 * of the library.
 *
 * @class ComponentAPI
 */
export class ComponentAPI {
    static library: { [key: string]: LibraryEntry } = {
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

    __setString: any;
    __tools: any;
    __render2D: any;
    __render3D: any;
    name: any;
    setString: string | undefined;

    /**
     * Gets all the components definitions (template type objects) in the library.
     *
     * @static
     * @returns {Array<Template>}
     * @memberof ComponentAPI
     */
    static getAllComponents(): Array<Template> {
        let components: Array<Template> = [];
        for (const key in ComponentAPI.library) {
            const definition = ComponentAPI.library[key].object;
            const ret: Array<Template> = [];
            for (const key in ComponentAPI.library) {
                const definition = ComponentAPI.library[key].object;
                ret.push(definition);
            }
        }
        return components;
    }

    /**
     * Returns Template object given by the mint type
     *
     * @static
     * @param {string} minttype
     * @returns {(Template | null)}
     * @memberof ComponentAPI
     */
    static getComponentWithMINT(minttype: string): Template | null {
        const checkmint = minttype;
        for (const key in this.library) {
            if (checkmint == this.library[key].object.mint) {
                return ComponentAPI.library[key].object;
            }
        }
        return null;
    }

    static getDefinitionForMINT(minttype: string): LibraryEntryDefinition | null {
        const checkmint = minttype;
        let ret: LibraryEntryDefinition | null = null;
        for (const key in this.library) {
            if (checkmint == this.library[key].object.mint) {
                ret = {
                    unique: this.library[key].object.unique,
                    heritable: this.library[key].object.heritable,
                    units: this.library[key].object.units,
                    defaults: this.library[key].object.defaults,
                    minimum: this.library[key].object.minimum,
                    maximum: this.library[key].object.maximum,
                    mint: this.library[key].object.mint
                };
            }
        }
        return ret;
    }

    /**
     * Gets the library definition for the component with the given name.
     * Note- Takes the old 3DuF entity type name and not MINT type name.
     *
     * @static
     * @param {string} threeduftype
     * @returns {(LibraryEntryDefinition | null)}
     * @memberof ComponentAPI
     */
    static getDefinition(threeduftype: string): LibraryEntryDefinition | null {
        // If threeduftype is a key present in library, return the definition
        // TODO: Change this to use minttype in the future
        if (ComponentAPI.library.hasOwnProperty(threeduftype)) {
            const template = ComponentAPI.library[threeduftype].object;
            const definition = {
                unique: template.unique,
                heritable: template.heritable,
                units: template.units,
                defaults: template.defaults,
                minimum: template.minimum,
                maximum: template.maximum,
                mint: template.mint
            };
            return definition;
        }
        return null;
    }

    static getTypeForMINT(minttype: string): string | null {
        for (const key in ComponentAPI.library) {
            if (minttype === ComponentAPI.library[key].object.mint) {
                return key;
            }
        }
        return null;
    }

    static getMINTForType(threeduftype: string): string | null {
        for (const key in ComponentAPI.library) {
            if (threeduftype === key) {
                return ComponentAPI.library[key].object.mint;
            }
        }
        return null;
    }

    /**
     * Returns the component ports for a given component
     * @param params
     * @param minttypestring
     * @return {void|Array}
     */
    static getComponentPorts(params: any, minttypestring: string) {
        const threeduftypesting = ComponentAPI.getTypeForMINT(minttypestring);
        if (threeduftypesting == null) {
            throw new Error("Component Ports of: " + threeduftypesting + " not found in library");
        }
        const definition = ComponentAPI.library[threeduftypesting].object;
        return definition.getPorts(params);
    }

    /**
     * Checks if the component definition in the library has the Inverse Render generation support
     * @param typestring
     * @return {*|boolean}
     */
    static hasInverseRenderLayer(typestring: string) {
        const definition = ComponentAPI.library[typestring].object;
        // Go through the renderkeys and check if inverse is available
        const renderkeys = definition.renderKeys;
        return renderkeys.includes("INVERSE");
    }
}
