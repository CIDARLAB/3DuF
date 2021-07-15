import Parameter from "../parameter";

export default class BooleanValue extends Parameter {
    static readonly typeString: string = "Boolean";
    static readonly description: string = "BooleanValue must be true or false.";

    constructor(value: boolean) {
        super("Boolean", value);
    }

    static isValid(value: any): boolean {
        if (typeof value === "boolean") return true;
        else return false;
    }
}
