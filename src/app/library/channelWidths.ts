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

/** Distance from a mixer port to the outer end of that incomplete bend (µm). */
export function mixerEdgeBend(params: { [k: string]: any }, which: 1 | 2): number {
    const key = which === 1 ? "edgeBend1" : "edgeBend2";
    const raw = Number(params && params[key]);
    if (Number.isFinite(raw) && raw >= 0) {
        return raw;
    }
    const channelWidth = Number(params && params.channelWidth);
    if (Number.isFinite(channelWidth) && channelWidth > 0) {
        return channelWidth / 2;
    }
    return DEFAULT_CHANNEL_WIDTH_UM / 2;
}

/**
 * Unrotated mixer layout. Both ports sit on the geometric / rotation-center
 * axis (local x = channelWidth + bendLength/2). After rotation that is the
 * same x as the center at 0°/180°, and the same y at 90°/270°.
 * edgeBend1/2 are port-to-outer-edge distances; set each to half the
 * connecting channel width so the mixer end matches that pipe.
 */
export function mixerEndLayout(params: { [k: string]: any }) {
    const channelWidth = Number(params && params.channelWidth) || DEFAULT_CHANNEL_WIDTH_UM;
    const bendLength = Number(params && params.bendLength) || 2 * DEFAULT_CHANNEL_WIDTH_UM;
    const bendSpacing = Number(params && params.bendSpacing) || 0;
    const numberOfBends = Number(params && params.numberOfBends) || 1;
    const e1 = mixerEdgeBend(params, 1);
    const e2 = mixerEdgeBend(params, 2);
    const portX = channelWidth + bendLength / 2;
    const lastEnd = bendLength + 1.5 * channelWidth;
    const lastStart = portX - e2;
    return {
        channelWidth,
        bendLength,
        e1,
        e2,
        portX,
        port1x: portX,
        port2x: portX,
        firstWidth: portX + e1,
        lastStart,
        lastWidth: lastEnd - lastStart,
        lastEnd,
        openingY2: (2 * numberOfBends + 1) * channelWidth + 2 * numberOfBends * bendSpacing
    };
}

/** If JSON omitted the end-bend lengths, use half of this mixer's channelWidth. */
export function seedMixerEdgeBends(values: { [k: string]: any } | null | undefined): void {
    if (!values || typeof values !== "object") return;
    const channelWidth = Number(values.channelWidth);
    const fallback =
        Number.isFinite(channelWidth) && channelWidth > 0 ? channelWidth / 2 : DEFAULT_CHANNEL_WIDTH_UM / 2;
    if (values.edgeBend1 === undefined || values.edgeBend1 === null) {
        values.edgeBend1 = fallback;
    }
    if (values.edgeBend2 === undefined || values.edgeBend2 === null) {
        values.edgeBend2 = fallback;
    }
}
