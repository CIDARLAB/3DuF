import Component from "./component";

export default class ConnectionTarget{
    constructor(component, portLabel){

        this.__component = component;
        this.__portLabel = portLabel;
    }

    get portLabel() {
        return this.__portLabel;
    }
    get component() {
        return this.__component;
    }

    toJSON(){
        return {"component": this.__component.getID(), "port": this.__portLabel};
    }

    static fromJSON(device, json){
        let component = device.getComponentByID(json.component);
        return new ConnectionTarget(json.component, json.port);
    }
}