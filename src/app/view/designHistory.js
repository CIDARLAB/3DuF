import md5 from "md5";
import Device from "../core/device";

const HISTORY_SIZE = 50;
/**
 * Design History class
 */
export default class DesignHistory {
    /**
     * Default Construcot for the Design History object
     */
    constructor() {
        this.deviceData = [];
        this.__mostRecentMD5 = null;
    }

    /**
     * Adds new design to the design history
     * @param {Array} devicedata
     * @returns {void}
     * @memberof DesignHistory
     */
    pushDesign(devicedata) {
        //Calculate md5 hash and see if we want so save this design
        let hash = md5(devicedata);
        if (this.__mostRecentMD5) {
            if (hash === this.__mostRecentMD5) {
                return;
            }
        }
        //Remove data from the undo stack if there is too much info there
        if (this.deviceData.length > HISTORY_SIZE) {
            this.deviceData.splice(0, 1);
        }

        //Add to design
        this.deviceData.push(devicedata);
        this.__mostRecentMD5 = hash;
        console.log("Saved new state:", hash);
    }
    /**
     * Removes a design from the history
     * @returns {Device}
     * @memberof DesignHistory
     */
    popDesign() {
        if (this.deviceData.length > 0) {
            let device = this.deviceData.pop();
            return device;
        } else {
            return null;
        }
    }

    /**
     * Deep copys the object being stored in the design
     * @param obj
     * @returns {Object}
     * @memberof DesignHistory
     * @private
     */
    __cloneObject(obj) {
        var clone = {};
        for (var i in obj) {
            if (obj[i] !== null && typeof obj[i] == "object") clone[i] = this.__cloneObject(obj[i]);
            else clone[i] = obj[i];
        }
        return clone;
    }
}
