import { ComponentAPI } from "@/componentAPI";
import Device from "@/app/core/device";
import { InterchangeV1_2 } from "@/app/core/init";
import DXFObject from "@/app/core/dxfObject";
import {
    DxfDeviceModel,
    DxfCircleSeg,
    DxfLineSeg,
    DxfPoint3,
    dxfPointToDeviceUm,
    getMergedChannelSketch,
    mmToUm,
    parseDxfDocument,
    serializeDxfModel,
    umPointDist
} from "./dxfDeviceModel";

const CHANNEL_WIDTH_UM = 1000;
const CHANNEL_HEIGHT_UM = 2000;
const PORT_HEIGHT_UM = 2000;

function generateId(): string {
    return ComponentAPI.generateID();
}

type UmPoint = [number, number];

function buildSegmentsFromWaypoints(wayPoints: UmPoint[]): Array<[UmPoint, UmPoint]> {
    const segments: Array<[UmPoint, UmPoint]> = [];
    for (let i = 0; i < wayPoints.length - 1; i++) {
        segments.push([wayPoints[i], wayPoints[i + 1]]);
    }
    return segments;
}

function dedupeWaypoints(wayPoints: UmPoint[], tolUm = 25): UmPoint[] {
    if (wayPoints.length === 0) return wayPoints;
    const out: UmPoint[] = [wayPoints[0]];
    for (let i = 1; i < wayPoints.length; i++) {
        const prev = out[out.length - 1];
        const cur = wayPoints[i];
        if (umPointDist(prev, cur) > tolUm) {
            out.push(cur);
        }
    }
    return out;
}

function buildChannelGraphUm(
    lines: DxfLineSeg[],
    model: DxfDeviceModel,
    mergeTolUm = 1500
): { graph: Map<number, Set<number>>; nodes: UmPoint[] } {
    const nodes: UmPoint[] = [];
    const weights: number[] = [];
    const graph = new Map<number, Set<number>>();

    const indexOfPoint = (point: UmPoint): number => {
        for (let i = 0; i < nodes.length; i++) {
            if (umPointDist(nodes[i], point) < mergeTolUm) {
                const count = weights[i];
                nodes[i] = [
                    (nodes[i][0] * count + point[0]) / (count + 1),
                    (nodes[i][1] * count + point[1]) / (count + 1)
                ];
                weights[i] = count + 1;
                return i;
            }
        }
        nodes.push(point);
        weights.push(1);
        return nodes.length - 1;
    };

    const link = (a: number, b: number): void => {
        if (a === b) return;
        if (!graph.has(a)) graph.set(a, new Set());
        if (!graph.has(b)) graph.set(b, new Set());
        graph.get(a)!.add(b);
        graph.get(b)!.add(a);
    };

    for (const line of lines) {
        link(indexOfPoint(dxfPointToDeviceUm(line.a, model)), indexOfPoint(dxfPointToDeviceUm(line.b, model)));
    }

    return { graph, nodes };
}

function nearestNodeIndex(point: UmPoint, nodes: UmPoint[]): number {
    let bestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < nodes.length; i++) {
        const d = umPointDist(nodes[i], point);
        if (d < bestDist) {
            bestDist = d;
            bestIndex = i;
        }
    }
    return bestIndex;
}

function selectInteriorWaypointUm(
    graphNode: UmPoint,
    lines: DxfLineSeg[],
    model: DxfDeviceModel,
    searchRadiusUm = 2500
): UmPoint {
    type Candidate = { um: UmPoint; mmY: number; lineCount: number; dist: number };
    const candidates: Candidate[] = [];

    for (const line of lines) {
        for (const endpoint of [line.a, line.b]) {
            const um = dxfPointToDeviceUm(endpoint, model);
            const dist = umPointDist(um, graphNode);
            if (dist > searchRadiusUm) continue;

            let lineCount = 0;
            for (const other of lines) {
                for (const ep of [other.a, other.b]) {
                    if (umPointDist(dxfPointToDeviceUm(ep, model), um) < 500) {
                        lineCount++;
                    }
                }
            }

            if (!candidates.some((c) => umPointDist(c.um, um) < 100)) {
                candidates.push({ um, mmY: endpoint.y, lineCount, dist });
            }
        }
    }

    if (candidates.length === 0) {
        return graphNode;
    }

    candidates.sort((a, b) => {
        if (b.lineCount !== a.lineCount) return b.lineCount - a.lineCount;
        if (b.mmY !== a.mmY) return b.mmY - a.mmY;
        return a.dist - b.dist;
    });
    return candidates[0].um;
}

