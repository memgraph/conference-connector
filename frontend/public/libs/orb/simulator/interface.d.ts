import { IPosition } from '../common/position';
import { ID3SimulatorEngineSettings, ID3SimulatorEngineSettingsUpdate } from './engine/d3-simulator-engine';
import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
export declare type ISimulationNode = SimulationNodeDatum & {
    id: number;
    mass?: number;
};
export declare type ISimulationEdge = SimulationLinkDatum<ISimulationNode> & {
    id: number;
};
export interface ISimulator {
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
}
export interface ISimulatorEventGraph {
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
}
export interface ISimulatorEventProgress {
    progress: number;
}
export interface ISimulatorEventSettings {
    settings: ID3SimulatorEngineSettings;
}
export interface ISimulatorEvents {
    onNodeDrag: (data: ISimulatorEventGraph) => void;
    onNodeDragEnd: (data: ISimulatorEventGraph) => void;
    onStabilizationStart: () => void;
    onStabilizationProgress: (data: ISimulatorEventGraph & ISimulatorEventProgress) => void;
    onStabilizationEnd: (data: ISimulatorEventGraph) => void;
    onSettingsUpdate: (data: ISimulatorEventSettings) => void;
}
