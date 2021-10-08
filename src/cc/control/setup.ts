import DispenserPump from "../hardware/dispenserpump";
import Microfluidic from "../hardware/microfluidic";
import AnalogValve from "../hardware/analogValve";

export default class Setup {
    private __chip: Microfluidic;
    private __pumps: Array<DispenserPump>;
    private __peripherals: Array<any>;
    private __hardwareMap: Map<string, any>;

    /**
     * The constructor takes a json, then dynamically creates the microfluidic object from that
     * @param json
     */
    constructor(json) {
        //Initialize everything !!!!!
        let chip = new Microfluidic(json);
        this.__chip = chip;
        this.__pumps = [];
        this.__peripherals = [];
        this.__hardwareMap = new Map();
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
     * @param valve id
     * @param avalve object
     */
    attachAnalogValve(valve, avalve: AnalogValve) {
        this.__pumps.push(avalve);
        this.__hardwaremap.set(valve, avalve);
    }

    toggleValve(valveid) {
        let pump = this.__hardwareMap.get(valveid);
        let openvalue = pump.getOpen;
        pump.setState();
    }

    attachPump(pump: DispenserPump) {
        this.__pumps.push(pump);
        this.__hardwareMap.set(pump.ID, pump);
    }
}
