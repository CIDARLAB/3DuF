import Parameter from "../parameter";

export default class StringValue extends Parameter {
    typeString: string = "String";
    description: string = "StringValue must be a String, such as 'foobar'";

    constructor(value: string) {
        super("String",value);
    }

    isValid(value: any) {
        if (typeof value === "string") return true;
        else return false;
    }

}