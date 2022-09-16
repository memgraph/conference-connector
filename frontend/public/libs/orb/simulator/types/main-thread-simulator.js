import { D3SimulatorEngine, D3SimulatorEngineEventType, } from '../engine/d3-simulator-engine';
export class MainThreadSimulator {
    constructor(events) {
        this.simulator = new D3SimulatorEngine();
        this.simulator.on(D3SimulatorEngineEventType.TICK, (data) => {
            var _a;
            (_a = events.onNodeDrag) === null || _a === void 0 ? void 0 : _a.call(events, data);
        });
        this.simulator.on(D3SimulatorEngineEventType.END, (data) => {
            var _a;
            (_a = events.onNodeDragEnd) === null || _a === void 0 ? void 0 : _a.call(events, data);
        });
        this.simulator.on(D3SimulatorEngineEventType.STABILIZATION_STARTED, () => {
            var _a;
            (_a = events.onStabilizationStart) === null || _a === void 0 ? void 0 : _a.call(events);
        });
        this.simulator.on(D3SimulatorEngineEventType.STABILIZATION_PROGRESS, (data) => {
            var _a;
            (_a = events.onStabilizationProgress) === null || _a === void 0 ? void 0 : _a.call(events, data);
        });
        this.simulator.on(D3SimulatorEngineEventType.STABILIZATION_ENDED, (data) => {
            var _a;
            (_a = events.onStabilizationEnd) === null || _a === void 0 ? void 0 : _a.call(events, data);
        });
        this.simulator.on(D3SimulatorEngineEventType.NODE_DRAGGED, (data) => {
            var _a;
            (_a = events.onNodeDrag) === null || _a === void 0 ? void 0 : _a.call(events, data);
        });
        this.simulator.on(D3SimulatorEngineEventType.SETTINGS_UPDATED, (data) => {
            var _a;
            (_a = events.onSettingsUpdate) === null || _a === void 0 ? void 0 : _a.call(events, data);
        });
    }
    setData(nodes, edges) {
        this.simulator.setData({ nodes, edges });
    }
    addData(nodes, edges) {
        this.simulator.addData({ nodes, edges });
    }
    updateData(nodes, edges) {
        this.simulator.updateData({ nodes, edges });
    }
    clearData() {
        this.simulator.clearData();
    }
    simulate() {
        this.simulator.simulate();
    }
    activateSimulation() {
        this.simulator.activateSimulation();
    }
    startSimulation(nodes, edges) {
        this.simulator.startSimulation({ nodes, edges });
    }
    updateSimulation(nodes, edges) {
        this.simulator.updateSimulation({ nodes, edges });
    }
    stopSimulation() {
        this.simulator.stopSimulation();
    }
    startDragNode() {
        this.simulator.startDragNode();
    }
    dragNode(nodeId, position) {
        this.simulator.dragNode(Object.assign({ id: nodeId }, position));
    }
    endDragNode(nodeId) {
        this.simulator.endDragNode({ id: nodeId });
    }
    fixNodes(nodes) {
        this.simulator.fixNodes(nodes);
    }
    releaseNodes(nodes) {
        this.simulator.releaseNodes(nodes);
    }
    setSettings(settings) {
        this.simulator.setSettings(settings);
    }
    terminate() {
        // Do nothing
    }
}
//# sourceMappingURL=main-thread-simulator.js.map