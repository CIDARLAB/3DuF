import { Registry } from "..";
import Layer from "../core/layer";
import RenderLayer from "../view/renderLayer";

/**
 * Looks up the render layer for a given physical layer
 *
 * @export
 * @param {Layer} physicalLayer
 * @returns {(RenderLayer | null)}
 */
export function lookUpRenderLayer(physicalLayer: Layer): RenderLayer | null {
    if (Registry.viewManager === null) {
        throw new Error("View manager not set in registry");
    }
    for (const layer of Registry.viewManager.renderLayers) {
        if (layer.physicalLayer?.id === physicalLayer.id) {
            return layer;
        }
    }
    return null;
}