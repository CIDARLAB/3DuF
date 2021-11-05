export default class GeometryEdge {
    private __start: any;
    private __end: any;
    private __type: any;
    private __id: any;
    private __dxfData: any;

    constructor(start: any, end: any, type: any, id: any, data: any) {
        this.__start = start;
        this.__end = end;

        this.__type = type;
        this.__id = id;

        this.__dxfData = data;

        // TODO: Do classification of kind of edge (curve, horizontal, vertical, angled, etc), compute length
    }

    get id() {
        return this.__id;
    }

    get start() {
        return this.__start;
    }

    get end() {
        return this.__end;
    }

    get type() {
        return this.__type;
    }

    get dxfData() {
        return this.__dxfData;
    }
}
