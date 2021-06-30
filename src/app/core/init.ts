import StringValue from "./parameters/stringValue"
import Component from "./component"
import Connection from "./connection"
import Feature from "./feature"

type Point = [number, number]

type Segment = number[]

export type DeviceInterchangeV1 = {
    name: string
    params: any
    //layers: any[]
    groups: Array<string>
    components: Array<ComponentInterchangeV1>
    connections: Array<ConnectionInterchangeV1>
    features: Array<LayerInterchangeV1>
    version: number
}

export type ComponentInterchangeV1 = {
    id: string
    name: string 
    entity: string
    params: any
    xspan: number
    yspan: number
    ports: any[]
    layer: Array<string>
}

export type ConnectionInterchangeV1 = {
    id: string
    name: string
    entity: string
    source: any
    sinks: any
    paths?: [number, number][]
    params: any
    xspan?: number
    yspan?: number
    ports?: any[]
    layer?: string
}

export type LayerInterchangeV1 = {
    id: string
    name: string
    params: any
    group: string
    type: string
    features: Array<FeatureInterchangeV1>
    color: string | undefined
}

export type FeatureInterchangeV1 = {
    id: string
    name: string
    macro: string
    set: any
    referenceID: string
    params: any
    dxfData: any
    type: string
}

type ComponentPortInterchangeV1 = {
    x: number,
    y: number,
    label: string,
    layer: any
}