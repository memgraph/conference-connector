import { D3DragEvent } from 'd3-drag';
import { D3ZoomEvent } from 'd3-zoom';
import { IPosition } from '../common/position';
import { IRendererSettings } from '../renderer/canvas/renderer';
import { INode, INodeBase } from '../models/node';
import { IEdgeBase } from '../models/edge';
import { IOrbView, IOrbViewContext } from '../orb';
import { ID3SimulatorEngineSettingsUpdate } from '../simulator/engine/d3-simulator-engine';
export interface IDefaultViewSettings<N extends INodeBase, E extends IEdgeBase> {
    getPosition?(node: INode<N, E>): IPosition | undefined;
    simulation: ID3SimulatorEngineSettingsUpdate;
    render: Partial<IRendererSettings>;
}
export declare class DefaultView<N extends INodeBase, E extends IEdgeBase> implements IOrbView<IDefaultViewSettings<N, E>> {
    private _container;
    private _graph;
    private _events;
    private _strategy;
    private _settings;
    private _canvas;
    private _context;
    private readonly _renderer;
    private readonly _simulator;
    private _isSimulating;
    private _onSimulationEnd;
    private _simulationStartedAt;
    private _d3Zoom;
    private _dragStartPosition;
    constructor(context: IOrbViewContext<N, E>, settings?: Partial<IDefaultViewSettings<N, E>>);
    isInitiallyRendered(): boolean;
    getSettings(): IDefaultViewSettings<N, E>;
    setSettings(settings: Partial<IDefaultViewSettings<N, E>>): void;
    render(onRendered?: () => void): void;
    recenter(onRendered?: () => void): void;
    destroy(): void;
    dragSubject: (event: D3DragEvent<any, MouseEvent, INode<N, E>>) => INode<N, E> | undefined;
    dragStarted: (event: D3DragEvent<any, any, INode<N, E>>) => void;
    dragged: (event: D3DragEvent<any, any, INode<N, E>>) => void;
    dragEnded: (event: D3DragEvent<any, any, INode<N, E>>) => void;
    zoomed: (event: D3ZoomEvent<any, any>) => void;
    getCanvasMousePosition(event: MouseEvent): IPosition;
    mouseMoved: (event: MouseEvent) => void;
    mouseClicked: (event: PointerEvent) => void;
    private _handleResize;
    private _startSimulation;
    fixNodes(): void;
    releaseNodes(): void;
}
