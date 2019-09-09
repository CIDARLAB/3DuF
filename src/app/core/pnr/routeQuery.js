export default class RouteQuery {
    constructor(source = null, sinks = [], obstacles = []){
        self._source = source;
        self._sinks = sinks;
        self._obstacles = obstacles;



    }

    toJSON(){
        let ret = {};

        ret['source'] = self._source;
        ret['sinks'] = self._sinks;
        ret['obstacles'] = self._obstacles;

        return ret;
    }
}