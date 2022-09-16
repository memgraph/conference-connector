import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, } from 'd3-force';
import { Emitter } from '../../utils/emitter.utils';
import { isObjectEqual, copyObject } from '../../utils/object.utils';
const MANY_BODY_MAX_DISTANCE_TO_LINK_DISTANCE_RATIO = 100;
const DEFAULT_LINK_DISTANCE = 30;
export var D3SimulatorEngineEventType;
(function (D3SimulatorEngineEventType) {
    D3SimulatorEngineEventType["TICK"] = "tick";
    D3SimulatorEngineEventType["END"] = "end";
    D3SimulatorEngineEventType["STABILIZATION_STARTED"] = "stabilizationStarted";
    D3SimulatorEngineEventType["STABILIZATION_PROGRESS"] = "stabilizationProgress";
    D3SimulatorEngineEventType["STABILIZATION_ENDED"] = "stabilizationEnded";
    D3SimulatorEngineEventType["NODE_DRAGGED"] = "nodeDragged";
    D3SimulatorEngineEventType["SETTINGS_UPDATED"] = "settingsUpdated";
})(D3SimulatorEngineEventType || (D3SimulatorEngineEventType = {}));
export const getManyBodyMaxDistance = (linkDistance) => {
    const distance = linkDistance > 0 ? linkDistance : 1;
    return distance * MANY_BODY_MAX_DISTANCE_TO_LINK_DISTANCE_RATIO;
};
export const DEFAULT_SETTINGS = {
    isPhysicsEnabled: false,
    alpha: {
        alpha: 1,
        alphaMin: 0.001,
        alphaDecay: 0.0228,
        alphaTarget: 0.1,
    },
    centering: {
        x: 0,
        y: 0,
        strength: 1,
    },
    collision: {
        radius: 15,
        strength: 1,
        iterations: 1,
    },
    links: {
        distance: DEFAULT_LINK_DISTANCE,
        strength: undefined,
        iterations: 1,
    },
    manyBody: {
        strength: -100,
        theta: 0.9,
        distanceMin: 0,
        distanceMax: getManyBodyMaxDistance(DEFAULT_LINK_DISTANCE),
    },
    positioning: {
        forceX: {
            x: 0,
            strength: 0.1,
        },
        forceY: {
            y: 0,
            strength: 0.1,
        },
    },
};
export class D3SimulatorEngine extends Emitter {
    constructor(settings) {
        super();
        this.edges = [];
        this.nodes = [];
        this.nodeIndexByNodeId = {};
        this.isDragging = false;
        this.isStabilizing = false;
        this.linkForce = forceLink(this.edges).id((node) => node.id);
        this.simulation = forceSimulation(this.nodes).force('link', this.linkForce).stop();
        this.settings = Object.assign(copyObject(DEFAULT_SETTINGS), settings);
        this.initSimulation(this.settings);
        this.simulation.on('tick', () => {
            this.emit(D3SimulatorEngineEventType.TICK, { nodes: this.nodes, edges: this.edges });
        });
        this.simulation.on('end', () => {
            this.isDragging = false;
            this.isStabilizing = false;
            this.emit(D3SimulatorEngineEventType.END, { nodes: this.nodes, edges: this.edges });
        });
    }
    getSettings() {
        return copyObject(this.settings);
    }
    setSettings(settings) {
        const previousSettings = this.getSettings();
        Object.keys(settings).forEach((key) => {
            // @ts-ignore
            this.settings[key] = settings[key];
        });
        if (isObjectEqual(this.settings, previousSettings)) {
            return;
        }
        this.initSimulation(settings);
        this.emit(D3SimulatorEngineEventType.SETTINGS_UPDATED, { settings: this.settings });
    }
    startDragNode() {
        this.isDragging = true;
        if (!this.isStabilizing) {
            this.activateSimulation();
        }
    }
    dragNode(data) {
        const node = this.nodes[this.nodeIndexByNodeId[data.id]];
        if (!node) {
            return;
        }
        if (!this.isDragging) {
            this.startDragNode();
        }
        node.fx = data.x;
        node.fy = data.y;
        if (!this.settings.isPhysicsEnabled) {
            node.x = data.x;
            node.y = data.y;
            // Notify the client that the node position changed.
            // This is otherwise handled by the simulation tick if physics is enabled.
            this.emit(D3SimulatorEngineEventType.NODE_DRAGGED, { nodes: this.nodes, edges: this.edges });
        }
    }
    endDragNode(data) {
        this.isDragging = false;
        this.simulation.alphaTarget(0);
        const node = this.nodes[this.nodeIndexByNodeId[data.id]];
        if (node) {
            releaseNode(node);
        }
    }
    activateSimulation() {
        if (this.settings.isPhysicsEnabled) {
            // Re-heat simulation.
            // This does not count as "stabilization" and won't emit any progress.
            this.simulation.alphaTarget(this.settings.alpha.alphaTarget).restart();
        }
    }
    fixDefinedNodes(data) {
        // Treat nodes that have existing coordinates as "fixed".
        for (let i = 0; i < data.nodes.length; i++) {
            if (data.nodes[i].x !== null && data.nodes[i].x !== undefined) {
                data.nodes[i].fx = data.nodes[i].x;
            }
            if (data.nodes[i].y !== null && data.nodes[i].y !== undefined) {
                data.nodes[i].fy = data.nodes[i].y;
            }
        }
        return data;
    }
    addData(data) {
        data = this.fixDefinedNodes(data);
        this.nodes.concat(data.nodes);
        this.edges.concat(data.edges);
        this.setNodeIndexByNodeId();
    }
    clearData() {
        this.nodes = [];
        this.edges = [];
        this.setNodeIndexByNodeId();
    }
    setData(data) {
        data = this.fixDefinedNodes(data);
        this.clearData();
        this.addData(data);
    }
    updateData(data) {
        data = this.fixDefinedNodes(data);
        // Keep existing nodes along with their (x, y, fx, fy) coordinates to avoid
        // rearranging the graph layout.
        // These nodes should not be reloaded into the array because the D3 simulation
        // will assign to them completely new coordinates, effectively restarting the animation.
        const newNodeIds = new Set(data.nodes.map((node) => node.id));
        // Remove old nodes that aren't present in the new data.
        const oldNodes = this.nodes.filter((node) => newNodeIds.has(node.id));
        const newNodes = data.nodes.filter((node) => this.nodeIndexByNodeId[node.id] === undefined);
        this.nodes = [...oldNodes, ...newNodes];
        this.setNodeIndexByNodeId();
        // Only keep new links and discard all old links.
        // Old links won't work as some discrepancies arise between the D3 index property
        // and Memgraph's `id` property which affects the source->target mapping.
        this.edges = data.edges;
    }
    simulate() {
        // Update simulation with new data.
        this.simulation.nodes(this.nodes);
        this.linkForce.links(this.edges);
        // Run stabilization "physics".
        this.runStabilization();
        if (!this.settings.isPhysicsEnabled) {
            this.fixNodes();
        }
    }
    startSimulation(data) {
        this.setData(data);
        // Update simulation with new data.
        this.simulation.nodes(this.nodes);
        this.linkForce.links(this.edges);
        // Run stabilization "physics".
        this.runStabilization();
    }
    updateSimulation(data) {
        // To avoid rearranging the graph layout during node expand/collapse/hide,
        // it is necessary to keep existing nodes along with their (x, y) coordinates.
        // These nodes should not be reloaded into the array because the D3 simulation
        // will assign to them completely new coordinates, effectively restarting the animation.
        const newNodeIds = new Set(data.nodes.map((node) => node.id));
        // const newNodes = data.nodes.filter((node) => !this.nodeIdentities.has(node.id));
        const newNodes = data.nodes.filter((node) => this.nodeIndexByNodeId[node.id] === undefined);
        const oldNodes = this.nodes.filter((node) => newNodeIds.has(node.id));
        if (!this.settings.isPhysicsEnabled) {
            oldNodes.forEach((node) => fixNode(node));
        }
        // Remove old nodes that aren't present in the new data.
        this.nodes = [...oldNodes, ...newNodes];
        this.setNodeIndexByNodeId();
        // Only keep new links and discard all old links.
        // Old links won't work as some discrepancies arise between the D3 index property
        // and Memgraph's `id` property which affects the source->target mapping.
        this.edges = data.edges;
        // Update simulation with new data.
        this.simulation.nodes(this.nodes);
        this.linkForce.links(this.edges);
        // If there are no new nodes, there is no need for the stabilization
        if (!this.settings.isPhysicsEnabled && !newNodes.length) {
            this.emit(D3SimulatorEngineEventType.STABILIZATION_ENDED, { nodes: this.nodes, edges: this.edges });
            return;
        }
        // Run stabilization "physics".
        this.runStabilization();
    }
    stopSimulation() {
        this.simulation.stop();
        this.nodes = [];
        this.edges = [];
        this.setNodeIndexByNodeId();
        this.simulation.nodes();
        this.linkForce.links();
    }
    initSimulation(settings) {
        var _a, _b, _c, _d;
        if (settings.alpha) {
            this.simulation
                .alpha(settings.alpha.alpha)
                .alphaMin(settings.alpha.alphaMin)
                .alphaDecay(settings.alpha.alphaDecay)
                .alphaTarget(settings.alpha.alphaTarget);
        }
        if (settings.links) {
            this.linkForce.distance(settings.links.distance).iterations(settings.links.iterations);
        }
        if (settings.collision) {
            const collision = forceCollide()
                .radius(settings.collision.radius)
                .strength(settings.collision.strength)
                .iterations(settings.collision.iterations);
            this.simulation.force('collide', collision);
        }
        if (settings.collision === null) {
            this.simulation.force('collide', null);
        }
        if (settings.manyBody) {
            const manyBody = forceManyBody()
                .strength(settings.manyBody.strength)
                .theta(settings.manyBody.theta)
                .distanceMin(settings.manyBody.distanceMin)
                .distanceMax(settings.manyBody.distanceMax);
            this.simulation.force('charge', manyBody);
        }
        if (settings.manyBody === null) {
            this.simulation.force('charge', null);
        }
        if ((_a = settings.positioning) === null || _a === void 0 ? void 0 : _a.forceY) {
            const positioningForceX = forceX(settings.positioning.forceX.x).strength(settings.positioning.forceX.strength);
            this.simulation.force('x', positioningForceX);
        }
        if (((_b = settings.positioning) === null || _b === void 0 ? void 0 : _b.forceX) === null) {
            this.simulation.force('x', null);
        }
        if ((_c = settings.positioning) === null || _c === void 0 ? void 0 : _c.forceY) {
            const positioningForceY = forceY(settings.positioning.forceY.y).strength(settings.positioning.forceY.strength);
            this.simulation.force('y', positioningForceY);
        }
        if (((_d = settings.positioning) === null || _d === void 0 ? void 0 : _d.forceY) === null) {
            this.simulation.force('y', null);
        }
        if (settings.centering) {
            const centering = forceCenter(settings.centering.x, settings.centering.y).strength(settings.centering.strength);
            this.simulation.force('center', centering);
        }
        if (settings.centering === null) {
            this.simulation.force('center', null);
        }
    }
    // This is a blocking action - the user will not be able to interact with the graph
    // during the stabilization process.
    runStabilization() {
        if (this.isStabilizing) {
            return;
        }
        this.emit(D3SimulatorEngineEventType.STABILIZATION_STARTED, undefined);
        this.isStabilizing = true;
        this.simulation.alpha(this.settings.alpha.alpha).alphaTarget(this.settings.alpha.alphaTarget).stop();
        const totalSimulationSteps = Math.ceil(Math.log(this.settings.alpha.alphaMin) / Math.log(1 - this.settings.alpha.alphaDecay));
        let lastProgress = -1;
        for (let i = 0; i < totalSimulationSteps; i++) {
            const currentProgress = Math.round((i * 100) / totalSimulationSteps);
            // Emit progress maximum of 100 times (every percent)
            if (currentProgress > lastProgress) {
                lastProgress = currentProgress;
                this.emit(D3SimulatorEngineEventType.STABILIZATION_PROGRESS, {
                    nodes: this.nodes,
                    edges: this.edges,
                    progress: currentProgress / 100,
                });
            }
            this.simulation.tick();
        }
        this.isStabilizing = false;
        this.emit(D3SimulatorEngineEventType.STABILIZATION_ENDED, { nodes: this.nodes, edges: this.edges });
    }
    setNodeIndexByNodeId() {
        this.nodeIndexByNodeId = {};
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodeIndexByNodeId[this.nodes[i].id] = i;
        }
    }
    fixNodes(nodes) {
        if (!nodes) {
            nodes = this.nodes;
        }
        for (let i = 0; i < nodes.length; i++) {
            fixNode(this.nodes[i]);
        }
    }
    releaseNodes(nodes) {
        if (!nodes) {
            nodes = this.nodes;
        }
        for (let i = 0; i < nodes.length; i++) {
            releaseNode(this.nodes[i]);
        }
    }
}
const fixNode = (node) => {
    // fx and fy fix the node position in the D3 simulation.
    node.fx = node.x;
    node.fy = node.y;
};
const releaseNode = (node) => {
    node.fx = null;
    node.fy = null;
};
//# sourceMappingURL=d3-simulator-engine.js.map