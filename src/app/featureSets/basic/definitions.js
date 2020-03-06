export const basicFeatures = {
    Channel: {
        unique: {
            start: "Point",
            end: "Point"
        },
        heritable: {
            channelWidth: "Float",
            height: "Float"
        },
        units: {
            channelWidth: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            channelWidth: 0.8 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            channelWidth: 3,
            height: 10
        },
        maximum: {
            channelWidth: 2000,
            height: 1200
        }
    },
    Connection: {
        unique: {
            start: "Point",
            end: "Point",
            wayPoints: "PointArray",
            segments: "SegmentArray"
        },
        heritable: {
            channelWidth: "Float",
            height: "Float"
        },
        units: {
            channelWidth: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            channelWidth: 0.8 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            channelWidth: 3,
            height: 10
        },
        maximum: {
            channelWidth: 2000,
            height: 1200
        }
    },
    RoundedChannel: {
        unique: {
            start: "Point",
            end: "Point"
        },
        heritable: {
            channelWidth: "Float",
            height: "Float"
        },
        units: {
            channelWidth: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            channelWidth: 0.8 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            channelWidth: 3,
            height: 10
        },
        maximum: {
            channelWidth: 2000,
            height: 1200
        }
    },
    Transition: {
        unique: {
            position: "Point"
        },
        heritable: {
            cw1: "Float",
            cw2: "Float",
            length: "Float",
            orientation: "String",
            height: "Float"
        },
        units: {
            cw1: "&mu;m",
            cw2: "&mu;m",
            length: "&mu;m",
            orientation: "",
            height: "&mu;m"
        },
        defaults: {
            cw1: 0.8 * 1000,
            cw2: 0.9 * 1000,
            length: 1.0 * 1000,
            orientation: "V",
            height: 0.1 * 1000
        },
        minimum: {
            cw1: 3,
            cw2: 3,
            length: 10,
            height: 10
        },
        maximum: {
            cw1: 2000,
            cw2: 2000,
            length: 1200,
            height: 1200
        }
    },
    Chamber: {
        unique: {
            position: "Point"
        },
        heritable: {
            width: "Float",
            length: "Float",
            height: "Float",
            cornerRadius: "Float",
            rotation: "Float"
        },
        units: {
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m",
            cornerRadius: "&mu;m",
            rotation: "&deg;"
        },
        defaults: {
            width: 5000,
            length: 5000,
            height: 100,
            cornerRadius: 200,
            rotation: 0
        },
        minimum: {
            width: 5,
            length: 5,
            height: 1,
            cornerRadius: 1,
            rotation: 0
        },
        maximum: {
            width: 50000,
            length: 50000,
            height: 50000,
            cornerRadius: 1000,
            rotation: 90
        }
    },
    Node: {
        unique: {
            position: "Point"
        },
        heritable: {
            radius1: "Float",
            radius2: "Float",
            height: "Float",
            width: "Float",
            length: "Float"
        },
        units: {
            radius1: "Float",
            radius2: "Float",
            height: "Float",
            width: "Float",
            length: "Float"
        },
        defaults: {
            radius1: 0,
            radius2: 0,
            width: 0,
            length: 0,
            height: 0
        },
        minimum: {
            radius1: 0,
            radius2: 0,
            height: 10
        },
        maximum: {
            radius1: 200,
            radius2: 200,
            height: 1200
        }
    },
    CircleValve: {
        unique: {
            position: "Point"
        },
        heritable: {
            radius1: "Float",
            radius2: "Float",
            height: "Float"
        },
        units: {
            radius1: "&mu;m",
            radius2: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            radius1: 1.4 * 1000,
            radius2: 1.2 * 1000,
            height: 0.8 * 1000
        },
        minimum: {
            radius1: 10,
            radius2: 10,
            height: 10
        },
        maximum: {
            radius1: 2000,
            radius2: 2000,
            height: 1200
        }
    },
    RectValve: {
        unique: {
            position: "Point"
        },
        heritable: {
            width: "Float",
            length: "Float",
            height: "Float",
            rotation: "Float"
        },
        units: {
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m",
            rotation: "&deg;"
        },
        defaults: {
            width: 1.4 * 1000,
            length: 1.2 * 1000,
            height: 0.8 * 1000,
            rotation: 0
        },
        minimum: {
            width: 10,
            length: 10,
            height: 10,
            rotation: 0
        },
        maximum: {
            width: 2000,
            length: 2000,
            height: 1200,
            rotation: 180
        }
    },
    AlignmentMarks: {
        unique: {
            position: "Point"
        },
        heritable: {
            width: "Float",
            length: "Float",
            height: "Float"
        },
        units: {
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            width: 4000,
            length: 4000,
            height: 200
        },
        minimum: {
            width: 10,
            length: 10,
            height: 10
        },
        maximum: {
            width: 200000,
            length: 200000,
            height: 1200
        }
    },
    AlignmentMarks_control: {
        unique: {
            position: "Point"
        },
        heritable: {
            width: "Float",
            length: "Float",
            height: "Float"
        },
        units: {
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            width: 4000,
            length: 4000,
            height: 200
        },
        minimum: {
            width: 10,
            length: 10,
            height: 10
        },
        maximum: {
            width: 200000,
            length: 200000,
            height: 1200
        }
    },
    Valve3D: {
        unique: {
            position: "Point"
        },
        heritable: {
            orientation: "String",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            width: "Float",
            length: "Float",
            rotation: "Float"
        },
        units: {
            orientation: "",
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            width: "&mu;m",
            length: "&mu;m",
            rotation: "&deg;"
        },
        defaults: {
            orientation: "V",
            valveRadius: 1.2 * 1000,
            height: 0.8 * 1000,
            gap: 0.6 * 1000,
            width: 2.4 * 1000,
            length: 2.4 * 1000,
            rotation: 0
        },
        minimum: {
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            rotation: 0
        },
        maximum: {
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            rotation: 180
        }
    },
    Valve3D_control: {
        unique: {
            position: "Point"
        },
        heritable: {
            orientation: "String",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            width: "Float",
            length: "Float",
            rotation: "Float"
        },
        units: {
            orientation: "",
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            width: "&mu;m",
            length: "&mu;m",
            rotation: "&deg;"
        },
        defaults: {
            orientation: "V",
            valveRadius: 1.2 * 1000,
            height: 0.8 * 1000,
            gap: 0.6 * 1000,
            width: 2.4 * 1000,
            length: 2.4 * 1000,
            rotation: 0
        },
        minimum: {
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            rotation: 0
        },
        maximum: {
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            rotation: 180
        }
    },
    Transposer: {
        unique: {
            position: "Point"
        },
        heritable: {
            orientation: "String",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            valveSpacing: "Float",
            channelWidth: "Float"
        },
        units: {
            orientation: "",
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            valveSpacing: "&mu;m",
            channelWidth: "&mu;m"
        },
        defaults: {
            orientation: "V",
            valveRadius: 1.2 * 1000,
            height: 0.8 * 1000,
            gap: 0.6 * 1000,
            valveSpacing: 0.6 * 1000,
            channelWidth: 500
        },
        minimum: {
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            valveSpacing: 0.1 * 1000,
            channelWidth: 25
        },
        maximum: {
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            valveSpacing: 0.1 * 10000,
            channelWidth: 25e3
        }
    },
    Transposer_control: {
        unique: {
            position: "Point"
        },
        heritable: {
            orientation: "String",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            valveSpacing: "Float",
            channelWidth: "Float"
        },
        units: {
            orientation: "",
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            valveSpacing: "&mu;m",
            channelWidth: "&mu;m"
        },
        defaults: {
            orientation: "V",
            valveRadius: 1.2 * 1000,
            height: 0.8 * 1000,
            gap: 0.6 * 1000,
            valveSpacing: 0.6 * 1000,
            channelWidth: 500
        },
        minimum: {
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            valveSpacing: 0.1 * 1000,
            channelWidth: 25
        },
        maximum: {
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            valveSpacing: 0.1 * 10000,
            channelWidth: 25e3
        }
    },
    RotaryMixer: {
        unique: {
            position: "Point"
        },
        heritable: {
            orientation: "String",
            radius: "Float",
            flowChannelWidth: "Float",
            valveWidth: "Float",
            valveLength: "Float",
            valveSpacing: "Float",
            height: "Float"
        },
        units: {
            orientation: "",
            radius: "&mu;m",
            flowChannelWidth: "&mu;m",
            valveWidth: "&mu;m",
            valveLength: "&mu;m",
            valveSpacing: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            orientation: "V",
            radius: 2000,
            flowChannelWidth: 1000,
            valveWidth: 2.4 * 1000,
            valveLength: 2.4 * 1000,
            valveSpacing: 300,
            valveRadius: 1.2 * 1000,
            height: 200
        },
        minimum: {
            //  "orientation": "V",
            radius: 0.1 * 5000,
            flowChannelWidth: 0.1 * 1000,
            valveWidth: 0.1 * 2.4 * 1000,
            valveLength: 0.1 * 2.4 * 1000,
            valveSpacing: 0.1 * 300,
            valveRadius: 0.1 * 1.2 * 1000,
            height: 0.1 * 200
        },
        maximum: {
            radius: 10 * 5000,
            flowChannelWidth: 10 * 1000,
            valveWidth: 10 * 2.4 * 1000,
            valveLength: 10 * 2.4 * 1000,
            valveSpacing: 10 * 300,
            valveRadius: 10 * 1.2 * 1000,
            height: 10 * 200
        }
    },
    RotaryMixer_control: {
        unique: {
            position: "Point"
        },
        heritable: {
            orientation: "String",
            radius: "Float",
            flowChannelWidth: "Float",
            valveWidth: "Float",
            valveLength: "Float",
            valveSpacing: "Float",
            height: "Float"
        },
        defaults: {
            orientation: "V",
            radius: 2000,
            flowChannelWidth: 1000,
            valveWidth: 2.4 * 1000,
            valveLength: 2.4 * 1000,
            valveSpacing: 300,
            valveRadius: 1.2 * 1000,
            height: 200
        },
        minimum: {
            //  "orientation": "V",
            radius: 0.1 * 5000,
            flowChannelWidth: 0.1 * 1000,
            valveWidth: 0.1 * 2.4 * 1000,
            valveLength: 0.1 * 2.4 * 1000,
            valveSpacing: 0.1 * 300,
            valveRadius: 0.1 * 1.2 * 1000,
            height: 0.1 * 200
        },
        maximum: {
            radius: 10 * 5000,
            flowChannelWidth: 10 * 1000,
            valveWidth: 10 * 2.4 * 1000,
            valveLength: 10 * 2.4 * 1000,
            valveSpacing: 10 * 300,
            valveRadius: 10 * 1.2 * 1000,
            height: 10 * 200
        }
    },
    Valve: {
        unique: {
            position: "Point"
        },
        heritable: {
            rotation: "Float",
            length: "Float",
            width: "Float",
            height: "Float"
        },
        units: {
            rotation: "&deg",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            rotation: 0,
            width: 1.23 * 1000,
            length: 4.92 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            rotation: 0,
            width: 30,
            length: 120,
            height: 10
        },
        maximum: {
            rotation: 180,
            width: 6000,
            length: 24 * 1000,
            height: 1200
        }
    },
    Pump: {
        unique: {
            position: "Point"
        },
        heritable: {
            rotation: "Float",
            length: "Float",
            width: "Float",
            height: "Float",
            spacing: "Float",
            flowChannelWidth: "Float"
        },
        units: {
            rotation: "&deg",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m",
            spacing: "&mu;m",
            flowChannelWidth: "&mu;m"
        },
        defaults: {
            rotation: 0,
            width: 600,
            length: 300,
            height: 0.1 * 1000,
            spacing: 1000,
            flowChannelWidth: 300
        },
        minimum: {
            rotation: 0,
            width: 30,
            length: 120,
            height: 10,
            spacing: 10,
            flowChannelWidth: 1
        },
        maximum: {
            rotation: 180,
            width: 6000,
            length: 24 * 1000,
            height: 1200,
            spacing: 10000,
            flowChannelWidth: 10000
        }
    },

    Pump_control: {
        unique: {
            position: "Point"
        },
        heritable: {
            rotation: "Float",
            length: "Float",
            width: "Float",
            height: "Float",
            spacing: "Float",
            flowChannelWidth: "Float"
        },
        units: {
            rotation: "&deg",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m",
            spacing: "&mu;m",
            flowChannelWidth: "&mu;m"
        },
        defaults: {
            rotation: 0,
            width: 600,
            length: 300,
            height: 0.1 * 1000,
            spacing: 1000,
            flowChannelWidth: 300
        },
        minimum: {
            rotation: 0,
            width: 30,
            length: 120,
            height: 10,
            spacing: 10,
            flowChannelWidth: 1
        },
        maximum: {
            rotation: 180,
            width: 6000,
            length: 24 * 1000,
            height: 1200,
            spacing: 10000,
            flowChannelWidth: 10000
        }
    },

    Pump3D: {
        unique: {
            position: "Point"
        },
        heritable: {
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            rotation: "Float",
            spacing: "Float",
            flowChannelWidth: "Float"
        },
        units: {
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            width: "&mu;m",
            length: "&mu;m",
            rotation: "&deg;",
            spacing: "&mu;m",
            flowChannelWidth: "&mu;m"
        },
        defaults: {
            valveRadius: 1.2 * 1000,
            height: 0.8 * 1000,
            gap: 0.6 * 1000,
            width: 2.4 * 1000,
            length: 2.4 * 1000,
            rotation: 90,
            spacing: 5000,
            flowChannelWidth: 300
        },
        minimum: {
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            rotation: 0,
            spacing: 10,
            flowChannelWidth: 1
        },
        maximum: {
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            rotation: 180,
            spacing: 10000,
            flowChannelWidth: 10000
        }
    },

    Pump3D_control: {
        unique: {
            position: "Point"
        },
        heritable: {
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            rotation: "Float",
            spacing: "Float",
            flowChannelWidth: "Float"
        },
        units: {
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            width: "&mu;m",
            length: "&mu;m",
            rotation: "&deg;",
            spacing: "&mu;m",
            flowChannelWidth: "&mu;m"
        },
        defaults: {
            valveRadius: 1.2 * 1000,
            height: 0.8 * 1000,
            gap: 0.6 * 1000,
            width: 2.4 * 1000,
            length: 2.4 * 1000,
            rotation: 0,
            spacing: 1000,
            flowChannelWidth: 300
        },
        minimum: {
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            rotation: 0,
            spacing: 10,
            flowChannelWidth: 1
        },
        maximum: {
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            rotation: 180,
            spacing: 10000,
            flowChannelWidth: 10000
        }
    },

    Via: {
        unique: {
            position: "Point"
        },
        heritable: {
            radius1: "Float",
            radius2: "Float",
            height: "Float"
        },
        units: {
            radius1: "&mu;m",
            radius2: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            radius1: 0.8 * 1000,
            radius2: 0.7 * 1000,
            height: 1.1 * 1000
        },
        minimum: {
            radius1: 10,
            radius2: 10,
            height: 10
        },
        maximum: {
            radius1: 2000,
            radius2: 2000,
            height: 1200
        }
    },
    Port: {
        unique: {
            position: "Point"
        },
        heritable: {
            portRadius: "Float",
            height: "Float"
        },
        units: {
            portRadius: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            portRadius: 0.7 * 1000,
            // "radius2": .7 * 1000,
            height: 1.1 * 1000
        },
        minimum: {
            portRadius: 0.8 * 10,
            //   "radius2": 10,
            height: 10
        },
        maximum: {
            portRadius: 2000,
            //    "radius2": 2000,
            height: 1200
        }
    },
    DiamondReactionChamber: {
        unique: {
            position: "Point"
        },
        heritable: {
            orientation: "String",
            channelWidth: "Float",
            length: "Float",
            width: "Float",
            height: "Float"
        },
        units: {
            orientation: "",
            channelWidth: "&mu;m",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            orientation: "V",
            channelWidth: 0.8 * 1000,
            width: 1.23 * 1000,
            length: 4.92 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            channelWidth: 10,
            width: 30,
            length: 120,
            height: 10
        },
        maximum: {
            channelWidth: 2000,
            width: 6000,
            length: 24 * 1000,
            height: 1200
        }
    },
    BetterMixer: {
        unique: {
            position: "Point"
        },
        heritable: {
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            orientation: "String",
            height: "Float"
        },
        units: {
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            height: "&mu;m"
        },
        defaults: {
            channelWidth: 0.8 * 1000,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            orientation: "V",
            bendLength: 2.46 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            orientation: "H",
            bendLength: 10,
            height: 10
        },
        maximum: {
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            orientation: "H",
            bendLength: 12 * 1000,
            height: 1200
        }
    },
    CurvedMixer: {
        unique: {
            position: "Point"
        },
        heritable: {
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            orientation: "String",
            height: "Float"
        },
        units: {
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            height: "&mu;m"
        },
        defaults: {
            channelWidth: 0.8 * 1000,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            orientation: "V",
            bendLength: 2.46 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            orientation: "H",
            bendLength: 10,
            height: 10
        },
        maximum: {
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            orientation: "H",
            bendLength: 12 * 1000,
            height: 1200
        }
    },
    Mixer: {
        unique: {
            position: "Point"
        },
        heritable: {
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            orientation: "String",
            height: "Float"
        },
        units: {
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            height: "&mu;m"
        },
        defaults: {
            channelWidth: 0.8 * 1000,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            orientation: "V",
            bendLength: 2.46 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            orientation: "H",
            bendLength: 10,
            height: 10
        },
        maximum: {
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            orientation: "H",
            bendLength: 12 * 1000,
            height: 1200
        }
    },
    GradientGenerator: {
        unique: {
            position: "Point"
        },
        heritable: {
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            in: "Float",
            out: "Float",
            spacing: "Float",
            height: "Float",
            rotation: "Float"
        },
        units: {
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            in: "",
            out: "",
            spacing: "&mu;m",
            height: "&mu;m",
            rotation: "&deg;"
        },
        defaults: {
            channelWidth: 0.8 * 1000,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            orientation: "V",
            bendLength: 2.46 * 1000,
            in: 1,
            out: 3,
            spacing: 10000,
            height: 0.1 * 1000,
            rotation: 0
        },
        minimum: {
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            orientation: "H",
            bendLength: 10,
            in: 1,
            out: 3,
            spacing: 10,
            height: 10,
            rotation: 0
        },
        maximum: {
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            orientation: "H",
            bendLength: 12 * 1000,
            in: 30,
            out: 90,
            spacing: 90000,
            height: 1200,
            rotation: 360
        }
    },
    Tree: {
        unique: {
            position: "Point"
        },
        heritable: {
            flowChannelWidth: "Float",
            orientation: "String",
            spacing: "Float",
            leafs: "Float",
            width: "Float",
            height: "Float",
            direction: "String",
            stageLength: "Float"
        },
        units: {
            flowChannelWidth: "&mu;m",
            orientation: "",
            spacing: "&mu;m",
            leafs: "",
            width: "&mu;m",
            height: "&mu;m",
            direction: "",
            stageLength: "&mu;m"
        },
        defaults: {
            flowChannelWidth: 0.8 * 1000,
            orientation: "V",
            spacing: 4 * 1000,
            leafs: 8,
            width: 2.46 * 1000,
            height: 0.1 * 1000,
            direction: "IN",
            stageLength: 4000
        },
        minimum: {
            flowChannelWidth: 10,
            spacing: 30,
            leafs: 2,
            width: 60,
            height: 10,
            stageLength: 100
        },
        maximum: {
            flowChannelWidth: 2000,
            spacing: 12000,
            leafs: 2,
            width: 12 * 1000,
            height: 1200,
            stageLength: 6000
        }
    },
    YTree: {
        unique: {
            position: "Point"
        },
        heritable: {
            flowChannelWidth: "Float",
            orientation: "String",
            spacing: "Float",
            leafs: "Float",
            width: "Float",
            height: "Float",
            direction: "String",
            stageLength: "Float"
        },
        units: {
            flowChannelWidth: "&mu;m",
            orientation: "",
            spacing: "&mu;m",
            leafs: "",
            width: "&mu;m",
            height: "&mu;m",
            direction: "",
            stageLength: "&mu;m"
        },
        defaults: {
            flowChannelWidth: 0.8 * 1000,
            orientation: "V",
            spacing: 4 * 1000,
            leafs: 8,
            width: 2.46 * 1000,
            height: 0.1 * 1000,
            direction: "IN",
            stageLength: 4000
        },
        minimum: {
            flowChannelWidth: 10,
            spacing: 30,
            leafs: 2,
            width: 60,
            height: 10,
            stageLength: 100
        },
        maximum: {
            flowChannelWidth: 2000,
            spacing: 12000,
            leafs: 2,
            width: 12 * 1000,
            height: 1200,
            stageLength: 6000
        }
    },
    Mux: {
        unique: {
            position: "Point"
        },
        heritable: {
            flowChannelWidth: "Float",
            orientation: "String",
            spacing: "Float",
            leafs: "Float",
            width: "Float",
            length: "Float",
            height: "Float",
            direction: "String",
            stageLength: "Float",
            controlChannelWidth: "Float"
        },
        units: {
            flowChannelWidth: "&mu;m",
            orientation: "",
            spacing: "&mu;m",
            leafs: "",
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m",
            direction: "",
            stageLength: "&mu;m",
            controlChannelWidth: "&mu;m"
        },
        defaults: {
            flowChannelWidth: 0.8 * 1000,
            orientation: "V",
            spacing: 4 * 1000,
            leafs: 8,
            width: 1.6 * 1000,
            length: 1.6 * 1000,
            height: 0.1 * 1000,
            direction: "IN",
            stageLength: 4000,
            controlChannelWidth: 0.4 * 1000
        },
        minimum: {
            flowChannelWidth: 10,
            spacing: 30,
            leafs: 2,
            width: 60,
            length: 60,
            height: 10,
            stageLength: 100,
            controlChannelWidth: 10
        },
        maximum: {
            flowChannelWidth: 2000,
            spacing: 12000,
            leafs: 2,
            width: 12 * 1000,
            length: 12 * 1000,
            height: 1200,
            stageLength: 6000,
            controlChannelWidth: 2000
        }
    },
    Mux_control: {
        unique: {
            position: "Point"
        },
        heritable: {
            flowChannelWidth: "Float",
            orientation: "String",
            spacing: "Float",
            leafs: "Float",
            width: "Float",
            length: "Float",
            height: "Float",
            direction: "String",
            stageLength: "Float",
            controlChannelWidth: "Float"
        },
        defaults: {
            flowChannelWidth: 0.8 * 1000,
            orientation: "V",
            spacing: 4 * 1000,
            leafs: 8,
            width: 1.6 * 1000,
            length: 1.6 * 1000,
            height: 0.1 * 1000,
            direction: "IN",
            stageLength: 4000,
            controlChannelWidth: 0.4 * 1000
        },
        minimum: {
            flowChannelWidth: 10,
            spacing: 30,
            leafs: 2,
            width: 60,
            length: 60,
            height: 10,
            stageLength: 100,
            controlChannelWidth: 10
        },
        maximum: {
            flowChannelWidth: 2000,
            spacing: 12000,
            leafs: 2,
            width: 12 * 1000,
            length: 12 * 1000,
            height: 1200,
            stageLength: 6000,
            controlChannelWidth: 2000
        }
    },
    CellTrapL: {
        unique: {
            position: "Point"
        },
        heritable: {
            chamberLength: "Float",
            feedingChannelWidth: "Float",
            orientation: "String",
            chamberWidth: "Float",
            numberOfChambers: "Float",
            chamberSpacing: "Float",
            height: "Float"
        },
        units: {
            chamberLength: "&mu;m",
            feedingChannelWidth: "&mu;m",
            orientation: "",
            chamberWidth: "&mu;m",
            numberOfChambers: "",
            chamberSpacing: "&mu;m",
            height: "&mu;m"
        },
        defaults: {
            chamberLength: 1.2 * 1000,
            feedingChannelWidth: 0.41 * 1000,
            orientation: "H",
            chamberWidth: 1.23 * 1000,
            numberOfChambers: 6,
            chamberSpacing: 2.46 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            chamberLength: 30,
            feedingChannelWidth: 10,
            chamberWidth: 30,
            numberOfChambers: 1,
            chamberSpacing: 60,
            height: 10
        },
        maximum: {
            chamberLength: 6000,
            feedingChannelWidth: 2000,
            chamberWidth: 6000,
            numberOfChambers: 10,
            chamberSpacing: 12 * 1000,
            height: 1200
        }
    },
    CellTrapL_cell: {
        unique: {
            position: "Point"
        },
        heritable: {
            chamberLength: "Float",
            feedingChannelWidth: "Float",
            orientation: "String",
            chamberWidth: "Float",
            numberOfChambers: "Float",
            chamberSpacing: "Float",
            height: "Float"
        },
        defaults: {
            chamberLength: 1.2 * 1000,
            feedingChannelWidth: 0.41 * 1000,
            orientation: "H",
            chamberWidth: 1.23 * 1000,
            numberOfChambers: 6,
            chamberSpacing: 2.46 * 1000,
            height: 0.1 * 1000
        },
        minimum: {
            chamberLength: 30,
            feedingChannelWidth: 10,
            chamberWidth: 30,
            numberOfChambers: 1,
            chamberSpacing: 60,
            height: 10
        },
        maximum: {
            chamberLength: 6000,
            feedingChannelWidth: 2000,
            chamberWidth: 6000,
            numberOfChambers: 10,
            chamberSpacing: 12 * 1000,
            height: 1200
        }
    },
    DropletGen: {
        unique: {
            position: "Point"
        },
        heritable: {
            orificeSize: "Float",
            orificeLength: "Float",
            oilInputWidth: "Float",
            waterInputWidth: "Float",
            outputWidth: "Float",
            outputLength: "Float",
            height: "Float",
            rotation: "Float"
        },
        units: {
            orificeSize: "&mu;m",
            height: "&mu;m",
            orificeLength: "&mu;m",
            oilInputWidth: "&mu;m",
            waterInputWidth: "&mu;m",
            outputWidth: "&mu;m",
            outputLength: "&mu;m",
            rotation: "&deg;"
        },
        defaults: {
            orificeSize: 0.2 * 1000,
            orificeLength: 0.4 * 1000,
            oilInputWidth: 0.8 * 1000,
            waterInputWidth: 0.6 * 1000,
            outputWidth: 0.6 * 1000,
            outputLength: 0.6 * 1000,
            height: 0.1 * 1000,
            rotation: 0
        },
        minimum: {
            orificeSize: 10,
            orificeLength: 10,
            oilInputWidth: 10,
            waterInputWidth: 10,
            outputWidth: 10,
            outputLength: 10,
            height: 10,
            rotation: 0
        },
        maximum: {
            orificeSize: 2000,
            orificeLength: 2000,
            oilInputWidth: 2000,
            waterInputWidth: 2000,
            outputWidth: 2000,
            outputLength: 2000,
            height: 1200,
            rotation: 360
        }
    },
    TEXT: {
        unique: {
            position: "Point"
        },
        heritable: {
            height: "Float",
            text: "String"
        }
    }
};
