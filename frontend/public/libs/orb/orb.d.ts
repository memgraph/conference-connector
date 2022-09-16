import { IGraph } from './models/graph';
import { INodeBase } from './models/node';
import { IEdgeBase } from './models/edge';
import { IEventStrategy } from './models/strategy';
import { OrbEmitter } from './events';
export interface IOrbView<S = any> {
    isInitiallyRendered(): boolean;
    getSettings(): S;
    setSettings(settings: Partial<S>): void;
    render(onRendered?: () => void): void;
    recenter(onRendered?: () => void): void;
    destroy(): void;
}
export interface IOrbViewContext<N extends INodeBase, E extends IEdgeBase> {
    container: HTMLElement;
    graph: IGraph<N, E>;
    events: OrbEmitter<N, E>;
    strategy: IEventStrategy<N, E>;
}
export declare type IOrbViewFactory<N extends INodeBase, E extends IEdgeBase, S> = (context: IOrbViewContext<N, E>) => IOrbView<S>;
export interface IOrbSettings<N extends INodeBase, E extends IEdgeBase, S> {
    view: IOrbViewFactory<N, E, S>;
    strategy: IEventStrategy<N, E>;
}
export declare class Orb<N extends INodeBase, E extends IEdgeBase, S = any> {
    private container;
    private _view;
    private readonly _events;
    private readonly _graph;
    private readonly _context;
    constructor(container: HTMLElement, settings?: Partial<IOrbSettings<N, E, S>>);
    get data(): IGraph<N, E>;
    get view(): IOrbView<S>;
    get events(): OrbEmitter<N, E>;
    setView(factory: IOrbViewFactory<N, E, S>): void;
}
