export default class GeometryEdge {
    constructor(start, end, type, id, data) {
        this.__start = start;
        this.__end = end;

        this.__type = type;
        this.__id = id;

        this.__dxfData = data;

        //TODO: Do classification of kind of edge (curve, horizontal, vertical, angled, etc), compute length
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
