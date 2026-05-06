/**
 * Short English hints for sidebar component / feature buttons (hover tooltips).
 */
export const MINT_TOOLTIPS: Record<string, string> = {
    "ALIGNMENT MARKS": "Add lithography or layer alignment fiducial marks.",
    MIXER: "Serpentine mixer for diffusive or chaotic mixing.",
    MIXER3D: "Three-dimensional mixer geometry.",
    "TOROIDAL MIXER": "Toroidal (ring-shaped) mixing structure.",
    "GRADIENT GENERATOR": "Network to split and recombine flows for concentration gradients.",
    "CURVED MIXER": "Curved-path mixer for longer residence time.",
    "ROTARY MIXER": "Rotary or annular mixer layout.",
    VALVE3D: "Three-dimensional pneumatic membrane valve.",
    VALVE: "Planar pneumatic valve (control layer).",
    PUMP3D: "3D peristaltic or displacement pump layout.",
    PUMP: "Planar peristaltic pump (control + flow).",
    "LONG CELL TRAP": "Elongated trap for capturing or culturing cells.",
    "SQUARE CELL TRAP": "Square chamber for cell trapping or imaging.",
    "REACTION CHAMBER": "Enclosed volume for on-chip reactions or incubation.",
    "DIAMOND REACTION CHAMBER": "Diamond-shaped reaction chamber.",
    TERRACE: "Stepped terrace structure for droplets or reagents.",
    "LL CHAMBER": "Ladder-like or multi-step chamber layout.",
    FILTER: "Pillar or weir filter for particles or beads.",
    "DOGBONE INSERT": "Dogbone-shaped mechanical test or insert region.",
    "LOGIC ARRAY": "Array of pneumatic logic (AND/OR-style) units.",
    "DROPLET SORTER": "Sort droplets by size or property using bifurcations.",
    PORT: "Fluid inlet/outlet port on the flow layer.",
    VIA: "Vertical interconnect between layers.",
    YTREE: "Y-junction tree to split one stream into many branches.",
    TREE: "Binary or multi-branch fluid distribution tree.",
    MUX: "Multiplexer to route one of many inputs to an output.",
    TRANSPOSER: "Reconfigurable valve array for routing (transposer).",
    MUX3D: "Three-dimensional multiplexer structure.",
    "NOZZLE DROPLET GENERATOR": "Nozzle-based droplet generation (e.g. oil/water).",
    "DROPLET CAPACITANCE SENSOR": "Electrode pair for droplet or fill sensing.",
    "DROPLET MERGER": "Merge two droplet streams into one.",
    PICOINJECTOR: "Inject a small plug into a passing droplet.",
    "DROPLET SPLITTER": "Split droplets at a junction.",
    "DROPLET GENERATOR FLOW FOCUS": "Flow-focusing geometry for droplet formation."
};

export function getMintTooltip(mint: string): string {
    return MINT_TOOLTIPS[mint] || `Place or edit a ${mint} feature on the device.`;
}
