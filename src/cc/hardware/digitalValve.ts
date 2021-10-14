export default class DigitalValve {
    protected id: number;
    protected _hwshield: number;
    protected _currentState: ValveState;
    protected _deviceindex: number;

    /**
     * Default constructor for the Pump object
     * @param id
     */
    constructor(id: number, deviceIndex: number, hwShield: number, precision: number) {
        console.log(id);
        this.id = id;
        this._deviceindex = deviceIndex;
        this._hwshield = hwShield;
        this._currentState = ValveState.CLOSE;
    }

    /**
     * Sets the id of the Pump object
     * @param value
     */
    set ID(value) {
        this.id = value;
    }

    /**
     * Returns the id of the Pump object
     * @returns {*}
     */
    get ID() {
        return this.id;
    }

    /**
     * Returns the HW shield value
     * @returns {number}
     */
    get hwShield() {
        return this._hwshield;
    } // set HW_Shield(value) { //     this.__hwshield = value; // }

    set currentState(value) {
        this._currentState = value;
    }

    get currentState() {
        return this._currentState;
    }

    set deviceIndex(value) {
        this._deviceindex = value;
    }

    get deviceIndex() {
        return this._deviceindex;
    }

    //find
}

//This enum describes the possible states of the pump
export enum ValveState {
    OPEN,
    CLOSE
}
