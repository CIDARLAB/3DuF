import { LogicalLayerType } from "../core/init";

/**
 * Unified default for FLOW and CONTROL pipes, mixer serpentine, mux/tree
 * flow channels, and VALVE3D gap (µm). Clicking a 3DuF library component
 * uses Template.__defaults; the primitives server returns the same object.
 */
export const DEFAULT_CHANNEL_WIDTH_UM = 600;
export const DEFAULT_MIXER_CHANNEL_WIDTH_UM = DEFAULT_CHANNEL_WIDTH_UM;
export const DEFAULT_MIXER_BEND_SPACING_UM = 1400;
export const DEFAULT_MIXER_BEND_LENGTH_UM = 2000;
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
 * Unrotated mixer layout.
 *
 * The serpentine spine (and both ports) sit at
 * ``portX = channelWidth + bendLength/2``, which is also half of the true
 * drawn width ``bendLength + 2·channelWidth``. After centering, that is the
 * same world X as ``params.position`` at rot 0/180 (same world Y at 90/270).
 *
 * Along the serpentine axis, each port is the end-pipe midline
 * (``channelWidth / 2`` from the outer tip) — independent of edgeBend.
 *
 * ``edgeBend1`` / ``edgeBend2`` are only the outward stub past each port
 * along the incomplete bend (+X for port 1, −X for port 2). They never
 * move the port and never accumulate onto each other.
 */
export function mixerEndLayout(params: { [k: string]: any }) {
    const channelWidth = Number(params && params.channelWidth) || DEFAULT_MIXER_CHANNEL_WIDTH_UM;
    const bendLength = Number(params && params.bendLength) || DEFAULT_MIXER_BEND_LENGTH_UM;
    const bendSpacing = Number(params && params.bendSpacing) || DEFAULT_MIXER_BEND_SPACING_UM;
    const numberOfBends = Number(params && params.numberOfBends) || 1;
    const e1 = mixerEdgeBend(params, 1);
    const e2 = mixerEdgeBend(params, 2);
    // Matches the mid-horizontal ``segLength`` in betterMixer / threeDMixer.
    const drawnWidth = bendLength + 2 * channelWidth;
    // Serpentine spine = geometric center of the drawn envelope.
    const portX = channelWidth + bendLength / 2;
    // Bend1 tip opens +X past the port; bend2 tip opens −X past the port.
    // Body side of bend2 continues to the right edge of the envelope.
    const lastEnd = drawnWidth;
    const lastStart = portX - e2;
    const openingY2 = (2 * numberOfBends + 1) * channelWidth + 2 * numberOfBends * bendSpacing;
    return {
        channelWidth,
        bendLength,
        e1,
        e2,
        portX,
        port1x: portX,
        port2x: portX,
        port1y: channelWidth / 2,
        port2y: openingY2 - channelWidth / 2,
        firstWidth: portX + e1,
        lastStart,
        lastWidth: lastEnd - lastStart,
        lastEnd,
        openingY2,
        drawnWidth
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
