export default class MapUtils {
    static toMap(obj: { [key: string]: any }): Map<string, any> {
        const map = new Map<string, any>();
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                map.set(key, obj[key]);
            }
        }
        return map;
    }
}
