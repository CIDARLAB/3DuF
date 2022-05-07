export default class DispenserPump {
    private __id: string;
    private __hwshield: number = 1;
    private __Precision: number = 0.001;
    private __deviceindex: number = 0;
    private __Current_State: number = 0;
    private __Min: number = 0;
    private __Max: number = 255;

    /**
     * Default constructor for the Pump object
     * @param id
     */
    constructor(id: string) {
        console.log(id);
        this.__id = id;
    }

    /**
     * Sets the id of the Pump object
     * @param value
     */
    set ID(value) {
        this.__id = value;
    }

    /**
     * Returns the id of the Pump object
     * @returns {*}
     */
    get ID() {
        return this.__id;
    }

    /**
     * Returns the HW shield value
     * @returns {number}
     */
    get HW_Shield() {
        return this.__hwshield;
    } //

    /**
     * Sets the HW Shield value
     * @param value
     */ set HW_Shield(value) {
        this.__hwshield = value;
    }

    set Precision(value) {
        this.__Precision = value;
    }

    get Precision() {
        return this.__Precision;
    }

    set Min(value) {
        this.__Min = value;
    }

    get Min() {
        return this.__Min;
    }

    set Max(value) {
        this.__Max = value;
    }

    get Max() {
        return this.__Max;
    }

    set Current_State(value) {
        this.__Current_State = value;
    }

    get Current_State() {
        return this.__Current_State;
    }

    set Device_Index(value) {
        this.__deviceindex = value;
    }

    get Device_Index() {
        return this.__deviceindex;
    }
}
