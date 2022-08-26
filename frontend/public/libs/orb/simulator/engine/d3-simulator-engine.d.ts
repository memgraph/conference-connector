import { ForceLink, Simulation, SimulationLinkDatum } from 'd3-force';
import { IPosition } from '../../common/position';
import { ISimulationNode, ISimulationEdge } from '../interface';
import { Emitter } from '../../utils/emitter.utils';
export declare enum D3SimulatorEngineEventType {
    TICK = "tick",
    END = "end",
    STABILIZATION_STARTED = "stabilizationStarted",
    STABILIZATION_PROGRESS = "stabilizationProgress",
    STABILIZATION_ENDED = "stabilizationEnded",
    NODE_DRAGGED = "nodeDragged",
    SETTINGS_UPDATED = "settingsUpdated"
}
export interface ID3SimulatorEngineSettingsAlpha {
    alpha: number;
    alphaMin: number;
    alphaDecay: number;
    alphaTarget: number;
}
export interface ID3SimulatorEngineSettingsCentering {
    x: number;
    y: number;
    strength: number;
}
export interface ID3SimulatorEngineSettingsCollision {
    radius: number;
    strength: number;
    iterations: number;
}
export interface ID3SimulatorEngineSettingsLinks {
    distance: number;
    strength?: number;
    iterations: number;
}
export interface ID3SimulatorEngineSettingsManyBody {
    strength: number;
    theta: number;
    distanceMin: number;
    distanceMax: number;
}
export interface ID3SimulatorEngineSettingsPositioning {
    forceX: {
        x: number;
        strength: number;
    };
    forceY: {
        y: number;
        strength: number;
    };
}
export interface ID3SimulatorEngineSettings {
    isPhysicsEnabled: boolean;
    alpha: ID3SimulatorEngineSettingsAlpha;
    centering: ID3SimulatorEngineSettingsCentering | null;
    collision: ID3SimulatorEngineSettingsCollision | null;
    links: ID3SimulatorEngineSettingsLinks;
    manyBody: ID3SimulatorEngineSettingsManyBody | null;
    positioning: ID3SimulatorEngineSettingsPositioning | null;
}
export declare type ID3SimulatorEngineSettingsUpdate = Partial<ID3SimulatorEngineSettings>;
export declare const getManyBodyMaxDistance: (linkDistance: number) => number;
export declare const DEFAULT_SETTINGS: ID3SimulatorEngineSettings;
interface ID3SimulatorProgress {
    progress: number;
}
interface ID3SimulatorGraph {
    nodes: ISimulationNode[];
    edges: ISimulationEdge[];
}
interface ID3SimulatorNodeId {
    id: number;
}
interface ID3SimulatorSettings {
    settings: ID3SimulatorEngineSettings;
}
export declare class D3SimulatorEngine extends Emitter<{
    [D3SimulatorEngineEventType.TICK]: ID3SimulatorGraph;
    [D3SimulatorEngineEventType.END]: ID3SimulatorGraph;
    [D3SimulatorEngineEventType.STABILIZATION_STARTED]: undefined;
    [D3SimulatorEngineEventType.STABILIZATION_PROGRESS]: ID3SimulatorGraph & ID3SimulatorProgress;
    [D3SimulatorEngineEventType.STABILIZATION_ENDED]: ID3SimulatorGraph;
    [D3SimulatorEngineEventType.NODE_DRAGGED]: ID3SimulatorGraph;
    [D3SimulatorEngineEventType.SETTINGS_UPDATED]: ID3SimulatorSettings;
}> {
    protected readonly linkForce: ForceLink<ISimulationNode, SimulationLinkDatum<ISimulationNode>>;
    protected readonly simulation: Simulation<ISimulationNode, undefined>;
    protected readonly settings: ID3SimulatorEngineSettings;
    protected edges: ISimulationEdge[];
    protected nodes: ISimulationNode[];
    protected nodeIndexByNodeId: Record<number, number>;
    protected isDragging: boolean;
    protected isStabilizing: boolean;
    constructor(settings?: ID3SimulatorEngineSettings);
    getSettings(): ID3SimulatorEngineSettings;
    setSettings(settings: ID3SimulatorEngineSettingsUpdate): void;
    startDragNode(): void;
    dragNode(data: ID3SimulatorNodeId & IPosition): void;
    endDragNode(data: ID3SimulatorNodeId): void;
    activateSimulation(): void;
    private fixDefinedNodes;
    addData(data: ID3SimulatorGraph): void;
    clearData(): void;
    setData(data: ID3SimulatorGraph): void;
    updateData(data: ID3SimulatorGraph): void;
    simulate(): void;
    startSimulation(data: ID3SimulatorGraph): void;
    updateSimulation(data: ID3SimulatorGraph): void;
    stopSimulation(): void;
    protected initSimulation(settings: ID3SimulatorEngineSettingsUpdate): void;
    protected runStabilization(): void;
    protected setNodeIndexByNodeId(): void;
    fixNodes(nodes?: ISimulationNode[]): void;
    releaseNodes(nodes?: ISimulationNode[]): void;
}
export {};
