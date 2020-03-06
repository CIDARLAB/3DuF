import md5 from "md5";

const HISTORY_SIZE = 50;

export default class DesignHistory {
    constructor() {
        this.deviceData = [];
        this.__mostRecentMD5 = null;
    }

    /**
     * Adds new design to the design history
     * @param devicedata
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
     * @private
     */
    __cloneObject(obj) {
        var clone = {};
        for (var i in obj) {
            if (obj[i] != null && typeof obj[i] == "object") clone[i] = this.__cloneObject(obj[i]);
            else clone[i] = obj[i];
        }
        return clone;
    }
}
