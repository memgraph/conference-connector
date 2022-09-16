import { WorkerInputType } from './message/worker-input';
import { WorkerOutputType } from './message/worker-output';
export class WebWorkerSimulator {
    constructor(events) {
        this.worker = new Worker(new URL(
        /* webpackChunkName: 'process.worker' */
        './process.worker', import.meta.url));
        this.worker.onmessage = ({ data }) => {
            var _a, _b, _c, _d, _e, _f;
            switch (data.type) {
                case WorkerOutputType.StabilizationStarted: {
                    (_a = events.onStabilizationStart) === null || _a === void 0 ? void 0 : _a.call(events);
                    break;
                }
                case WorkerOutputType.StabilizationProgress: {
                    (_b = events.onStabilizationProgress) === null || _b === void 0 ? void 0 : _b.call(events, data.data);
                    break;
                }
                case WorkerOutputType.StabilizationEnded: {
                    (_c = events.onStabilizationEnd) === null || _c === void 0 ? void 0 : _c.call(events, data.data);
                    break;
                }
                case WorkerOutputType.NodeDragged: {
                    (_d = events.onNodeDrag) === null || _d === void 0 ? void 0 : _d.call(events, data.data);
                    break;
                }
                case WorkerOutputType.NodeDragEnded: {
                    (_e = events.onNodeDragEnd) === null || _e === void 0 ? void 0 : _e.call(events, data.data);
                    break;
                }
                case WorkerOutputType.SettingsUpdated: {
                    (_f = events.onSettingsUpdate) === null || _f === void 0 ? void 0 : _f.call(events, data.data);
                    break;
                }
            }
        };
    }
    setData(nodes, edges) {
        this.emitToWorker({ type: WorkerInputType.SetData, data: { nodes, edges } });
    }
    addData(nodes, edges) {
        this.emitToWorker({ type: WorkerInputType.AddData, data: { nodes, edges } });
    }
    updateData(nodes, edges) {
        this.emitToWorker({ type: WorkerInputType.UpdateData, data: { nodes, edges } });
    }
    clearData() {
        this.emitToWorker({ type: WorkerInputType.ClearData });
    }
    simulate() {
        this.emitToWorker({ type: WorkerInputType.Simulate });
    }
    activateSimulation() {
        this.emitToWorker({ type: WorkerInputType.ActivateSimulation });
    }
    startSimulation(nodes, edges) {
        this.emitToWorker({ type: WorkerInputType.StartSimulation, data: { nodes, edges } });
    }
    updateSimulation(nodes, edges) {
        this.emitToWorker({ type: WorkerInputType.UpdateSimulation, data: { nodes, edges } });
    }
    stopSimulation() {
        this.emitToWorker({ type: WorkerInputType.StopSimulation });
    }
    startDragNode() {
        this.emitToWorker({ type: WorkerInputType.StartDragNode });
    }
    dragNode(nodeId, position) {
        this.emitToWorker({ type: WorkerInputType.DragNode, data: Object.assign({ id: nodeId }, position) });
    }
    endDragNode(nodeId) {
        this.emitToWorker({ type: WorkerInputType.EndDragNode, data: { id: nodeId } });
    }
    fixNodes(nodes) {
        this.emitToWorker({ type: WorkerInputType.FixNodes, data: { nodes } });
    }
    releaseNodes(nodes) {
        this.emitToWorker({ type: WorkerInputType.ReleaseNodes, data: { nodes } });
    }
    setSettings(settings) {
        this.emitToWorker({ type: WorkerInputType.SetSettings, data: settings });
    }
    terminate() {
        this.worker.terminate();
    }
    emitToWorker(message) {
        this.worker.postMessage(message);
    }
}
//# sourceMappingURL=simulator.js.map