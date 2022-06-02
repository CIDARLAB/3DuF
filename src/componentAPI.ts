import Text from "@/app/library/text";
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
import ToroidalMixer from "./app/library/toroidalMixer";
import DogboneInsert from "./app/library/dogboneInsert";

import Template from "./app/library/template";
import ComponentPort from "./app/core/componentPort";
import CustomComponent from "./app/core/customComponent";
import uuid from "node-uuid";

export type LibraryEntryDefinition = {
    unique: { [key: string]: string };
    heritable: { [key: string]: string };
    units: { [key: string]: string };
    defaults: { [key: string]: number };
    minimum: { [key: string]: number };
    maximum: { [key: string]: number };
    mint: string;
};

type LibraryEntry = {
    object: Template;
    key: string;
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
        Template: { object: new Template(), key: "FLOW" },
        Text: { object: new Text(), key: "FLOW" },
        Port: { object: new Port(), key: "FLOW" },
        Anode: { object: new Anode(), key: "INTEGRATION" }, // ck addition
        Cathode: { object: new Cathode(), key: "INTEGRATION" }, // ck addition
        Channel: { object: new Channel(), key: "FLOW" },
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
        Chamber: { object: new Chamber(), key: "FLOW" },
        CurvedMixer: { object: new CurvedMixer(), key: "FLOW" },
        ToroidalMixer: { object: new ToroidalMixer(), key: "FLOW"},
        DiamondReactionChamber: {
            object: new DiamondReactionChamber(),
            key: "FLOW"
        },

        Connection: { object: new Connection(), key: "FLOW" },
        DropletGen: { object: new DropletGenerator(), key: "FLOW" },
        GradientGenerator: { object: new GradientGenerator(), key: "FLOW" },
        Mux: { object: new Mux(), key: "FLOW" },
        Mux_control: { object: new Mux(), key: "CONTROL" },
        Pump: { object: new Pump(), key: "FLOW" },
        Pump_control: { object: new Pump(), key: "CONTROL" },
        Pump3D: { object: new Pump3D(), key: "FLOW" },
        Pump3D_control: { object: new Pump3D(), key: "CONTROL" },
        RoundedChannel: { object: new RoundedChannel(), key: "FLOW" },
        thermoCycler: { object: new thermoCycler(), key: "FLOW" },
        Transition: { object: new Transition(), key: "FLOW" },
        Transposer: { object: new Transposer(), key: "FLOW" },
        Transposer_control: { object: new Transposer(), key: "CONTROL" },
        Tree: { object: new Tree(), key: "FLOW" },
        YTree: { object: new YTree(), key: "FLOW" },
        Valve: { object: new Valve(), key: "CONTROL" },
        Valve3D: { object: new Valve3D(), key: "FLOW" },
        Valve3D_control: { object: new Valve3D(), key: "CONTROL" },
        LLChamber: { object: new LLChamber(), key: "FLOW" },
        LLChamber_control: { object: new LLChamber(), key: "CONTROL" },
        "3DMixer": { object: new ThreeDMixer(), key: "FLOW" },
        "3DMixer_control": { object: new ThreeDMixer(), key: "CONTROL" },
        Via: { object: new Via(), key: "FLOW" },

        // new
        DogboneInsert: { object: new DogboneInsert(), key: "FLOW" },
        Filter: { object: new Filter(), key: "FLOW" },
        CellTrapS: { object: new CellTrapS(), key: "FLOW" },
        CellTrapS_cell: { object: new CellTrapS(), key: "CELL" },
        "3DMux": { object: new ThreeDMux(), key: "FLOW" },
        "3DMux_control": { object: new ThreeDMux(), key: "CONTROL" },
        ChemostatRing: { object: new ChemostatRing(), key: "FLOW" },
        ChemostatRing_control: { object: new ChemostatRing(), key: "CONTROL" },
        Incubation: { object: new Incubation(), key: "FLOW" },
        Merger: { object: new Merger(), key: "FLOW" },
        Merger_integration: { object: new Merger(), key: "INTEGRATION" },
        PicoInjection: { object: new PicoInjection(), key: "FLOW" },
        PicoInjection_integration: { object: new PicoInjection(), key: "INTEGRATION" },
        Sorter: { object: new Sorter(), key: "FLOW" },
        Sorter_integration: { object: new Sorter(), key: "INTEGRATION" },
        Splitter: { object: new Splitter(), key: "FLOW" },
        CapacitanceSensor: { object: new CapacitanceSensor(), key: "FLOW" },
        CapacitanceSensor_integration: { object: new CapacitanceSensor(), key: "INTEGRATION" },
        Node: { object: new Node(), key: "FLOW" },
        DropletGenT: { object: new DropletGeneratorT(), key: "FLOW" },
        DropletGenFlow: { object: new DropletGeneratorFlowFocus(), key: "FLOW" },
        LogicArray: { object: new LogicArray(), key: "FLOW" },
        LogicArray_control: { object: new LogicArray(), key: "CONTROL" },
        LogicArray_cell: { object: new LogicArray(), key: "CELL" },
    };

    static connectionLibrary: { [key: string]: LibraryEntry } = {
        Connection: { object: new Connection(), key: "FLOW" }
    };

    static customTypes: Map<string, CustomComponent> = new Map();
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
        const ret: Array<Template> = [];
        for (const key in ComponentAPI.library) {
            const definition = ComponentAPI.library[key].object;
            ret.push(definition);
        }
        return ret;
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

    /**
     * Get the definition of a component given by the corresponding mint type
     *
     * @static
     * @param {string} minttype
     * @returns {(LibraryEntryDefinition | null)}
     * @memberof ComponentAPI
     */
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
        if (Object.prototype.hasOwnProperty.call(ComponentAPI.library, threeduftype)) {
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

    /**
     * Gets the 3duf type for mint type
     *
     * @static
     * @param {string} minttype
     * @returns {(string | null)}
     * @memberof ComponentAPI
     */
    static getTypeForMINT(minttype: string): string | null {
        for (const key in ComponentAPI.library) {
            if (minttype === ComponentAPI.library[key].object.mint) {
                return key;
            }
        }
        return null;
    }

    /**
     * Gets the mint type for 3duf type
     *
     * @static
     * @param {string} threeduftype
     * @returns {(string | null)}
     * @memberof ComponentAPI
     */
    static getMINTForType(threeduftype: string): string | null {
        for (const key in ComponentAPI.library) {
            if (threeduftype === key) {
                return ComponentAPI.library[key].object.mint;
            }
        }
        return null;
    }

    /**
     * Gets the library drawing definitions for the component with the given MINT tyep.
     *
     * @static
     * @param {string} minttype
     * @returns {(Array<string> | null)}
     * @memberof ComponentAPI
     */
    static getRenderTypeKeysForMINT(minttype: string): Array<string> | null {
        let ret = [];
        for (const key in ComponentAPI.library) {
            if (minttype === ComponentAPI.library[key].object.mint) {
                ret.push(key);
            }
        }
        if (ret.length > 0) {
            return ret;
        } else {
            throw new Error("No render type found for mint type: " + minttype);
        }
    }

    /**
     * Returns the component ports for a given component
     * @param params
     * @param minttypestring
     * @return {void|Array}
     */
    static getComponentPorts(params: Map<string, any>, minttypestring: string): Array<ComponentPort> {
        let threeduftypestring = ComponentAPI.getTypeForMINT(minttypestring);
        if (threeduftypestring === null) {
            console.error("Component Ports of: " + threeduftypestring + " not found in library. Using default Template");
            threeduftypestring = "Template";
        }
        const definition = ComponentAPI.library[threeduftypestring].object;
        const params_to_pass: { [index: string]: any } = {};
        params.forEach((value, key) => {
            params_to_pass[key] = value;
        });
        const ports = definition.getPorts(params_to_pass);
        return ports;
    }

    /**
     * Checks if the component definition in the library has the Inverse Render generation support
     * @param typestring
     * @return {*|boolean}
     */
    static hasInverseRenderLayer(typestring: string): boolean {
        const definition = ComponentAPI.library[typestring].object;
        // Go through the renderkeys and check if inverse is available
        const renderkeys = definition.renderKeys;
        return renderkeys.includes("INVERSE");
    }

    /**
     * ?
     * @param {String} typeString
     * @param {String} setString
     * @returns {Template.defaults}
     * @memberof Feature
     */
    static getDefaultsForType(threeduftypeString: string): { [key: string]: number } {
        if (Object.prototype.hasOwnProperty.call(ComponentAPI.library, threeduftypeString)) {
            return ComponentAPI.library[threeduftypeString].object.defaults;
        } else {
            throw new Error("Component Type definition: " + threeduftypeString + " not found in library");
        }
    }

    /**
     * Gets the heritable keys for a given component
     *
     * @static
     * @param {string} threeduftypeString
     * @returns {{ [key: string]: string }}
     * @memberof ComponentAPI
     */
    static getHeritableForType(threeduftypeString: string): { [key: string]: string } {
        if (Object.prototype.hasOwnProperty.call(ComponentAPI.library, threeduftypeString)) {
            return ComponentAPI.library[threeduftypeString].object.heritable;
        } else {
            throw new Error("Component Type definition: " + threeduftypeString + " not found in library");
        }
    }

    /**
     * Gets the unique keys for a given component
     *
     * @static
     * @param {string} threeduftypeString
     * @returns {{ [key: string]: string }}
     * @memberof ComponentAPI
     */
    static getUniqueForType(threeduftypeString: string): { [key: string]: string } {
        if (Object.prototype.hasOwnProperty.call(ComponentAPI.library, threeduftypeString)) {
            return ComponentAPI.library[threeduftypeString].object.unique;
        } else {
            throw new Error("Component Type definition: " + threeduftypeString + " not found in library");
        }
    }

    /**
     * Checks if the component definition belongs to a custom component
     *
     * @static
     * @param {string} threeduftypeString
     * @returns {boolean}
     * @memberof ComponentAPI
     */
    static isCustomType(threeduftypeString: string): boolean {
        if (threeduftypeString in ComponentAPI.customTypes.keys()) {
            return true;
        }
        return false;
    }

    /**
     * Generates a unique ID
     *
     * @static
     * @returns {string}
     * @memberof ComponentAPI
     */
    static generateID(): string {
        return uuid.v1();
    }

    /**
     * Returns the component renderer info for the given type
     *
     * @static
     * @param {string} threeduftypeString
     * @returns {Template}
     * @memberof ComponentAPI
     */
    static getRenderer(threeduftypeString: string): Template {
        //Check if threeduftypestring in library
        if (Object.prototype.hasOwnProperty.call(ComponentAPI.library, threeduftypeString)) {
            return ComponentAPI.library[threeduftypeString].object;
        } else {
            throw new Error("Component Type definition: " + threeduftypeString + " not found in library");
        }
    }

    /**
     * Returns the component renderer info for the given type
     *
     * @static
     * @param {string} minttype
     * @returns {Template}
     * @memberof ComponentAPI
     */
    static getRendererForMINT(minttype: string): Template {
        // Go through all the objects in the library and return the one that matches the minttype
        for (const key in ComponentAPI.library) {
            if (ComponentAPI.library[key].object.mint === minttype) {
                console.log("Renderer: ", ComponentAPI.library[key].object);
                return ComponentAPI.library[key].object;
            }
        }
        throw new Error("Component Type definition: " + minttype + " not found in library");
    }

    /**
     * Returns the component definition for the given type
     *
     * @static
     * @param {string} threeduftypeString
     * @returns {LibraryEntry}
     * @memberof ComponentAPI
     */
    static getRendererInfo(threeduftypeString: string): LibraryEntry {
        //Check if threeduftypestring in library
        if (Object.prototype.hasOwnProperty.call(ComponentAPI.library, threeduftypeString)) {
            return ComponentAPI.library[threeduftypeString];
        } else {
            throw new Error("Component Type definition: " + threeduftypeString + " not found in library");
        }
    }

    /**
     * Returns the component rendering keys for the given type
     *
     * @static
     * @param {string} threeduftypeString
     * @returns {Array<string>}
     * @memberof ComponentAPI
     */
    static getAllRenderKeys(threeduftypeString: string): Array<string> {
        return ComponentAPI.library[threeduftypeString].object.renderKeys;
    }

    /**
     * Returns the different types of connection types in the library
     *
     * @static
     * @returns {Array<string>}
     * @memberof ComponentAPI
     */
    static getConnectionTypes(): Array<string> {
        let ret = [];
        for (const key in ComponentAPI.connectionLibrary) {
            let entry = ComponentAPI.connectionLibrary[key];
            ret.push(entry.object.mint);
        }
        return ret;
    }
}
