import paper from "paper";
import Registry from "@/app/core/registry";

/**
 * Union of rendered feature bounds in global project space (Paper “world” coordinates).
 * `Component.getBoundingRectangle()` unites `item.bounds` values that live in each item’s
 * parent layer space; uniting those rectangles without converting first is wrong when
 * features sit under different layer groups, which skews the anchor used for UI placement.
 */
function getRenderedComponentGlobalBounds(component: any): paper.Rectangle | null {
    const view = Registry.viewManager?.view as any;
    if (!view || typeof view.getRenderedFeature !== "function" || !component?.featureIDs?.length) {
        return null;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const fid of component.featureIDs) {
        const item = view.getRenderedFeature(fid);
        if (!item || !item.bounds) continue;
        const b = item.bounds;
        const parent = item.parent;
        const corners = [b.topLeft, b.topRight, b.bottomLeft, b.bottomRight];
        for (let i = 0; i < corners.length; i++) {
            const g = parent && parent.localToGlobal ? parent.localToGlobal(corners[i]) : item.localToGlobal(corners[i]);
            if (g.x < minX) minX = g.x;
            if (g.y < minY) minY = g.y;
            if (g.x > maxX) maxX = g.x;
            if (g.y > maxY) maxY = g.y;
        }
    }
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
    return new paper.Rectangle(minX, minY, maxX - minX, maxY - minY);
}

/**
 * Screen coordinates of the bottom-right corner of a placed component’s paper bounds.
 */
export function getPlacedComponentScreenBottomRight(component: any): { left: number; top: number } | null {
    try {
        if (!component) return null;
        const globalBounds = getRenderedComponentGlobalBounds(component);
        if (!globalBounds) return null;
        const p = globalBounds.bottomRight;
        const vp = paper.view.projectToView(p);
        const canvasEl = (paper.view?.element as HTMLElement | null | undefined) || (Registry.viewManager?.view?.canvas as HTMLElement | null | undefined);
        if (!canvasEl) return null;
        const cr = canvasEl.getBoundingClientRect();
        return { left: cr.left + vp.x, top: cr.top + vp.y };
    } catch {
        return null;
    }
}

/**
 * Position a Vuetify dialog content root (content-class) just below-right of anchor.
 * Only clamps horizontally so the dialog stays on-screen; vertical stays below anchor (may extend past viewport bottom).
 */
export function applyAnchorToDialogContent(anchor: { left: number; top: number } | null, contentClass: string, gap = 8, pad = 12): void {
    if (!anchor || !contentClass) return;
    const run = () => {
        const el = document.querySelector(`.${contentClass}`) as HTMLElement | null;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const w = rect.width || 400;
        let left = anchor.left + gap;
        const top = Math.max(pad, anchor.top + gap);
        if (left + w + pad > window.innerWidth) {
            left = Math.max(pad, window.innerWidth - w - pad);
        }
        left = Math.max(pad, left);
        el.style.position = "fixed";
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.margin = "0";
    };
    requestAnimationFrame(() => {
        run();
        requestAnimationFrame(run);
    });
}
