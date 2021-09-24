export type Point = [number, number];

export type Segment = [Point, Point];

export type ScratchInterchangeV1 = {
    name: string;
    params: any;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1>;
    version: number;
    //device: DeviceInterchangeV1;
    renderLayers: Array<RenderLayerInterchangeV1>;
};

export enum LogicalLayerType {
    FLOW = "FLOW",
    CONTROL = "CONTROL",
    INTEGRATION = "INTEGRATION"
}

export type DeviceInterchangeV1 = {
    name: string;
    params: any;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1>;
    version: number;
};

export type DeviceInterchangeV1_1 = {
    name: string;
    params: any;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1>;
    version: number;
};

export type ComponentInterchangeV1 = {
    id: string;
    name: string;
    entity: string;
    params: any;
    "x-span": number;
    "y-span": number;
    ports: Array<ComponentPortInterchangeV1>;
    layers: Array<string>;
};

export type ConnectionInterchangeV1 = {
    id: string;
    name: string;
    entity: string;
    source: any;
    sinks: any;
    paths: Array<ConnectionPathInterchangeV1>;
    params: any;
    layer: string;
};

export type LayerInterchangeV1 = {
    id: string;
    name: string;
    params: any;
    group: string;
    type: string;
    features: Array<FeatureInterchangeV0>;
};

export type RenderLayerInterchangeV1 = {
    id: string;
    features: Array<FeatureInterchangeV0>;
    modellayer: string | null;
    color: string | undefined;
    name: string;
    type: string;
};

export type FeatureInterchangeV0 = {
    id: string;
    name: string;
    macro: string;
    referenceID: string | null;
    params: any;
    dxfData: any;
    type: string;
};

export type ComponentPortInterchangeV1 = {
    x: number;
    y: number;
    label: string;
    layer: any;
};

export type ConnectionTargetInterchangeV1 = {
    component: string;
    port: string;
};

export type ConnectionPathInterchangeV1 = {
    wayPoints: Array<Point>;
    source: ConnectionTargetInterchangeV1 | null;
    sink: ConnectionTargetInterchangeV1 | null;
};
