export default class AnalogValve {
    protected id: number;
    protected _hwshield: number;
    protected _precision: number;
    protected _openValue: number;
    protected _closeValue: number;
    protected _currentState: ValveState;
    protected _deviceindex: number;

    /**
     * Default constructor for the Pump object
     * @param id
     */
    constructor(id) {
        console.log(id);
        this.id = id;
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

    /**
     * Sets the HW Shield value
     * @param value
     */ set precision(value: number) {
        this._precision = value;
    }

    get precision() {
        return this._precision;
    }

    set close(value) {
        this._closeValue = value;
    }

    get close() {
        return this._closeValue;
    }

    set open(value) {
        this._openValue = value;
    }

    get open() {
        return this._openValue;
    }

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
