const Mix3DSpec = [
    {
        name: "channelWidth",
        min: 10,
        max: 2000,
        step: 10,
        units: "µm",
        value: 800
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
        name: "bendSpacing",
        min: 10,
        max: 6000,
        step: 10,
        units: "µm",
        value: 1230
    },
    {
        name: "height",
        min: 10,
        max: 1200,
        step: 10,
        units: "µm",
        value: 250
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
        units: "",
        value: "true"
    }
];

export default Mix3DSpec;
