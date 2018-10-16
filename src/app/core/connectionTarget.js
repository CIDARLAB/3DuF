export default class ConnectionTarget{
    constructor(componentID, portLabel){
        this.__componentID = componentID;
        this.__portLabel = portLabel;
    }

    toJSON(){
        return {"component": this.__componentID, "port": this.__portLabel};
    }
}