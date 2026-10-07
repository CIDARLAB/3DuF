/**
 * English tooltips for heritable parameters in the settings (PropertyBlock) table.
 * Lookup order: feature-specific map (by sidebar title / MINT) → common keys → generic fallback.
 */

const COMMON: Record<string, string> = {
    crossSection:
        "Channel type for Connection routes: 0 = rectangular cross-section with square (flat) ends in the layout view; 1 = rounded type with semicircular ends (stadium outline), consistent with a circular channel cross-section. JSON keeps this key; MINT writes RoundedChannel=1/0.",
    channelWidth: "In-plane width of the microfluidic channel (perpendicular to flow in the top view).",
    depth: "Etch / extrusion depth (z) for this feature on its layer. One depth per component/layer. For region-specific z, export DXF and refine in Fusion 360.",
    height: "Legacy alias for depth (etch / extrusion z). Prefer depth.",
    connectionSpacing: "Minimum spacing kept between separate connection routes when autorouting or editing.",
    componentSpacing: "Keepout halo around the component body (µm). Place-and-route keeps other components and channel bodies outside this band. Users and DIY components may override the default.",
    channelRadius: "Radius of a circular channel cross-section; the tool keeps width and etch depth consistent with this radius.",
    bendSpacing: "Distance between consecutive bends in a serpentine or curved path.",
    numberOfBends: "Count of 180° bends in the mixer or channel path.",
    bendLength: "Straight segment length used for each full mixer bend.",
    edgeBend1: "Length of the incomplete tip stub past mixer port 1 (outward from the port). Independent of edgeBend2. Set to half the connecting channel width so the tip wraps that pipe.",
    edgeBend2: "Length of the incomplete tip stub past mixer port 2 (outward from the port). Independent of edgeBend1. Set to half the connecting channel width so the tip wraps that pipe.",
    rotation: "Rotation angle of the placed feature in the layout plane.",
    position: "Placement anchor position of the component or feature.",
    length: "Overall length along the dominant axis. On a MUX this is the valve pad (use valveWidthY). On CHANNEL this is a minimum route length. On old 3DuF device JSON, length was canvas height (now y-span).",
    width: "Overall width of the geometry in the layout plane.",
    radius: "Corner or fillet radius for rounded geometry.",
    diameter: "Diameter of circular ports, chambers, or pillars.",
    spacing: "BANK instance spacing, or a pump/chamber pitch. MUX/TREE/YTREE use leafSpace.",
    leafPitch: "Legacy MUX leaf spacing; use leafSpace.",
    leafSpace: "Leaf spacing of MUX, TREE, and YTREE. This sets how far apart adjacent leaves sit. Independent of BANK spacing.",
    stageLength: "Legacy along-tree stage spacing; use stageSpace.",
    stageSpace: "Along-tree spacing of successive MUX/TREE/YTREE flow stages.",
    valveRadius: "Radius of the circular valve membrane or actuation region.",
    gap: "Flow-gap slit through a VALVE3D membrane (perpendicular to the host channel).",
    valveGap: "Flow-gap slit through each MUX3D / TRANSPOSER valve membrane.",
    flowChannelWidth: "Width of the primary fluidic channel on the flow layer.",
    controlChannelWidth: "Width of the pneumatic control channel on the control layer.",
    chamberLength: "Length of the reaction or trapping chamber.",
    chamberWidth: "Width of the reaction or trapping chamber.",
    inletLength: "Length of the inlet channel segment before the main body.",
    outletLength: "Length of an outlet channel. On MUX3D this is the full vertical length of each straight leaf/outlet channel.",
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
    valveWidth: "Width of a rectangular valve pad or seat in the layout plane.",
    valveWidthX: "Left-right size of the MUX valve pad.",
    valveWidthY: "Up-down size of the MUX valve pad.",
    valveLength: "Length of the valve channel segment.",
    pumpRadius: "Radius of the pump chamber or rotor feature.",
    pumpSpacing: "Spacing between pump stages or chambers.",
    membraneThickness: "Thickness of the deformable membrane in valve models.",
    text: "Text label rendered on the device layout.",
    fontSize: "Font size for rendered text labels.",
    xspan: "Horizontal span of the device or bounding region.",
    yspan: "Vertical span of the device or bounding region.",
    borderWidth: "Width of the device border outline.",
    borderColor: "Color key or index used for the device border.",
    ID: "Netlist identifier from the imported JSON (component or connection id). Use this to find the same object in the Parchmint file."
};

const BY_FEATURE: Record<string, Record<string, string>> = {
    Connection: {
        connectionSpacing: "Minimum clearance enforced between separate connection paths on the canvas.",
        channelWidth: "Drawn width of the routed connection segment in the plane of the flow layer.",
        depth: "Etch / extrusion depth for this connection on its layer. One depth per feature; refine local z in Fusion 360 after DXF export if needed.",
        height: "Legacy alias for depth on connections.",
        channelRadius: "For a rounded channel type, half of the effective channel width; width and etch depth follow this radius."
    },
    "ALIGNMENT MARKS": {
        width: "Width of the alignment mark pattern.",
        depth: "Etch / extrusion depth of the alignment mark pattern."
    },
    MUX: {
        leafPitch: "Legacy MUX leaf spacing; use leafSpace.",
        leafSpace: "Distance between adjacent MUX leaf ports. Edit this to widen or tighten the tree.",
        valveWidthX: "Left-right size of each control valve pad. Increase this to stretch the valve horizontally.",
        valveWidthY: "Up-down size of each control valve pad. Increase this to stretch the valve vertically.",
        valveWidth: "Legacy single valve width; use valveWidthX.",
        width: "Legacy left-right valve size; use valveWidthX.",
        length: "Legacy up-down valve size; use valveWidthY.",
        stageLength: "Legacy MUX/TREE stage spacing; use stageSpace.",
        stageSpace: "Along-tree spacing of successive flow stages."
    },
    MUX3D: {
        leafSpace: "Horizontal pitch between adjacent MUX3D leaf/outlet channels.",
        outletLength: "Full vertical length of each straight MUX3D outlet channel. Valves on the same channel use the MUX 0.3/0.7 stage split.",
        stageSpace: "Legacy vertical pitch (outletLength ≈ N × stageSpace). Prefer outletLength.",
        flowChannelWidth: "Width of the MUX3D flow-layer channels.",
        controlChannelWidth: "Width of the MUX3D control-layer buses.",
        valveGap: "Flow slit through each 3D valve membrane on the flow layer.",
        gap: "Legacy alias for valveGap.",
        channelWidth: "Legacy alias for flowChannelWidth.",
        valveRadius: "Radius of each 3D valve membrane."
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
