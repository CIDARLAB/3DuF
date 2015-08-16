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
    Channel: {
        featureParams: {
            start: "start",
            end: "end",
            width: "width"
        },
        targetParams: {
            diameter: "width"
        },
        featurePrimitiveType: "RoundedRectLine",
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
    }
};

module.exports = render2D;