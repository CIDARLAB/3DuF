/**
 * DXFObject class
 */
export default class DXFObject {
    protected _rootObject: any;
    protected _type: string;

    /**
     * Default Constructor
     * @param {*} jsondata
     */
    constructor(jsondata: any) {
        this._rootObject = jsondata;

        this._type = jsondata.type;
    }

    /**
     * Sets type of the object
     * @param {String} type
     * @memberof DXFObject
     * @returns {void}
     */
    setType(type: string) {
        this._type = type;
        this._rootObject.type = type;
    }

    /**
     * Gets the type of the object
     * @returns {String} Returns type of the object
     * @memberof DXFObject
     */
    getType(): string {
        return this._type;
    }

    /**
     * Gets the data of the object
     * @returns {} Returns the data of the object
     * @memberof DXFObject
     */
    getData(): any {
        return this._rootObject;
    }

    /**
     * Adds data by passing the key (Name of the data) and it's value
     * @param {String} key
     * @param {*} value
     * @memberof DXFObject
     * @returns {void}
     */
    addData(key: string, value: any) {
        this._rootObject[key] = value;
    }

    /**
     * ?
     * @returns {Object}
     * @memberof DXFObject
     */
    toJSON(): JSON {
        return this._rootObject;
    }

    /**
     *
     * @param {JSON} json
     * @returns {DXFObject} Returns new DXFObject object
     * @memberof DXFObject
     */
    static fromJSON(json: JSON): DXFObject {
        return new DXFObject(json);
    }
}
