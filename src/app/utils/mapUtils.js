export function mapToJson(map) {
    console.log('map to json')
    let object = {};
    for (let [k,v] of map) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        object[k] = v;
      }
    return object;
}

export function jsonToMap(jsonStr) {
    console.log('json to map')
    let ret = new Map();
    for(let key in jsonStr){
        let value = jsonStr[key];
        console.log("Setting:",key, value);
        ret.set(key, value);
    }
    return ret;
}
