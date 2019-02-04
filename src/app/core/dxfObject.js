export default class DXFObject{
    constructor(jsondata){
        this.__rootObject = jsondata;

        this.__type = jsondata['type'];
    }

    setType(type){
        this.__type = type;
        this.__rootObject['type'] = type;
    }

    getType(){
        return this.__type;
    }

    getData(){
        return this.__rootObject;
    }

    addData(key, value){
        this.__rootObject[key] = value;
    }

    toJSON(){
        return this.__rootObject;
    }

    static fromJSON(json){
        return new DXFObject(json);
    }
}