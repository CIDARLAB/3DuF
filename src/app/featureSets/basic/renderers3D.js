let renderers3D = {
    Via: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2",
            height: "height"
        },
        featurePrimitive: "ConeFeature"
    },
    Port: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2",
            height: "height"
        },
        featurePrimitive: "ConeFeature"
    },
    CircleValve: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2",
            height: "height"
        },
        featurePrimitive: "ConeFeature"
    },
    Channel: {
        featureParams: {
            start: "start",
            end: "end",
            width: "width",
            height: "height"
        },
        featurePrimitive: "TwoPointRoundedLineFeature",
    },
    Chamber: {
        featureParams: {
            start: "start",
            end: "end",
            borderWidth: "borderWidth",
            height: "height"
        },
        featurePrimitive: "TwoPointRoundedBoxFeature",
    }
};

module.exports = renderers3D;