function inferConnectionsFromGeometry(model: DxfDeviceModel, portCenters: Array<{ id: string; center: DxfPoint3 }>) {
    const channelSketch = getMergedChannelSketch(model);
    const connections: any[] = [];
    if (portCenters.length < 2 || channelSketch.lines.length === 0) return connections;

    const { graph, nodes } = buildChannelGraphUm(channelSketch.lines, model);
    const portCentersUm = portCenters.map((p) => dxfPointToDeviceUm(p.center, model));
    const portNodes = portCentersUm.map((centerUm) => nearestNodeIndex(centerUm, nodes));

    const usedPairs = new Set<string>();

    const ys = portCenters.map((p) => p.center.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const inletPorts = portCenters.filter((p) => p.center.y <= minY + 0.5);
    const outletPorts = portCenters.filter((p) => p.center.y >= maxY - 0.5);
    const portPairs: Array<[number, number]> = [];

    if (inletPorts.length > 0 && outletPorts.length > 0 && inletPorts.length !== portCenters.length) {
        for (let i = 0; i < inletPorts.length; i++) {
            for (let j = 0; j < outletPorts.length; j++) {
                portPairs.push([portCenters.indexOf(inletPorts[i]), portCenters.indexOf(outletPorts[j])]);
            }
        }
    } else {
        for (let i = 0; i < portNodes.length; i++) {
            for (let j = i + 1; j < portNodes.length; j++) {
                portPairs.push([i, j]);
            }
        }
    }

    function findPath(startNode: number, endNode: number): number[] | null {
        const queue: Array<{ node: number; path: number[] }> = [{ node: startNode, path: [startNode] }];
        const visited = new Set<number>([startNode]);
        while (queue.length > 0) {
            const { node, path } = queue.shift()!;
            if (node === endNode) return path;
            for (const next of graph.get(node) || []) {
                if (visited.has(next)) continue;
                visited.add(next);
                queue.push({ node: next, path: [...path, next] });
            }
        }
        return null;
    }

    for (const [i, j] of portPairs) {
        const startNode = portNodes[i];
        const endNode = portNodes[j];
        const pairKey = [startNode, endNode].sort((a, b) => a - b).join("|");
        if (usedPairs.has(pairKey)) continue;
        const pathNodes = findPath(startNode, endNode);
        if (!pathNodes || pathNodes.length < 2) continue;
        usedPairs.add(pairKey);

        const interior = pathNodes
            .slice(1, -1)
            .map((nodeIndex) => selectInteriorWaypointUm(nodes[nodeIndex], channelSketch.lines, model));
        const wayPoints = dedupeWaypoints([portCentersUm[i], ...interior, portCentersUm[j]]);
        const featureId = generateId();
        const connectionId = generateId();

        connections.push({
            featureId,
            connectionId,
            sourceComponentId: portCenters[i].id,
            sinkComponentId: portCenters[j].id,
            wayPoints,
            segments: buildSegmentsFromWaypoints(wayPoints)
        });
    }
    return connections;
}

function entitiesToDxfData(entities: any[]): any[] {
    return entities.map((entity) => new DXFObject(entity).toJSON());
}

export function buildDeviceJsonFromDxf(parsed: any, fileName = "DXF Import"): InterchangeV1_2 {
    const model = parseDxfDocument(parsed, fileName.replace(/\.dxf$/i, ""));
    const channelSketch = getMergedChannelSketch(model);
    const widthUm = mmToUm(model.bounds.maxX - model.bounds.minX);
    const lengthUm = mmToUm(model.bounds.maxY - model.bounds.minY);

    const flowLayerId = generateId();
    const controlLayerId = generateId();
    const integrationLayerId = generateId();
    const renderFlowId = generateId();
    const renderControlId = generateId();
    const renderIntegrationId = generateId();

    const features: any[] = [];
    const components: any[] = [];
    const connections: any[] = [];

    if (model.borderSketch) {
        const borderId = generateId();
        const borderEntities = model.borderSketch.lines.map((line) => ({
            type: "LINE",
            vertices: [
                { x: line.a.x, y: line.a.y, z: line.a.z },
                { x: line.b.x, y: line.b.y, z: line.b.z }
            ],
            layer: line.layer
        }));
        features.push({
            id: borderId,
            name: "Border",
            macro: "EDGE",
            params: {},
            type: "EDGE",
            referenceID: borderId,
            dxfData: entitiesToDxfData(borderEntities),
            layerID: flowLayerId
        });
    }

    const portCenters: Array<{ id: string; center: DxfCircleSeg["center"] }> = [];
    for (const circle of channelSketch.circles) {
        const componentId = generateId();
        const featureId = generateId();
        const centerUm = dxfPointToDeviceUm(circle.center, model);
        const portRadiusUm = mmToUm(circle.radius);
        const topLeftUm: UmPoint = [centerUm[0] - portRadiusUm, centerUm[1] - portRadiusUm];

        components.push({
            id: componentId,
            name: `Port_${portCenters.length + 1}`,
            entity: "PORT",
            params: {
                position: topLeftUm,
                portRadius: portRadiusUm,
                height: PORT_HEIGHT_UM,
                componentSpacing: 1000
            },
            "x-span": portRadiusUm * 2,
            "y-span": portRadiusUm * 2,
            ports: [{ x: 0, y: 0, layer: "FLOW", label: "1" }],
            layers: [flowLayerId]
        });

        features.push({
            id: featureId,
            name: `Port_${portCenters.length + 1}`,
            macro: "Port",
            params: {
                position: centerUm,
                portRadius: portRadiusUm,
                height: PORT_HEIGHT_UM,
                componentSpacing: 1000
            },
            type: "XY",
            referenceID: componentId,
            dxfData: [],
            layerID: flowLayerId
        });

        portCenters.push({ id: componentId, center: circle.center });
    }

    const inferred = inferConnectionsFromGeometry(model, portCenters);
    for (let i = 0; i < inferred.length; i++) {
        const item = inferred[i];
        const connectionFeatureId = item.featureId;
        const connectionId = item.connectionId;
        connections.push({
            id: connectionId,
            name: `CHANNEL_${i + 1}`,
            entity: "CHANNEL",
            source: { component: item.sourceComponentId, port: "1" },
            sinks: [{ component: item.sinkComponentId, port: "1" }],
            paths: [
                {
                    source: { component: item.sourceComponentId, port: "1" },
                    sink: { component: item.sinkComponentId, port: "1" },
                    wayPoints: item.wayPoints,
                    features: []
                }
            ],
            params: {
                start: ["Point", item.wayPoints[0][0], item.wayPoints[0][1]],
                end: item.wayPoints[item.wayPoints.length - 1],
                wayPoints: item.wayPoints,
                segments: item.segments,
                crossSection: 1,
                connectionSpacing: CHANNEL_WIDTH_UM + 600,
                channelWidth: CHANNEL_WIDTH_UM,
                height: CHANNEL_HEIGHT_UM
            },
            layer: flowLayerId
        });

        features.push({
            id: connectionFeatureId,
            name: `CHANNEL_${i + 1}`,
            macro: "Connection",
            params: {
                start: ["Point", item.wayPoints[0][0], item.wayPoints[0][1]],
                end: item.wayPoints[item.wayPoints.length - 1],
                wayPoints: item.wayPoints,
                segments: item.segments,
                crossSection: 1,
                connectionSpacing: CHANNEL_WIDTH_UM + 600,
                channelWidth: CHANNEL_WIDTH_UM,
                height: CHANNEL_HEIGHT_UM
            },
            type: "XY",
            referenceID: connectionId,
            dxfData: [],
            layerID: flowLayerId
        });
    }

    const json: InterchangeV1_2 = {
        name: model.sourceName,
        params: {
            width: widthUm,
            length: lengthUm,
            dxfImport: serializeDxfModel(model)
        },
        layers: [
            {
                id: flowLayerId,
                name: "LayerFlow_1",
                type: "FLOW",
                group: "0",
                params: { z_offset: 0, flip: false },
                features
            },
            {
                id: controlLayerId,
                name: "LayerControl_1",
                type: "CONTROL",
                group: "0",
                params: { z_offset: 0, flip: false },
                features: []
            },
            {
                id: integrationLayerId,
                name: "LayerIntegration_1",
                type: "INTEGRATION",
                group: "0",
                params: { z_offset: 0, flip: false },
                features: []
            }
        ],
        groups: ["0"],
        components,
        connections,
        valves: [],
        version: "1.2",
        renderLayers: [
            {
                id: renderFlowId,
                name: "RenderLayerFlow_1",
                modellayer: flowLayerId,
                type: "FLOW",
                features: features.map((f) => ({ ...f })),
                color: "indigo"
            },
            {
                id: renderControlId,
                name: "RenderLayerControl_1",
                modellayer: controlLayerId,
                type: "CONTROL",
                features: [],
                color: "red"
            },
            {
                id: renderIntegrationId,
                name: "RenderLayerIntegration_1",
                modellayer: integrationLayerId,
                type: "INTEGRATION",
                features: [],
                color: "green"
            }
        ],
        features: []
    };

    return json;
}

export function getDxfModelFromDeviceParams(params: { [key: string]: any } | null | undefined): DxfDeviceModel | null {
    if (!params || !params.dxfImport) return null;
    const data = params.dxfImport;
    if (!data.entities) return null;
    return parseDxfDocument({ entities: data.entities }, data.sourceName || "device");
}

export function getDxfModelFromDevice(device: Device): DxfDeviceModel | null {
    const dxfImport = device.getOptionalParam("dxfImport");
    if (!dxfImport) return null;
    return getDxfModelFromDeviceParams({ dxfImport });
}

export { parseDxfDocument };
