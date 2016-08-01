let render3D = {
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
    Tree: {
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
        featurePrimitiveSet: "Basic3D",
    },
};

module.exports = render3D;