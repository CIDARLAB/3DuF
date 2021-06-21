import Parameter from "../parameter";

export default class StringValue extends Parameter {
    static readonly typeString: string = "String";
    static readonly description: string = "StringValue must be a String, such as 'foobar'";

    constructor(value: string | String) {
        super("String",value);
    }

    static isValid(value: any) {
<<<<<<< HEAD
<<<<<<< HEAD
        if (typeof value === "string" || value instanceof String) return true;
=======
        if (typeof value === "string") return true;
>>>>>>> Converted isValid to static
=======
        if (typeof value === "string" || value instanceof String) return true;
>>>>>>> Added String type allowance
        else return false;
    }

}