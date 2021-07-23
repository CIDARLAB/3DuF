const GradientGenSpec = [
    {
        name: "bendSpacing",
        min: 10,
        max: 6000,
        step: 10,
        units: "µm",
        value: 1230
    },
    {
        name: "bendLength",
        min: 0,
        max: 12000,
        step: 20,
        units: "µm",
        value: 2460
    },
    {
        name: "channelWidth",
        min: 10,
        max: 2000,
        step: 10,
        units: "µm",
        value: 800
    },
    {
        name: "in",
        min: 1,
        max: 20,
        step: 1,
        units: "",
        value: 1
    },
    {
        name: "numberOfBends",
        min: 1,
        max: 10,
        step: 1,
        units: "bends",
        value: 1
    },
    {
        name: "orientation",
        min: 0,
        max: 0,
        step: 0.01,
        units: "µm",
        value: "true"
    },
    {
        name: "out",
        min: 3,
        max: 100,
        step: 1,
        units: "",
        value: 3
    },
    {
        name: "rotation",
        min: 0,
        max: 360,
        step: 1,
        units: "°",
        value: 0
    },
    {
        name: "spacing",
        min: 10000,
        max: 90000,
        step: 10,
        units: "µm",
        value: 250
    }
];

export default GradientGenSpec;
