export default class RouteQuery {
    constructor(source = null, sinks = [], obstacles = [], params = new Map(), designrules = new Map()){
        self._source = source;
        self._sinks = sinks;
        self._obstacles = obstacles;
        self._params = params;
        self._designRules = designrules;
    }

    setParam(param_key, param_value){
        self._params.set(param_key, param_value);
    }

    setDesignRule(rule_key, rule_value){
        self._designRules.set(rule_key, rule_value)
    }

    toJSON(){
        let ret = {};

        ret['source'] = self._source;
        ret['sinks'] = self._sinks;
        ret['obstacles'] = self._obstacles;

        return ret;
    }
}