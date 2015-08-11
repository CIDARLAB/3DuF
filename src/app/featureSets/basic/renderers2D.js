let renderers2D = {
    Via: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2"
        },
        targetParams: {
            radius: "radius1"
        },
        featurePrimitive: "GradientCircle",
        targetPrimitive: "CircleTarget"
    },
    Port: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2"
        },
        targetParams: {
            radius: "radius1"
        },
        featurePrimitive: "GradientCircle",
        targetPrimitive: "PaperPrimitives"
    },
    CircleValve: {
        featureParams: {
            position: "position",
            radius1: "radius1",
            radius2: "radius2"
        },
        targetParams: {
            radius: "radius1"
        },
        featurePrimitive: "GradientCircle",
        targetPrimitive: "CircleTarget"
    },
    Channel: {
        featureParams: {
            start: "start",
            end: "end",
            width: "width"
        },
        targetParams: {
            diameter: "width"
        },
        featurePrimitive: "RoundedRectLine",
        targetPrimitive: "CircleTarget"
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
        featurePrimitive: "RoundedRect",
        targetPrimitive: "CircleTarget"
    }
};

module.exports = renderers2D;