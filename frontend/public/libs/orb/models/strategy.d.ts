import { INode, INodeBase } from './node';
import { IEdge, IEdgeBase } from './edge';
import { IGraph } from './graph';
import { IPosition } from '../common/position';
export interface IEventStrategyResponse<N extends INodeBase, E extends IEdgeBase> {
    isStateChanged: boolean;
    changedSubject?: INode<N, E> | IEdge<N, E>;
}
export interface IEventStrategy<N extends INodeBase, E extends IEdgeBase> {
    onMouseClick: ((graph: IGraph<N, E>, point: IPosition) => IEventStrategyResponse<N, E>) | null;
    onMouseMove: ((graph: IGraph<N, E>, point: IPosition) => IEventStrategyResponse<N, E>) | null;
}
export declare const getDefaultEventStrategy: <N extends INodeBase, E extends IEdgeBase>() => IEventStrategy<N, E>;
