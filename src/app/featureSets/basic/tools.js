let tools = {
    Via: {
        toolParams: {
            position: "position",
        },
        placementTool: "PositionTool"
    },
    Port: {
        toolParams: {
            position: "position",
        },
        placementTool: "PositionTool"
    },
    CircleValve: {
        toolParams: {
            position: "position",
        },
        placementTool: "PositionTool"
    },
    Channel: {
        toolParams: {
            start: "start",
            end: "end"
        },
        placementTool: "DragTool"
    },
    Chamber: {
        toolParams: {
            start: "start",
            end: "end"
        },
        placementTool: "DragTool"
    }
};

module.exports = tools;