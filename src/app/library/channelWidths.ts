import { LogicalLayerType } from "../core/init";

/**
 * Unified default for FLOW and CONTROL pipes, mixer serpentine, mux/tree
 * flow channels, and VALVE3D gap (µm). Clicking a 3DuF library component
 * uses Template.__defaults; the primitives server returns the same object.
 */
export const DEFAULT_CHANNEL_WIDTH_UM = 600;
export const DEFAULT_VALVE_GAP_UM = DEFAULT_CHANNEL_WIDTH_UM;
export const DEFAULT_FLOW_CHANNEL_WIDTH_UM = DEFAULT_CHANNEL_WIDTH_UM;
export const DEFAULT_CONTROL_CHANNEL_WIDTH_UM = DEFAULT_CHANNEL_WIDTH_UM;

const CHANNEL_FEATURE_TYPES = new Set(["Channel", "RoundedChannel", "Connection"]);

export function isChannelFeatureType(typeString: string): boolean {
    return CHANNEL_FEATURE_TYPES.has(typeString);
}

export function channelWidthForLayer(_layerType?: string | LogicalLayerType | null): number {
    return DEFAULT_CHANNEL_WIDTH_UM;
}
