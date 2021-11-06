import Parameter from "../parameter";

export default class StringValue extends Parameter {
    static readonly typeString: string = "String";
    static readonly description: string = "StringValue must be a String, such as 'foobar'";

    constructor(value: string) {
        super("String", value);
    }

    static isValid(value: any): boolean {
        if (typeof value === "string" || value instanceof String) return true;
        else return false;
    }
}
