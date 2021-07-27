import StringValue from "./parameters/stringValue";
import Component from "./component";
import Connection from "./connection";
import Feature from "./feature";

export type Point = [number, number];

export type Segment = [Point, Point];

export type DeviceInterchangeV1 = {
    name: string;
    params: any;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1>;
    features: Array<LayerInterchangeV1>;
    version: number;
};

export type DeviceInterchangeV1_1 = {
    name: string;
    params: any;
    layers: Array<LayerInterchangeV1>;
    groups: Array<string>;
    components: Array<ComponentInterchangeV1>;
    connections: Array<ConnectionInterchangeV1>;
    features: Array<LayerInterchangeV1>;
    version: number;
};

export type ComponentInterchangeV1 = {
    id: string;
    name: string;
    entity: string;
    params: any;
    xspan: number;
    yspan: number;
    ports: Array<ComponentPortInterchangeV1>;
    layer: Array<string>;
};

export type ConnectionInterchangeV1 = {
    id: string;
    name: string;
    entity: string;
    source: any;
    sinks: any;
    paths?: Array<Array<Point>>;
    params: any;
    xspan?: number;
    yspan?: number;
    layer?: string;
};

export type LayerInterchangeV1 = {
    id: string;
    name: string;
    params: any;
    group: string;
    type: string;
    features: Array<FeatureInterchangeV0>;
    color: string | undefined;
};

export type RenderLayerInterchangeV1 = {
    id: string;
    group: string;
    features: Array<FeatureInterchangeV0>;
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
