// / <reference lib="webworker" />
import { D3SimulatorEngine, D3SimulatorEngineEventType } from '../../engine/d3-simulator-engine';
import { WorkerInputType } from './message/worker-input';
import { WorkerOutputType } from './message/worker-output';
const simulator = new D3SimulatorEngine();
const emitToMain = (message) => {
    // @ts-ignore Web worker postMessage is a global function
    postMessage(message);
};
simulator.on(D3SimulatorEngineEventType.TICK, (data) => {
    emitToMain({ type: WorkerOutputType.NodeDragged, data });
});
simulator.on(D3SimulatorEngineEventType.END, (data) => {
    emitToMain({ type: WorkerOutputType.NodeDragEnded, data });
});
simulator.on(D3SimulatorEngineEventType.STABILIZATION_STARTED, () => {
    emitToMain({ type: WorkerOutputType.StabilizationStarted });
});
simulator.on(D3SimulatorEngineEventType.STABILIZATION_PROGRESS, (data) => {
    emitToMain({ type: WorkerOutputType.StabilizationProgress, data });
});
simulator.on(D3SimulatorEngineEventType.STABILIZATION_ENDED, (data) => {
    emitToMain({ type: WorkerOutputType.StabilizationEnded, data });
});
simulator.on(D3SimulatorEngineEventType.NODE_DRAGGED, (data) => {
    // Notify the client that the node position changed.
    // This is otherwise handled by the simulation tick if physics is enabled.
    emitToMain({ type: WorkerOutputType.NodeDragged, data });
});
simulator.on(D3SimulatorEngineEventType.SETTINGS_UPDATED, (data) => {
    emitToMain({ type: WorkerOutputType.SettingsUpdated, data });
});
addEventListener('message', ({ data }) => {
    switch (data.type) {
        case WorkerInputType.ActivateSimulation: {
            simulator.activateSimulation();
            break;
        }
        case WorkerInputType.SetData: {
            simulator.setData(data.data);
            break;
        }
        case WorkerInputType.AddData: {
            simulator.addData(data.data);
            break;
        }
        case WorkerInputType.UpdateData: {
            simulator.updateData(data.data);
            break;
        }
        case WorkerInputType.ClearData: {
            simulator.clearData();
            break;
        }
        case WorkerInputType.Simulate: {
            simulator.simulate();
            break;
        }
        case WorkerInputType.StartSimulation: {
            simulator.startSimulation(data.data);
            break;
        }
        case WorkerInputType.UpdateSimulation: {
            simulator.updateSimulation(data.data);
            break;
        }
        case WorkerInputType.StopSimulation: {
            simulator.stopSimulation();
            break;
        }
        case WorkerInputType.StartDragNode: {
            simulator.startDragNode();
            break;
        }
        case WorkerInputType.DragNode: {
            simulator.dragNode(data.data);
            break;
        }
        case WorkerInputType.FixNodes: {
            simulator.fixNodes(data.data.nodes);
            break;
        }
        case WorkerInputType.ReleaseNodes: {
            simulator.releaseNodes(data.data.nodes);
            break;
        }
        case WorkerInputType.EndDragNode: {
            simulator.endDragNode(data.data);
            break;
        }
        case WorkerInputType.SetSettings: {
            simulator.setSettings(data.data);
            break;
        }
    }
});
//# sourceMappingURL=process.worker.js.map