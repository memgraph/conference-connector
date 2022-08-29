import { INodeBase } from './node';
import { IEdge, IEdgeBase } from './edge';
export declare const getEdgeOffsets: <N extends INodeBase, E extends IEdgeBase>(edges: IEdge<N, E>[]) => number[];
