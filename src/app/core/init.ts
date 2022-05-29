export type Point = [number, number];

export type Segment = [Point, Point];

export type ParamsInterchangeType = {[key: string]: any};

export type ToolPaperObject = paper.CompoundPath | paper.Path | paper.PointText | paper.PathItem;

export type InterchangeV1_2 = {
    name: string;
    params: ParamsInterchangeType;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1_2>;
    valves: Array<ValveInterchangeV1_2>;
    version: string;
    renderLayers: Array<RenderLayerInterchangeV1_2>;
};

export enum LogicalLayerType {
    FLOW = "FLOW",
    CONTROL = "CONTROL",
    INTEGRATION = "INTEGRATION"
}

export enum ValveType {
    NORMALLY_OPEN = "NORMALLY_OPEN",
    NORMALLY_CLOSED = "NORMALLY_CLOSED",
}

export type DeviceInterchangeV1 = {
    name: string;
    params: ParamsInterchangeType;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1_2>;
    valves: Array<ValveInterchangeV1_2>;
    version: string;
};

export type DeviceInterchangeV1_1 = {
    name: string;
    params: ParamsInterchangeType;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1_2>;
    version: string;
};

export type ComponentInterchangeV1 = {
    id: string;
    name: string;
    entity: string;
    params: ParamsInterchangeType;
    "x-span": number;
    "y-span": number;
    ports: Array<ComponentPortInterchangeV1>;
    layers: Array<string>;
};

export type ConnectionInterchangeV1_2 = {
    id: string;
    name: string;
    entity: string;
    source: ConnectionTargetInterchangeV1;
    sinks: Array<ConnectionTargetInterchangeV1>;
    paths: Array<ConnectionPathInterchangeV1_2>;
    params: ParamsInterchangeType;
    layer: string;
};

export type ValveInterchangeV1_2 = {
    componentid: string;
    connectionid: string;
    type: ValveType;
    params: ParamsInterchangeType;
}

export type LayerInterchangeV1 = {
    id: string;
    name: string;
    params: ParamsInterchangeType;
    group: string;
    type: string;
    features: Array<FeatureInterchangeV1_2>;
};

export type RenderLayerInterchangeV1_2 = {
    id: string;
    features: Array<FeatureInterchangeV1_2>;
    modellayer: string | null;
    color: string | undefined;
    name: string;
    type: string;
};

export type FeatureInterchangeV1_2 = {
    id: string;
    name: string;
    macro: string;
    referenceID: string | null;
    params: ParamsInterchangeType;
    dxfData: any;
    type: string;
};

export type ComponentPortInterchangeV1 = {
    x: number;
    y: number;
    label: string;
    layer: string;
};

export type ConnectionTargetInterchangeV1 = {
    component: string;
    port: string;
};

export type ConnectionPathInterchangeV1_2 = {
    wayPoints: Array<Point>;
    source: ConnectionTargetInterchangeV1 | null;
    sink: ConnectionTargetInterchangeV1 | null;
};
