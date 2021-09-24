import { LogicalLayerType } from "../core/init";

export enum DFMType {
    XYZ,
    XY,
    Z
}

export type ManufacturingInfo = {
    fabtype: DFMType;
    layertype: LogicalLayerType;
    rendername: string;
    "z-offset-key": string;
    "substrate-offset": string;
};
