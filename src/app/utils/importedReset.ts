import { ComponentAPI } from "@/componentAPI";
import { ConnectionInterchangeV1_2, ComponentInterchangeV1, InterchangeV1_2 } from "@/app/core/init";

function cloneJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function collectNodeIds(node: { [k: string]: any } | null | undefined): string[] {
    if (!node || typeof node !== "object") return [];
    const ids: string[] = [];
    const push = (v: unknown) => {
        if (v == null || v === "") return;
        ids.push(String(v));
    };
    push(node.id);
    push(node.name);
    const params = node.params;
    if (params && typeof params === "object") {
        push(params.ID);
        push(params.id);
    }
    return ids;
}

function nodeMatchesId(node: { [k: string]: any } | null | undefined, id: string): boolean {
    const want = String(id || "");
    if (!want) return false;
    return collectNodeIds(node).includes(want);
}

export function cloneImportedDeviceJson(json: InterchangeV1_2 | null | undefined): InterchangeV1_2 | null {
    if (!json || typeof json !== "object") return null;
    try {
        return cloneJson(json);
    } catch (_) {
        return null;
    }
}

export function findImportedComponentById(
    source: InterchangeV1_2 | null | undefined,
    id: string
): ComponentInterchangeV1 | null {
    const list = source && Array.isArray(source.components) ? source.components : [];
    for (const node of list) {
        if (nodeMatchesId(node as { [k: string]: any }, id)) {
            return node;
        }
    }
    return null;
}

export function findImportedConnectionById(
    source: InterchangeV1_2 | null | undefined,
    id: string
): ConnectionInterchangeV1_2 | null {
    const list = source && Array.isArray(source.connections) ? source.connections : [];
    for (const node of list) {
        if (nodeMatchesId(node as { [k: string]: any }, id)) {
            return node;
        }
    }
    return null;
}

function overlayNumericParams(
    out: { [key: string]: number },
    mint: string,
    sourceParams: { [k: string]: any } | null | undefined
): { [key: string]: number } {
    const src = sourceParams && typeof sourceParams === "object" ? sourceParams : {};
    const definition = ComponentAPI.getDefinitionForMINT(mint);
    if (definition && definition.heritable) {
        for (const key in definition.heritable) {
            if (key === "position") continue;
            const raw = src[key];
            if (raw == null || raw === "") continue;
            const n = Number(raw);
            if (Number.isFinite(n)) out[key] = n;
        }
    }
    const mintNorm = String(mint || "").toUpperCase();
    if (mintNorm === "MUX" || mintNorm === "TREE" || mintNorm === "YTREE") {
        if (src.leafSpace == null) {
            const leaf = Number(
                src.leafPitch != null ? src.leafPitch : src.spacing
            );
            if (Number.isFinite(leaf) && leaf > 0) out.leafSpace = leaf;
        }
        if (src.stageSpace == null) {
            const stage = Number(src.stageLength);
            if (Number.isFinite(stage) && stage > 0) out.stageSpace = stage;
        }
    }
    if (mintNorm === "MUX") {
        if (src.valveWidthX == null) {
            const x = Number(src.valveWidth != null ? src.valveWidth : src.width);
            if (Number.isFinite(x) && x > 0) out.valveWidthX = x;
        }
        if (src.valveWidthY == null) {
            const y = Number(src.length);
            if (Number.isFinite(y) && y > 0) out.valveWidthY = y;
        }
    }
    return out;
}

/**
 * Numeric heritable params to apply on Reset.
 * If the uploaded JSON contains this object, overlay those values on factory
 * defaults so new fields still exist; otherwise return factory defaults.
 */
export function resolveResetParams(
    mint: string,
    sourceParams: { [k: string]: any } | null | undefined,
    useSource: boolean
): { [key: string]: number } | null {
    const factory = ComponentAPI.snapshotFactoryDefaultsForMint(mint);
    if (!factory) return null;
    const out: { [key: string]: number } = {};
    for (const key in factory) {
        if (key === "position") continue;
        const n = Number(factory[key]);
        if (Number.isFinite(n)) out[key] = n;
    }
    if (useSource) {
        overlayNumericParams(out, mint, sourceParams);
    }
    return out;
}
