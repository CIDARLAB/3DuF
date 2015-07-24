var appRoot = "../";
var Registry = require(appRoot + "core/registry");

class Parameter {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    toJSON() {
        let output = {};
        output.type = this.type;
        output.value = this.value;
        return output;
    }

    static registerParamType(type, func) {
        Registry.registeredParams[type] = func;
    }
}

module.exports = Parameter;