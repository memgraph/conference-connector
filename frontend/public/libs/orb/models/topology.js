export const getEdgeOffsets = (edges) => {
    var _a;
    const edgeOffsets = new Array(edges.length);
    const edgeOffsetsByUniqueKey = getEdgeOffsetsByUniqueKey(edges);
    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        let offset = 0;
        const uniqueKey = getUniqueEdgeKey(edge);
        const edgeOffsetsByKey = edgeOffsetsByUniqueKey[uniqueKey];
        if (edgeOffsetsByKey && edgeOffsetsByKey.length) {
            // Pull the first offset
            offset = (_a = edgeOffsetsByKey.shift()) !== null && _a !== void 0 ? _a : 0;
            const isEdgeReverseDirection = edge.end < edge.start;
            if (isEdgeReverseDirection) {
                offset = -1 * offset;
            }
        }
        edgeOffsets[i] = offset;
    }
    return edgeOffsets;
};
const getUniqueEdgeKey = (edge) => {
    const sid = edge.start;
    const tid = edge.end;
    return sid < tid ? `${sid}-${tid}` : `${tid}-${sid}`;
};
const getEdgeOffsetsByUniqueKey = (edges) => {
    var _a;
    const edgeCountByUniqueKey = {};
    const loopbackUniqueKeys = new Set();
    // Count the number of edges that are between the same nodes
    for (let i = 0; i < edges.length; i++) {
        const uniqueKey = getUniqueEdgeKey(edges[i]);
        if (edges[i].start === edges[i].end) {
            loopbackUniqueKeys.add(uniqueKey);
        }
        edgeCountByUniqueKey[uniqueKey] = ((_a = edgeCountByUniqueKey[uniqueKey]) !== null && _a !== void 0 ? _a : 0) + 1;
    }
    const edgeOffsetsByUniqueKey = {};
    const uniqueKeys = Object.keys(edgeCountByUniqueKey);
    for (let i = 0; i < uniqueKeys.length; i++) {
        const uniqueKey = uniqueKeys[i];
        const edgeCount = edgeCountByUniqueKey[uniqueKey];
        // Loopback offsets should be 1, 2, 3, ...
        if (loopbackUniqueKeys.has(uniqueKey)) {
            edgeOffsetsByUniqueKey[uniqueKey] = Array.from({ length: edgeCount }, (_, i) => i + 1);
            continue;
        }
        if (edgeCount <= 1) {
            continue;
        }
        const edgeOffsets = [];
        // 0 means straight line. There will be a straight line between two nodes
        // when there are 1 edge, 3 edges, 5 edges, ...
        if (edgeCount % 2 !== 0) {
            edgeOffsets.push(0);
        }
        for (let i = 2; i <= edgeCount; i += 2) {
            edgeOffsets.push(i / 2);
            edgeOffsets.push((i / 2) * -1);
        }
        edgeOffsetsByUniqueKey[uniqueKey] = edgeOffsets;
    }
    return edgeOffsetsByUniqueKey;
};
//# sourceMappingURL=topology.js.map