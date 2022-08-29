import { NodeFactory } from './node';
import { EdgeFactory } from './edge';
import { ImageHandler } from '../services/images';
import { getEdgeOffsets } from './topology';
export class Graph {
    constructor(data, settings) {
        var _a, _b;
        this._nodeById = {};
        this._edgeById = {};
        const nodes = (_a = data === null || data === void 0 ? void 0 : data.nodes) !== null && _a !== void 0 ? _a : [];
        const edges = (_b = data === null || data === void 0 ? void 0 : data.edges) !== null && _b !== void 0 ? _b : [];
        this.setup({ nodes, edges });
        this._onLoadedImages = settings === null || settings === void 0 ? void 0 : settings.onLoadedImages;
    }
    /**
     * Returns a list of nodes.
     *
     * @param {INodeFilter} filterBy Filter function for nodes
     * @return {INode[]} List of nodes
     */
    getNodes(filterBy) {
        const nodes = Object.values(this._nodeById);
        if (!filterBy) {
            return nodes;
        }
        const filteredNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            if (filterBy(nodes[i])) {
                filteredNodes.push(nodes[i]);
            }
        }
        return filteredNodes;
    }
    /**
     * Returns a list of edges.
     *
     * @param {IEdgeFilter} filterBy Filter function for edges
     * @return {IEdge[]} List of edges
     */
    getEdges(filterBy) {
        const edges = Object.values(this._edgeById);
        if (!filterBy) {
            return edges;
        }
        const filteredEdges = [];
        for (let i = 0; i < edges.length; i++) {
            if (filterBy(edges[i])) {
                filteredEdges.push(edges[i]);
            }
        }
        return filteredEdges;
    }
    /**
     * Returns the total node count.
     *
     * @return {number} Total node count
     */
    getNodeCount() {
        return Object.keys(this._nodeById).length;
    }
    /**
     * Returns the total edge count.
     *
     * @return {number} Total edge count
     */
    getEdgeCount() {
        return Object.keys(this._edgeById).length;
    }
    /**
     * Returns node by node id.
     *
     * @param {any} id Node id
     * @return {Node | undefined} Node or undefined
     */
    getNodeById(id) {
        return this._nodeById[id];
    }
    /**
     * Returns edge by edge id.
     *
     * @param {any} id Edge id
     * @return {IEdge | undefined} Edge or undefined
     */
    getEdgeById(id) {
        return this._edgeById[id];
    }
    /**
     * Returns a list of current node positions (x, y).
     *
     * @return {INodePosition[]} List of node positions
     */
    getNodePositions() {
        const nodes = this.getNodes();
        const positions = new Array(nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            positions[i] = nodes[i].position;
        }
        return positions;
    }
    /**
     * Sets new node positions (x, y).
     *
     * @param {INodePosition} positions Node positions
     */
    setNodePositions(positions) {
        for (let i = 0; i < positions.length; i++) {
            const node = this._nodeById[positions[i].id];
            if (node) {
                node.position = positions[i];
            }
        }
    }
    /**
     * Returns a list of current edge positions. Edge positions do not have
     * (x, y) but a link to the source and target node ids.
     *
     * @return {IEdgePosition[]} List of edge positions
     */
    getEdgePositions() {
        const edges = this.getEdges();
        const positions = new Array(edges.length);
        for (let i = 0; i < edges.length; i++) {
            positions[i] = edges[i].position;
        }
        return positions;
    }
    /**
     * Sets default style to new nodes and edges. The applied style will be used
     * for all future nodes and edges added with `.merge` function.
     *
     * @param {IGraphStyle} style Style definition
     */
    setDefaultStyle(style) {
        var _a, _b;
        this._defaultStyle = style;
        const styleImageUrls = new Set();
        const nodes = this.getNodes();
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].hasProperties()) {
                continue;
            }
            const properties = (_a = style.getNodeStyle) === null || _a === void 0 ? void 0 : _a.call(style, nodes[i]);
            if (properties) {
                nodes[i].properties = properties;
                // TODO Add these checks to node property setup
                if (properties.imageUrl) {
                    styleImageUrls.add(properties.imageUrl);
                }
                if (properties.imageUrlSelected) {
                    styleImageUrls.add(properties.imageUrlSelected);
                }
            }
        }
        const edges = this.getEdges();
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].hasProperties()) {
                continue;
            }
            const properties = (_b = style.getEdgeStyle) === null || _b === void 0 ? void 0 : _b.call(style, edges[i]);
            if (properties) {
                edges[i].properties = properties;
            }
        }
        if (styleImageUrls.size) {
            ImageHandler.getInstance().loadImages(Array.from(styleImageUrls), () => {
                var _a;
                (_a = this._onLoadedImages) === null || _a === void 0 ? void 0 : _a.call(this);
            });
        }
    }
    setup(data) {
        var _a, _b;
        this._nodeById = {};
        this._edgeById = {};
        const nodes = (_a = data === null || data === void 0 ? void 0 : data.nodes) !== null && _a !== void 0 ? _a : [];
        const edges = (_b = data === null || data === void 0 ? void 0 : data.edges) !== null && _b !== void 0 ? _b : [];
        this._insertNodes(nodes);
        this._insertEdges(edges);
        this._applyEdgeOffsets();
        this._applyStyle();
    }
    clearPositions() {
        const nodes = this.getNodes();
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].clearPosition();
        }
    }
    merge(data) {
        var _a, _b;
        const nodes = (_a = data.nodes) !== null && _a !== void 0 ? _a : [];
        const edges = (_b = data.edges) !== null && _b !== void 0 ? _b : [];
        this._upsertNodes(nodes);
        this._upsertEdges(edges);
        this._applyEdgeOffsets();
        this._applyStyle();
    }
    remove(data) {
        var _a, _b;
        const nodeIds = (_a = data.nodeIds) !== null && _a !== void 0 ? _a : [];
        const edgeIds = (_b = data.edgeIds) !== null && _b !== void 0 ? _b : [];
        this._removeNodes(nodeIds);
        this._removeEdges(edgeIds);
        this._applyEdgeOffsets();
        // this._applyStyle();
    }
    isEqual(graph) {
        if (this.getNodeCount() !== graph.getNodeCount()) {
            return false;
        }
        if (this.getEdgeCount() !== graph.getEdgeCount()) {
            return false;
        }
        const nodes = this.getNodes();
        for (let i = 0; i < nodes.length; i++) {
            if (!graph.getNodeById(nodes[i].id)) {
                return false;
            }
        }
        const edges = this.getEdges();
        for (let i = 0; i < edges.length; i++) {
            if (!graph.getEdgeById(edges[i].id)) {
                return false;
            }
        }
        return true;
    }
    getBoundingBox() {
        const nodes = this.getNodes();
        const minPoint = { x: 0, y: 0 };
        const maxPoint = { x: 0, y: 0 };
        for (let i = 0; i < nodes.length; i++) {
            const { x, y } = nodes[i].getCenter();
            if (x === undefined || y === undefined) {
                continue;
            }
            const size = nodes[i].getBorderedRadius();
            if (i === 0) {
                minPoint.x = x - size;
                maxPoint.x = x + size;
                minPoint.y = y - size;
                maxPoint.y = y + size;
                continue;
            }
            if (x + size > maxPoint.x) {
                maxPoint.x = x + size;
            }
            if (x - size < minPoint.x) {
                minPoint.x = x - size;
            }
            if (y + size > maxPoint.y) {
                maxPoint.y = y + size;
            }
            if (y - size < minPoint.y) {
                minPoint.y = y - size;
            }
        }
        return {
            x: minPoint.x,
            y: minPoint.y,
            width: Math.abs(maxPoint.x - minPoint.x),
            height: Math.abs(maxPoint.y - minPoint.y),
        };
    }
    getNearestNode(point) {
        // Reverse is needed to check from the top drawn to the bottom drawn node
        const nodes = this.getNodes();
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].includesPoint(point)) {
                return nodes[i];
            }
        }
    }
    getNearestEdge(point, minDistance = 3) {
        let nearestEdge;
        let nearestDistance = minDistance;
        const edges = this.getEdges();
        for (let i = 0; i < edges.length; i++) {
            const distance = edges[i].getDistance(point);
            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestEdge = edges[i];
            }
        }
        return nearestEdge;
    }
    _insertNodes(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            const node = NodeFactory.create({ data: nodes[i] });
            this._nodeById[node.id] = node;
        }
    }
    _insertEdges(edges) {
        for (let i = 0; i < edges.length; i++) {
            const startNode = this.getNodeById(edges[i].start);
            const endNode = this.getNodeById(edges[i].end);
            if (startNode && endNode) {
                const edge = EdgeFactory.create({
                    data: edges[i],
                    startNode,
                    endNode,
                });
                this._edgeById[edge.id] = edge;
            }
        }
    }
    _upsertNodes(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            const existingNode = this.getNodeById(nodes[i].id);
            if (existingNode) {
                existingNode.data = nodes[i];
                continue;
            }
            const node = NodeFactory.create({ data: nodes[i] });
            this._nodeById[node.id] = node;
        }
    }
    _upsertEdges(edges) {
        for (let i = 0; i < edges.length; i++) {
            const newEdgeData = edges[i];
            const existingEdge = this.getEdgeById(newEdgeData.id);
            // New edge
            if (!existingEdge) {
                const startNode = this.getNodeById(newEdgeData.start);
                const endNode = this.getNodeById(newEdgeData.end);
                if (startNode && endNode) {
                    const edge = EdgeFactory.create({
                        data: newEdgeData,
                        startNode,
                        endNode,
                    });
                    this._edgeById[edge.id] = edge;
                }
                continue;
            }
            // The connection of the edge stays the same, but the data has changed
            if (existingEdge.start === newEdgeData.start && existingEdge.end === newEdgeData.end) {
                existingEdge.data = newEdgeData;
                continue;
            }
            // Edge connection (start or end node) has changed
            existingEdge.startNode.removeEdge(existingEdge);
            existingEdge.endNode.removeEdge(existingEdge);
            delete this._edgeById[existingEdge.id];
            const startNode = this.getNodeById(newEdgeData.start);
            const endNode = this.getNodeById(newEdgeData.end);
            if (startNode && endNode) {
                const edge = EdgeFactory.create({
                    data: newEdgeData,
                    offset: existingEdge.offset,
                    startNode,
                    endNode,
                });
                edge.state = existingEdge.state;
                edge.properties = existingEdge.properties;
                this._edgeById[existingEdge.id] = edge;
            }
        }
    }
    _removeNodes(nodeIds) {
        for (let i = 0; i < nodeIds.length; i++) {
            const node = this.getNodeById(nodeIds[i]);
            if (!node) {
                continue;
            }
            const edges = node.getEdges();
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                edge.startNode.removeEdge(edge);
                edge.endNode.removeEdge(edge);
                delete this._edgeById[edge.id];
            }
            delete this._nodeById[node.id];
        }
    }
    _removeEdges(edgeIds) {
        for (let i = 0; i < edgeIds.length; i++) {
            const edge = this.getEdgeById(edgeIds[i]);
            if (!edge) {
                continue;
            }
            edge.startNode.removeEdge(edge);
            edge.endNode.removeEdge(edge);
            delete this._edgeById[edge.id];
        }
    }
    _applyEdgeOffsets() {
        const graphEdges = this.getEdges();
        const edgeOffsets = getEdgeOffsets(graphEdges);
        for (let i = 0; i < edgeOffsets.length; i++) {
            const edge = graphEdges[i];
            const edgeOffset = edgeOffsets[i];
            this._edgeById[edge.id] = EdgeFactory.copy(edge, { offset: edgeOffset });
        }
    }
    _applyStyle() {
        var _a, _b;
        if ((_a = this._defaultStyle) === null || _a === void 0 ? void 0 : _a.getNodeStyle) {
            const newNodes = this.getNodes();
            for (let i = 0; i < newNodes.length; i++) {
                if (newNodes[i].hasProperties()) {
                    continue;
                }
                const properties = this._defaultStyle.getNodeStyle(newNodes[i]);
                if (properties) {
                    newNodes[i].properties = properties;
                }
            }
        }
        if ((_b = this._defaultStyle) === null || _b === void 0 ? void 0 : _b.getEdgeStyle) {
            const newEdges = this.getEdges();
            for (let i = 0; i < newEdges.length; i++) {
                if (newEdges[i].hasProperties()) {
                    continue;
                }
                const properties = this._defaultStyle.getEdgeStyle(newEdges[i]);
                if (properties) {
                    newEdges[i].properties = properties;
                }
            }
        }
    }
}
//# sourceMappingURL=graph.js.map