import { IEdge, IEdgeBase, IEdgeProperties } from './edge';
import { INode, INodeBase, INodeProperties } from './node';
export declare const DEFAULT_NODE_PROPERTIES: Partial<INodeProperties>;
export declare const DEFAULT_EDGE_PROPERTIES: Partial<IEdgeProperties>;
export declare type IEdgeStyle = Partial<IEdgeProperties>;
export declare type INodeStyle = Partial<INodeProperties>;
export interface IGraphStyle<N extends INodeBase, E extends IEdgeBase> {
    getNodeStyle(node: INode<N, E>): INodeStyle | undefined;
    getEdgeStyle(edge: IEdge<N, E>): IEdgeStyle | undefined;
}
export declare const getDefaultGraphStyle: <N extends INodeBase, E extends IEdgeBase>() => IGraphStyle<N, E>;
