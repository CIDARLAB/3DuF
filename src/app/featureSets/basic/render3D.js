export const render3D = {
    Via: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Port: {
        featureParams: {
            position: "position",
            radius1: "portRadius",
            radius2: "portRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Node: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    CircleValve: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    RectValve: {
        featureParams: {
            position: "position",
            width: "width",
            length: "length",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "EdgedBoxFeature"
    },
    AlignmentMarks: {
        featureParams: {
            position: "position",
            width: "width",
            length: "length",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "EdgedBoxFeature"
    },
    AlignmentMarks_control: {
        featureParams: {
            position: "position",
            width: "width",
            length: "length",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "EdgedBoxFeature"
    },
    Valve3D: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Valve3D_control: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Pump: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Pump_control: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Pump3D: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Pump3D_control: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Transposer: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height",
            valveSpacing: "valveSpacing"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Transposer_control: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height",
            valveSpacing: "valveSpacing"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    RotaryMixer: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    RotaryMixer_control: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Channel: {
        featureParams: {
            start: "start",
            end: "end",
            width: "channelWidth",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "TwoPointRoundedLineFeature"
    },
    Connection: {
        featureParams: {
            start: "start",
            end: "end",
            width: "channelWidth",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "TwoPointRoundedLineFeature"
    },
    RoundedChannel: {
        featureParams: {
            start: "start",
            end: "end",
            width: "channelWidth",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "TwoPointRoundedLineFeature"
    },
    Transition: {
        featureParams: {
            position: "position",
            radius1: "cw1",
            radius2: "cw2",
            length: "length",
            orientation: "orientation",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Chamber: {
        featureParams: {
            start: "start",
            end: "end",
            borderWidth: "borderWidth",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "TwoPointRoundedBoxFeature"
    },
    DiamondReactionChamber: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            channelWidth: "channelWidth",
            radius1: "length",
            radius2: "width",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Valve: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    BetterMixer: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    CurvedMixer: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Mixer: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    GradientGenerator: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height",
            rotation: "rotation"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Tree: {
        featureParams: {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            leafs: "leafs",
            height: "height",
            radius1: "width",
            radius2: "length"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    YTree: {
        featureParams: {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            leafs: "leafs",
            height: "height",
            radius1: "width",
            radius2: "length"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    Mux: {
        featureParams: {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            length: "length",
            leafs: "leafs",
            height: "height",
            radius1: "width",
            radius2: "length"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    Mux_control: {
        featureParams: {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            length: "length",
            leafs: "leafs",
            height: "height",
            radius1: "width",
            radius2: "length"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    CellTrapL: {
        featureParams: {
            position: "position",
            chamberLength: "chamberLength",
            feedingChannelWidth: "feedingChannelWidth",
            orientation: "orientation",
            chamberWidth: "chamberWidth",
            numberOfChambers: "numberOfChambers",
            chamberSpacing: "chamberSpacing",
            radius1: "chamberSpacing",
            radius2: "chamberSpacing",
            height: "height"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    CellTrapL_cell: {
        featureParams: {
            position: "position",
            chamberLength: "chamberLength",
            feedingChannelWidth: "feedingChannelWidth",
            orientation: "orientation",
            chamberWidth: "chamberWidth",
            numberOfChambers: "numberOfChambers",
            chamberSpacing: "chamberSpacing",
            radius1: "chamberSpacing",
            radius2: "chamberSpacing",
            height: "height"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    DropletGen: {
        featureParams: {
            position: "position",
            orificeSize: "orificeSize",
            radius1: "orificeSize",
            radius2: "orificeSize",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    TEXT: {
        featureParams: {
            position: "position",
            orificeSize: "orificeSize",
            radius1: "orificeSize",
            radius2: "orificeSize",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },

    //new
    Filter: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },

    CellTrapS: {
        featureParams: {
            position: "position",
            chamberLength: "chamberLength",
            feedingChannelWidth: "feedingChannelWidth",
            orientation: "orientation",
            chamberWidth: "chamberWidth",
            numberOfChambers: "numberOfChambers",
            chamberSpacing: "chamberSpacing",
            radius1: "chamberSpacing",
            radius2: "chamberSpacing",
            height: "height"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    CellTrapS_cell: {
        featureParams: {
            position: "position",
            chamberLength: "chamberLength",
            feedingChannelWidth: "feedingChannelWidth",
            orientation: "orientation",
            chamberWidth: "chamberWidth",
            numberOfChambers: "numberOfChambers",
            chamberSpacing: "chamberSpacing",
            radius1: "chamberSpacing",
            radius2: "chamberSpacing",
            height: "height"
        },
        featurePrimitive: "ConeFeature",
        featurePrimitiveSet: "Basic3D"
    },
    ThreeDMux: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height",
            valveSpacing: "valveSpacing"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    ThreeDMux_control: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            height: "height",
            valveSpacing: "valveSpacing"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Incubation: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Merger: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    PicoInjection: {
        featureParams: {
            position: "position",
            injectorWidth: "injectorWidth",
            dropletWidth: "dropletWidth",
            nozzleWidth: "nozzleWidth",
            nozzleLength: "nozzleLength",
            electrodeDistance: "electrodeDistance",
            electrodeWidth: "electrodeWidth",
            orientation: "orientation"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Sorter: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    Splitter: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
    CapacitanceSensor: {
        featureParams: {
            position: "position",
            radius1: "channelWidth",
            radius2: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            height: "height"
        },
        featurePrimitiveSet: "Basic3D",
        featurePrimitive: "ConeFeature"
    },
};
