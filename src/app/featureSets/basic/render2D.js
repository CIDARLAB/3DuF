let render2D = {
    Via: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2"
        },
        targetParams: {
            radius1: "radius1",
            radius2: "radius2"
        },
        featurePrimitiveSet: "Basic2D",
        featurePrimitiveType: "GradientCircle",
        targetPrimitiveType: "CircleTarget",
        targetPrimitiveSet: "Basic2D"
    },
    Port: {
        featureParams: {
            position: "position",
            radius1: "portRadius",
            radius2: "portRadius"
        },
        targetParams: {
            radius1: "portRadius",
            radius2: "portRadius"
        },
        featurePrimitiveSet: "Basic2D",
        featurePrimitiveType: "GradientCircle",
        targetPrimitiveType: "CircleTarget",
        targetPrimitiveSet: "Basic2D"
    },
    Node: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2"
        },
        targetParams: {
            radius1: "radius1",
            radius2: "radius2"
        },
        featurePrimitiveSet: "Basic2D",
        featurePrimitiveType: "GradientCircle",
        targetPrimitiveType: "CircleTarget",
        targetPrimitiveSet: "Basic2D"
    },
    CircleValve: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2"
        },
        targetParams: {
            radius1: "radius1",
            radius2: "radius2"
        },
        featurePrimitiveSet: "Basic2D",
        featurePrimitiveType: "GradientCircle",
        targetPrimitiveType: "CircleTarget",
        targetPrimitiveSet: "Basic2D"
    },
    Valve3D: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap"
        },
        targetParams: {
            radius1: "valveRadius",
            radius2: "valveRadius"
        },
        featurePrimitiveSet: "Basic2D",
        featurePrimitiveType: "GroverValve",
        targetPrimitiveType: "CircleTarget",
        targetPrimitiveSet: "Basic2D"
    },
    Channel: {
        featureParams: {
            start: "start",
            end: "end",
            width: "channelWidth"
        },
        targetParams: {
            diameter: "channelWidth"
        },
        featurePrimitiveType: "EdgedRectLine",
        featurePrimitiveSet: "Basic2D",
        targetPrimitiveType: "CircleTarget",
        targetPrimitiveSet: "Basic2D"
    },
    Chamber: {
        featureParams: {
            start: "start",
            end: "end",
            borderWidth: "borderWidth"
        },
        targetParams: {
            diameter: "borderWidth"
        },
        featurePrimitiveSet: "Basic2D",
        featurePrimitiveType: "RoundedRect",
        targetPrimitiveSet: "Basic2D",
        targetPrimitiveType: "CircleTarget"
    },
    DiamondReactionChamber: {
        featureParams: {
            position: "position",
            orientation: "orientation",
            channelWidth: "channelWidth",
            length: "length",
            width: "width"
        },
        targetParams: {
            channelWidth: "channelWidth",
            length: "length",
            width: "width",
            orientation: "orientation"
        },
        featurePrimitiveSet: "Basic2D",
        featurePrimitiveType: "Diamond",
        targetPrimitiveType: "DiamondTarget",
        targetPrimitiveSet: "Basic2D"
    },
    Mixer: {
        featureParams: {
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength"
        },
        targetParams: {
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength"
        },
        featurePrimitiveType: "Mixer",
        featurePrimitiveSet: "Basic2D",
        targetPrimitiveType: "MixerTarget",
        targetPrimitiveSet: "Basic2D"
    },
    Tree: {
        featureParams: {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            length: "length",
            leafs: "leafs",
            radius1: "width",
            radius2: "length"
        },
        targetParams: {
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            length: "length",
            leafs: "leafs",
            radius1: "width",
            radius2: "length"
        },
        featurePrimitiveType: "EdgedRect",
        featurePrimitiveSet: "Basic2D",
        targetPrimitiveType: "CircleTarget",
        targetPrimitiveSet: "Basic2D"
    },
};

module.exports = render2D;