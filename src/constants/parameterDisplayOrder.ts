/**
 * Display order for component/connection parameter tables.
 * Similar-function keys stay adjacent; keepout keys go last.
 */
const PARAMETER_RANK: Record<string, number> = {
    in: 10,
    out: 11,
    leafs: 12,
    numberOfBends: 13,
    flowChannelWidth: 20,
    controlChannelWidth: 21,
    channelWidth: 22,
    channelRadius: 23,
    gap: 24,
    oilInputWidth: 25,
    waterInputWidth: 26,
    outputWidth: 27,
    outputLength: 28,
    orificeSize: 29,
    orificeLength: 30,
    leafPitch: 35,
    leafSpace: 35,
    stageLength: 36,
    stageSpace: 36,
    spacing: 37,
    valveWidthX: 40,
    valveWidthY: 41,
    valveWidth: 42,
    width: 43,
    length: 44,
    valveRadius: 45,
    bendSpacing: 50,
    bendLength: 51,
    edgeBend: 52,
    edgeBend1: 53,
    edgeBend2: 54,
    portRadius: 60,
    height: 61,
    radius: 62,
    rotation: 80,
    mirrorByX: 81,
    mirrorByY: 82,
    componentSpacing: 900,
    connectionSpacing: 901
};

function rankOf(name: string): number {
    if (Object.prototype.hasOwnProperty.call(PARAMETER_RANK, name)) {
        return PARAMETER_RANK[name];
    }
    return 100;
}

export function sortParameterNames(names: string[]): string[] {
    return [...names].sort((a, b) => {
        const ra = rankOf(a);
        const rb = rankOf(b);
        if (ra !== rb) {
            return ra - rb;
        }
        return a.localeCompare(b);
    });
}

export function sortParamSpec<T extends { name?: string }>(spec: T[]): T[] {
    return [...spec].sort((a, b) => {
        const an = String(a && a.name ? a.name : "");
        const bn = String(b && b.name ? b.name : "");
        const ra = rankOf(an);
        const rb = rankOf(bn);
        if (ra !== rb) {
            return ra - rb;
        }
        return an.localeCompare(bn);
    });
}
