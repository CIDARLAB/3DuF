import RouteQuery from "./routeQuery";

export default class RouteQuerySet {
    constructor(){
        this._routequeries = new Map();
    }

    createNewRouteQuery(connection_object, obstacles){

        //TODO: Pull these from a default design rule set for the particular technology at a future point
        let designrules = new Map();
        designrules.set("channelSpacing", 500);

        let params = new Map();
        params.set("channelWidth", connection_object.getValue("channelWidth"));
        let paths = connection_object.getPaths();
        let path = paths[0];
        //TODO: For multi paths


        let source = path[0];
        let sinks = [path[path.length-1]];

        let rquery = new RouteQuery(source, sinks, obstacles, params, designrules);

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