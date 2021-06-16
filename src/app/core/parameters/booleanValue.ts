import Parameter from "../parameter";

export default class BooleanValue extends Parameter {
    typeString: string = "Boolean";
    description: string = "BooleanValue must be true or false.";

    constructor(value: boolean) {
        super("Boolean",value);
    }

    isValid(value: any) {
        if (typeof value === "boolean") return true;
        else return false;
    }
}