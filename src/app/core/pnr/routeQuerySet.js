import RouteQuery from "./routeQuery";

export default class RouteQuerySet {
    constructor(){
        this._routequeries = new Map();
    }

    createNewRouteQuery(connection_object, component_objects){

        //TODO: Pull these from a default design rule set for the particular technology at a future point
        let designrules = new Map();
        designrules.set("channelSpacing", 500);

        let params = new Map();
        params.set("channelWidth", connection_object.getParamValue("channelWidth"));

        let rquery = new RouteQuery(connection_object.source, connection_object.sinks, component_objects.obstacles, connection_object.params, designrules);

        this._routequeries.set(connection_object.getID(), rquery);
    }


    toJSON(){
        let ret = {};
        for(const key of this._routequeries.keys()){
            ret[key] = (this._routequeries.get(key)).toJSON();
        }

        return ret;
    }
}