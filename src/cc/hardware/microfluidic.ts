import { Device } from "@/app";
import Component from "@/app/core/component";

export default class Microfluidic {
    private _device: Device;
    private _name: string = "";
    private _valves: Array<Component> = [];
    private _ports: Array<Component> = [];

    /**
     * Default constructor for the microfluidic. Accepts the microfluidic json.
     * @param json
     */
    constructor(device: Device) {
        console.log("new microfluidic instance");
        this._device = device;
        this.name = device.name;
        this.__createValves();
    }

    /**
     * Returns the json of the device
     * @returns {*}
     * @constructor
     */
    get device() {
        return this._device;
    }

    /**
     * Sets the name
     * @param value
     */
    set name(value) {
        this._name = value;
    }

    /**
     * Returns the name
     * @returns {*}
     */
    get name() {
        return this._name;
    }

    /**
     * Returns the number valves on the device
     * @returns {number}
     */
    getValveCount() {
        return this._valves;
    }

    /**
     * This method creates valves from JSON
     * @private
     */
    __createValves() {
        //First check for the version !!!!

        let componentcollection = this._device.components;
        let connectioncollection = this.device.connections;
        let valves: Array<Component> = [];
        let ports: Array<Component> = [];
        //Step 1: Identify the valves
        for (let i in componentcollection) {
            if (componentcollection[i].mint == "VALVE" || componentcollection[i].mint == "VALVE3D") {
                valves.push();
            }
        }
        //Step 2: Traverse the connections and components to see what PORT type components are connected to these components

        //Check sources
        //Check sinks

        console.log("Warning ! We still need to implement full netlist traversal to identify valves and ports for the microfluidic");
        this._valves = valves;
        this._ports = ports;
    }

    /**
     * Returns some kind of an object
     * @returns [{},{},{}]
     */
    getValves() {
        return [{}, {}, {}];
    }
}
