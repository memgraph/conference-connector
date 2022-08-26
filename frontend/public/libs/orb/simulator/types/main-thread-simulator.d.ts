import { ISimulationEdge, ISimulationNode, ISimulator, ISimulatorEvents } from '../interface';
import { IPosition } from '../../common/position';
import { D3SimulatorEngine, ID3SimulatorEngineSettingsUpdate } from '../engine/d3-simulator-engine';
export declare class MainThreadSimulator implements ISimulator {
    protected readonly simulator: D3SimulatorEngine;
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
    fixNodes(nodes: ISimulationNode[]): void;
    releaseNodes(nodes?: ISimulationNode[] | undefined): void;
    setSettings(settings: ID3SimulatorEngineSettingsUpdate): void;
    terminate(): void;
}
