import { Device } from "@/app";
import { io, Socket } from "socket.io-client";
import AnalogValve from "../hardware/analogValve";
import DigitalValve from "../hardware/digitalValve";
import DispenserPump from "../hardware/dispenserpump";
import Microfluidic from "../hardware/microfluidic";

export default class Setup {
    private __chip: Microfluidic;
    private __pumps: Array<DispenserPump>;
    private __peripherals: Array<any>;
    private __hardwareMap: Map<string, any>;
    private socket: Socket;

    /**
     * The constructor takes a json, then dynamically creates the microfluidic object from that
     * @param json
     */
    constructor(device: Device) {
        //Initialize everything !!!!!
        let chip = new Microfluidic(device);
        this.__chip = chip;
        this.__pumps = [];
        this.__peripherals = [];
        this.__hardwareMap = new Map();

        // Create a socket server connection
        console.log("Connecting to server...");
        this.socket = io("http://localhost:3000");

        this.socket.on("connect", () => {
            if (this.socket === null) {
                console.log("Socket is null");
            } else {
                console.log("Connected to:", this.socket.id); // x8WIv7-mJelg7on_ALbx
            }
        });
        this.socket.on("disconnect", () => {
            if (this.socket === null) {
                console.log("Socket is null");
            } else {
                console.log("Disconnected from:", this.socket.id);
            }
        });
    }

    /**
     * Returns the microfluidic used in the design
     * @returns {*}
     * @constructor
     */
    get chip() {
        return this.__chip;
    }

    /**
     * Attaches the pump to a given valve
     * @param valveid id
     * @param avalve object
     */
    attachAnalogValve(valveid: string, avalve: AnalogValve) {
        this.__pumps.push(avalve.dispenserPump);
        this.__hardwareMap.set(valveid, avalve);
    }

    attachDigitalValve(valveid: string, dvalve: DigitalValve) {
        this.__hardwareMap.set(valveid, dvalve);
    }

    /**
     * Toggles the valve on or off
     *
     * @param {string} valveid
     * @memberof Setup
     */
    toggleValve(valveid: string) {
        let pump = this.__hardwareMap.get(valveid);
        let openvalue = pump.getOpen;
        pump.setState();
    }

    /**
     * Attaches a new dispenser pump to the microfluidic
     *
     * @param {string} valveid
     * @returns
     * @memberof Setup
     */
    attachPump(pump: DispenserPump) {
        this.__pumps.push(pump);
        this.__hardwareMap.set(pump.ID, pump);
    }

    /**
     * Connects to peripheral manager
     *
     * @memberof Setup
     */
    connect() {
        this.socket = io("http://localhost:3000");
        this.socket.on("connect", () => {
            console.log("Connected to:", this.socket.id);
        });
    }

    disconnect() {
        this.socket.disconnect();
    }

    /**
     * Sends a command to the microfluidic, this assumes that the command is
     * gonna be formatted in the standard comand format
     *
     * @param {string} deviceName
     * @param {number} commandID
     * @param {Array<number>} args
     * @memberof Setup
     */
    sendCommand(deviceName: string, commandID: number, args: Array<number>) {
        this.socket.emit("send-command", {
            name: deviceName,
            "command-id": commandID,
            args: args
        });
    }

    /**
     * Sends the raw data to the device
     *
     * @param {string} device
     * @param {Buffer} payload
     * @memberof Setup
     */
    sendRaw(device: string, payload: Buffer) {
        this.socket.emit("send-raw", {
            device: device,
            payload: payload
        });
    }

    /**
     * Returns a list of devices that are connected to the setup
     *
     * @returns {Promise<string[]>}
     * @memberof Setup
     */
    async listDevices(): Promise<string[]> {
        let devicesList: Array<string> = [];
        await this.socket.emit("list-devices", (data: Array<string>) => {
            devicesList = data;
        });

        return devicesList;
    }

    /**
     * Renames any of the connections/devices attached to the setup in peripheral manager
     *
     * @param {string} oldName
     * @param {string} newName
     * @memberof Setup
     */
    renameReference(oldName: string, newName: string) {
        this.socket.emit("rename-reference", {
            oldName: oldName,
            newName: newName
        });
    }

    /**
     * Lists the connections that are active
     *
     * @returns {Array<string>}
     * @memberof Setup
     */
    listConnections(): Array<string> {
        let connections: Array<string> = [];
        this.socket.emit("list-connections", (data: Array<string>) => {
            connections = data;
        });

        return connections;
    }

    /**
     * Activates a connection
     *
     * @param {string} deviceName
     * @param {string} address
     * @memberof Setup
     */
    activateConnection(deviceName: string, address: string) {
        this.socket.emit("activate-connection", {
            name: deviceName,
            address: address
        });
    }

    /**
     * Deactivates a connection
     *
     * @param {string} deviceName
     * @memberof Setup
     */
    deactivateConnection(deviceName: string) {
        this.socket.emit("deactivate-connection", {
            name: deviceName
        });
    }

    /**
     * Attaches a callback function to an RX connection
     *
     * @param {string} connectionName
     * @param {(data: Buffer) => void} callback
     * @memberof Setup
     */
    attachCallbackToRXConnection(connectionName: string, callback: (data: Buffer) => void) {
        this.socket.on(connectionName, (data: Buffer) => {
            callback(data);
        });
    }
}
