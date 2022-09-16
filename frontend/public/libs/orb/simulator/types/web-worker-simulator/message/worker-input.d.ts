import { IPosition } from '../../../../common/position';
import { ISimulationNode, ISimulationEdge } from '../../../interface';
import { ID3SimulatorEngineSettingsUpdate } from '../../../engine/d3-simulator-engine';
import { IWorkerPayload } from './worker-payload';
export declare enum WorkerInputType {
    SetData = "Set Data",
    AddData = "Add Data",
    UpdateData = "Update Data",
    ClearData = "Clear Data",
    Simulate = "Simulate",
    ActivateSimulation = "Activate Simulation",
    StartSimulation = "Start Simulation",
    UpdateSimulation = "Update Simulation",
    StopSimulation = "Stop Simulation",
    StartDragNode = "Start Drag Node",
    DragNode = "Drag Node",
    EndDragNode = "End Drag Node",
    FixNodes = "Fix Nodes",
    ReleaseNodes = "Release Nodes",
    SetSettings = "Set Settings"
}
declare type IWorkerInputSetDataPayload = IWorkerPayload<WorkerInputType.SetData, {
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
}>;
declare type IWorkerInputAddDataPayload = IWorkerPayload<WorkerInputType.AddData, {
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
}>;
declare type IWorkerInputUpdateDataPayload = IWorkerPayload<WorkerInputType.UpdateData, {
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
}>;
declare type IWorkerInputClearDataPayload = IWorkerPayload<WorkerInputType.ClearData>;
declare type IWorkerInputSimulatePayload = IWorkerPayload<WorkerInputType.Simulate>;
declare type IWorkerInputActivateSimulationPayload = IWorkerPayload<WorkerInputType.ActivateSimulation>;
declare type IWorkerInputStartSimulationPayload = IWorkerPayload<WorkerInputType.StartSimulation, {
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
}>;
declare type IWorkerInputUpdateSimulationPayload = IWorkerPayload<WorkerInputType.UpdateSimulation, {
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
}>;
declare type IWorkerInputStopSimulationPayload = IWorkerPayload<WorkerInputType.StopSimulation>;
declare type IWorkerInputStartDragNodePayload = IWorkerPayload<WorkerInputType.StartDragNode>;
declare type IWorkerInputDragNodePayload = IWorkerPayload<WorkerInputType.DragNode, {
    id: number;
} & IPosition>;
declare type IWorkerInputEndDragNodePayload = IWorkerPayload<WorkerInputType.EndDragNode, {
    id: number;
}>;
declare type IWorkerInputFixNodesPayload = IWorkerPayload<WorkerInputType.FixNodes, {
    nodes: ISimulationNode[] | undefined;
}>;
declare type IWorkerInputReleaseNodesPayload = IWorkerPayload<WorkerInputType.ReleaseNodes, {
    nodes: ISimulationNode[] | undefined;
}>;
declare type IWorkerInputSetSettingsPayload = IWorkerPayload<WorkerInputType.SetSettings, ID3SimulatorEngineSettingsUpdate>;
export declare type IWorkerInputPayload = IWorkerInputSetDataPayload | IWorkerInputAddDataPayload | IWorkerInputUpdateDataPayload | IWorkerInputClearDataPayload | IWorkerInputSimulatePayload | IWorkerInputActivateSimulationPayload | IWorkerInputStartSimulationPayload | IWorkerInputUpdateSimulationPayload | IWorkerInputStopSimulationPayload | IWorkerInputStartDragNodePayload | IWorkerInputDragNodePayload | IWorkerInputFixNodesPayload | IWorkerInputReleaseNodesPayload | IWorkerInputEndDragNodePayload | IWorkerInputSetSettingsPayload;
export {};
