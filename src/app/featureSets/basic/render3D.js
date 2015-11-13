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
    Channel: {
        featureParams: {
            start: "start",
            end: "end",
            width: "width",
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
    }
};

module.exports = render3D;