export default class MapUtils {
    static toMap(obj: { [key: string]: any }): Map<string, any> {
        const map = new Map<string, any>();
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                map.set(key, obj[key]);
            }
        }
        return map;
    }
}
