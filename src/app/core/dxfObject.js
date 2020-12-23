export default class DXFObject {
    /**
     * Default Constructor
     * @param {*} jsondata 
     */
    constructor(jsondata) {
        this.__rootObject = jsondata;

        this.__type = jsondata["type"];
    }
    /**
     * Sets type of the object
     * @param {String} type 
     */
    setType(type) {
        this.__type = type;
        this.__rootObject["type"] = type;
    }
    /**
     * Gets the type of the object
     * @returns {String} Returns type of the object
     */
    getType() {
        return this.__type;
    }
    /**
     * Gets the data of the object
     * @returns {} Returns the data of the object
     */
    getData() {
        return this.__rootObject;
    }
    /**
     * Adds data by passing the key (Name of the data) and it's value
     * @param {String} key 
     * @param {*} value 
     */
    addData(key, value) {
        this.__rootObject[key] = value;
    }
    /**
     * ?
     * @returns {Object}
     */
    toJSON() {
        return this.__rootObject;
    }
    /**
     * 
     * @param {JSON} json 
     * @returns {DXFObject} Returns new DXFObject object
     */
    static fromJSON(json) {
        return new DXFObject(json);
    }
}
