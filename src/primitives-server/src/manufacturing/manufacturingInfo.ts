import { LogicalLayerType } from "../core/init";

export enum DFMType {
  EDGE = "EDGE",
  XYZ = "XYZ",
  XY = "XY",
  Z = "Z",
}

/**
 * Type which contains information for manufacturing svg production
 * @param {DFMType} fabtype Type of fabrication
 * @param {LogicalLayerType | null} layertype Type of layer on which the feature sits
 * @param {string} rendername Key which accesses the z-offset-key and substrate--offset
 * @param {string} z-offset-key Key which corresponds to the property representing height of the feature
 * @param substrate-offset String represented value which represent how this substrate relates to the FLOW substrate
 */
export type ManufacturingInfo = {
  fabtype: DFMType;
  layertype: LogicalLayerType | null;
  rendername: string;
  "z-offset-key": string;
  "substrate-offset": string;
};
