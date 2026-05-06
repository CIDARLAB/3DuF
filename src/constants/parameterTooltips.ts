/**
 * English tooltips for heritable parameters in the settings (PropertyBlock) table.
 * Lookup order: feature-specific map (by sidebar title / MINT) → common keys → generic fallback.
 */

const COMMON: Record<string, string> = {
    crossSection:
        "Channel profile for Connection routes: 0 = rectangular cross-section with square (flat) ends in the layout view; 1 = rounded profile with semicircular ends (stadium outline), consistent with a circular channel cross-section.",
    channelWidth: "In-plane width of the microfluidic channel (perpendicular to flow in the top view).",
    height: "Vertical depth (z-span) of the feature on the active layer, used for 3D export and layer offsets.",
    connectionSpacing: "Minimum spacing kept between separate connection routes when autorouting or editing.",
    channelRadius: "Radius of a circular channel cross-section; the tool keeps width and depth consistent with this radius.",
    bendSpacing: "Distance between consecutive bends in a serpentine or curved path.",
    numberOfBends: "Count of 180° bends in the mixer or channel path.",
    bendLength: "Straight segment length used for each bend region.",
    rotation: "Rotation angle of the placed feature in the layout plane.",
    position: "Placement anchor position of the component or feature.",
    length: "Overall length along the dominant axis of the geometry.",
    width: "Overall width of the geometry in the layout plane.",
    depth: "Depth or thickness of the structure where applicable.",
    radius: "Corner or fillet radius for rounded geometry.",
    diameter: "Diameter of circular ports, chambers, or pillars.",
    spacing: "Uniform spacing between repeated elements in an array.",
    valveRadius: "Radius of the circular valve membrane or actuation region.",
    flowChannelWidth: "Width of the primary fluidic channel on the flow layer.",
    controlChannelWidth: "Width of the pneumatic control channel on the control layer.",
    chamberLength: "Length of the reaction or trapping chamber.",
    chamberWidth: "Width of the reaction or trapping chamber.",
    inletLength: "Length of the inlet channel segment before the main body.",
    outletLength: "Length of the outlet channel segment after the main body.",
    portRadius: "Radius of a circular port opening.",
    numberOfCells: "Number of trapping cells or chambers in the array.",
    cellWidth: "Width of a single cell trap or compartment.",
    cellHeight: "Height of a single cell trap or compartment.",
    pillarDiameter: "Diameter of filter or mixer pillars.",
    filterLength: "Length of the porous filter region along flow.",
    levelNumber: "Number of stacked filter or routing levels.",
    valvespacing: "Center-to-center spacing between adjacent valves.",
    numberOfLeafs: "Number of outlet branches in a tree or mux.",
    leafs: "Number of branches (legacy parameter name) in a distribution tree.",
    oilInputWidth: "Width of the oil inlet arm in droplet generators.",
    waterInputWidth: "Width of the aqueous inlet arm in droplet generators.",
    orificeLength: "Length of the nozzle orifice where droplets pinch off.",
    outputLength: "Length of the outlet channel after the nozzle.",
    nozzleLength: "Length of the injection nozzle in picoinjector or merger layouts.",
    injectorLength: "Length of the side injection channel.",
    dropletWidth: "Target droplet diameter or width in droplet circuits.",
    chemostatLength: "Characteristic length of the chemostat ring segment.",
    chemostatChannelWidth: "Channel width inside the chemostat ring.",
    gradientSpacing: "Spacing between parallel branches in a gradient generator.",
    numberOfSteps: "Number of dilution or mixing steps in a gradient network.",
    valveWidth: "Width of a rectangular valve seat or channel under the membrane.",
    valveLength: "Length of the valve channel segment.",
    pumpRadius: "Radius of the pump chamber or rotor feature.",
    pumpSpacing: "Spacing between pump stages or chambers.",
    membraneThickness: "Thickness of the deformable membrane in valve models.",
    text: "Text label rendered on the device layout.",
    fontSize: "Font size for rendered text labels.",
    xspan: "Horizontal span of the device or bounding region.",
    yspan: "Vertical span of the device or bounding region.",
    borderWidth: "Width of the device border outline.",
    borderColor: "Color key or index used for the device border."
};

const BY_FEATURE: Record<string, Record<string, string>> = {
    Connection: {
        connectionSpacing: "Minimum clearance enforced between separate connection paths on the canvas.",
        channelWidth: "Drawn width of the routed connection segment in the plane of the flow layer.",
        height: "Extruded depth used when exporting or stacking this connection geometry.",
        channelRadius: "For a round cross-section profile, half of the effective channel width; width and depth follow this radius."
    },
    "ALIGNMENT MARKS": {
        width: "Width of the alignment mark pattern.",
        height: "Height of the alignment mark pattern."
    }
};

function fallback(param: string): string {
    return `Controls the “${param}” parameter for this feature. Adjust the slider or numeric field to tune geometry or layout.`;
}

export function getParameterTooltip(featureTitle: string, paramName: string): string {
    const title = (featureTitle || "").trim();
    const p = paramName;
    const perFeature = BY_FEATURE[title];
    if (perFeature && perFeature[p]) {
        return perFeature[p];
    }
    if (COMMON[p]) {
        return COMMON[p];
    }
    const upperTitle = title.toUpperCase();
    for (const key of Object.keys(BY_FEATURE)) {
        if (key.toUpperCase() === upperTitle && BY_FEATURE[key][p]) {
            return BY_FEATURE[key][p];
        }
    }
    return fallback(p);
}
