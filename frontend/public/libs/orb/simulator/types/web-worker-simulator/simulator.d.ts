import { IPosition } from '../../../common/position';
import { ISimulator, ISimulatorEvents, ISimulationNode, ISimulationEdge } from '../../interface';
import { ID3SimulatorEngineSettingsUpdate } from '../../engine/d3-simulator-engine';
import { IWorkerInputPayload } from './message/worker-input';
export declare class WebWorkerSimulator implements ISimulator {
    protected readonly worker: Worker;
    constructor(events: Partial<ISimulatorEvents>);
    setData(nodes: ISimulationNode[], edges: ISimulationEdge[]): void;
    addData(nodes: ISimulationNode[], edges: ISimulationEdge[]): void;
    updateData(nodes: ISimulationNode[], edges: ISimulationEdge[]): void;
    clearData(): void;
    simulate(): void;
    activateSimulation(): void;
    startSimulation(nodes: ISimulationNode[], edges: ISimulationEdge[]): void;
    updateSimulation(nodes: ISimulationNode[], edges: ISimulationEdge[]): void;
    stopSimulation(): void;
    startDragNode(): void;
    dragNode(nodeId: number, position: IPosition): void;
    endDragNode(nodeId: number): void;
    fixNodes(nodes?: ISimulationNode[]): void;
    releaseNodes(nodes?: ISimulationNode[]): void;
    setSettings(settings: ID3SimulatorEngineSettingsUpdate): void;
    terminate(): void;
    protected emitToWorker(message: IWorkerInputPayload): void;
}
