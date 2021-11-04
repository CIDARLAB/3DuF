import md5 from "md5";
import Device from "../core/device";

const HISTORY_SIZE = 50;
/**
 * Design History class
 */
export default class DesignHistory {
    deviceData: any[];
    private __mostRecentMD5: string | null;

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
    pushDesign(devicedata: string) {
        // Calculate md5 hash and see if we want so save this design
        const hash = md5(devicedata);
        if (this.__mostRecentMD5) {
            if (hash === this.__mostRecentMD5) {
                return;
            }
        }
        // Remove data from the undo stack if there is too much info there
        if (this.deviceData.length > HISTORY_SIZE) {
            this.deviceData.splice(0, 1);
        }

        // Add to design
        this.deviceData.push(devicedata);
        this.__mostRecentMD5 = hash;
        console.log("Saved new state:", hash);
    }

    /**
     * Removes a design from the history
     * @returns {Device}
     * @memberof DesignHistory
     */
    popDesign(): string {
        if (this.deviceData.length > 0) {
            const device = this.deviceData.pop();
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
    __cloneObject(obj: { [k: string]: any }) {
        const clone: { [k: string]: any } = {};
        for (const i in obj) {
            if (obj[i] !== null && typeof obj[i] === "object") clone[i] = this.__cloneObject(obj[i]);
            else clone[i] = obj[i];
        }
        return clone;
    }
}
