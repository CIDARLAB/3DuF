import Parameter from "./parameter";
/**
 * Params class
 */
export default class Params {
    private unique: Array<string>;
    private heritable: Array<string>;
    private parameters: {[index: string]: Parameter};
    

    /**
     * Default constructor create a Params object.
     * @param {} values Values of the params
     * @param {Boolean} unique Boolean if it's unique
     * @param {} heritable Boolean if it's heritable
     * @param {} rawparameters ?
     */
    constructor(values: any, unique: Array<string>, heritable: Array<string>) { 
        this.unique = unique;
        this.heritable = heritable;
    }
    /**
     * Updates parameter value.
     * @param {String} key Identifier of the parameter
     * @param {*} value New value of the parameter
     * @memberof Params
     * @returns {void}
     */
    updateParameter(key: string, value: any) {
        if (this.parameters.hasOwnProperty(key)) {
            this.parameters[key].updateValue(value);
        } else {
            throw new Error(key + "parameter does not exist in Params object");
        }
    }
    /**
     * Checks if the object has certain parameter.
     * @param {String} key The key is use to identify the parameter 
     * @memberof Params
     * @returns {void}
     */
    __ensureHasKey(key: string) {
        if (!this.parameters.hasOwnProperty(key)) throw new Error(key + " parameter not found in Params object.");
    }
    /**
     * Gets the value of the selected parameter.
     * @param {String} key The key is needed to identify the parameter
     * @returns Returns parameter value
     * @memberof Params
     */
    getValue(key: string) {
        this.__ensureHasKey(key);
        return this.parameters[key].Value();
    }

    /**
     * Checks if param object has unique key.
     * @param {String} key Key to identify the param
     * @returns {boolean} 
     * @memberof Params
     */
    isUnique(key: string) {
        return this.unique.includes(key);
    }
    /**
     * Checks if param object has heritable attribute.
     * @param {String} key Key to identify the param
     * @returns {boolean}
     * @memberof Params
     */
    isHeritable(key: string) {
        return this.heritable.includes(key);
    }


    

    /**
     * Converts to JSON format.
     * @returns {JSON}  Returns JSON format.
     * @memberof Params
     */
    toJSON() {
        let json: {[index:string]: any} = {};
        for (let key in this.parameters) {
            if (this.parameters[key] != undefined) {
                json[key] = this.parameters[key].Value(); 
            }
        }
        return json;
    }
    /**
     * Creates new params object from a JSON format.
     * @param {JSON} json 
     * @param {*} unique 
     * @param {*} heritable 
     * @returns {Params} Returns a new params object.
     * @memberof Params
     */
    static fromJSON(json: any, unique: any, heritable: any) {
        return new Params(json, unique, heritable); 
    }
    /**
     * Checks if it has parameters.
     * @param {String} key The key is use to identify the desire parameter.
     * @returns {boolean}
     * @memberof Params
     */
    hasParam(key: string) {
        return Object.hasOwnProperty(this.parameters, key);
    }

    /**
     * Returns a ES6 Map() type object with keys and values.
     * @return {Map<key, value>}
     * @memberof Params
     */
    toMap() {
        let ret = new Map();
        for (let key in this.parameters) {
            if (this.parameters[key] != undefined) {
                ret.set(key, this.parameters[key].Value());
            }
        }
        return ret;
    }
}