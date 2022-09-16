import { INode, INodeBase, INodePosition } from './node';
import { IEdge, IEdgeBase, IEdgePosition } from './edge';
import { IRectangle } from '../common/rectangle';
import { IPosition } from '../common/position';
import { IGraphStyle } from './style';
export interface IGraphData<N extends INodeBase, E extends IEdgeBase> {
    nodes: N[];
    edges: E[];
}
declare type IEdgeFilter<N extends INodeBase, E extends IEdgeBase> = (edge: IEdge<N, E>) => boolean;
declare type INodeFilter<N extends INodeBase, E extends IEdgeBase> = (node: INode<N, E>) => boolean;
export interface IGraph<N extends INodeBase, E extends IEdgeBase> {
    getNodes(filterBy?: INodeFilter<N, E>): INode<N, E>[];
    getEdges(filterBy?: IEdgeFilter<N, E>): IEdge<N, E>[];
    getNodeCount(): number;
    getEdgeCount(): number;
    getNodeById(id: any): INode<N, E> | undefined;
    getEdgeById(id: any): IEdge<N, E> | undefined;
    getNodePositions(): INodePosition[];
    setNodePositions(positions: INodePosition[]): void;
    getEdgePositions(): IEdgePosition[];
    setDefaultStyle(style: Partial<IGraphStyle<N, E>>): void;
    setup(data: Partial<IGraphData<N, E>>): void;
    clearPositions(): void;
    merge(data: Partial<IGraphData<N, E>>): void;
    remove(data: Partial<{
        nodeIds: number[];
        edgeIds: number[];
    }>): void;
    isEqual<T extends INodeBase, K extends IEdgeBase>(graph: Graph<T, K>): boolean;
    getBoundingBox(): IRectangle;
    getNearestNode(point: IPosition): INode<N, E> | undefined;
    getNearestEdge(point: IPosition, minDistance?: number): IEdge<N, E> | undefined;
}
export interface IGraphSettings {
    onLoadedImages: () => void;
}
export declare class Graph<N extends INodeBase, E extends IEdgeBase> implements IGraph<N, E> {
    private _nodeById;
    private _edgeById;
    private _defaultStyle?;
    private _onLoadedImages?;
    constructor(data?: Partial<IGraphData<N, E>>, settings?: Partial<IGraphSettings>);
    /**
     * Returns a list of nodes.
     *
     * @param {INodeFilter} filterBy Filter function for nodes
     * @return {INode[]} List of nodes
     */
    getNodes(filterBy?: INodeFilter<N, E>): INode<N, E>[];
    /**
     * Returns a list of edges.
     *
     * @param {IEdgeFilter} filterBy Filter function for edges
     * @return {IEdge[]} List of edges
     */
    getEdges(filterBy?: IEdgeFilter<N, E>): IEdge<N, E>[];
    /**
     * Returns the total node count.
     *
     * @return {number} Total node count
     */
    getNodeCount(): number;
    /**
     * Returns the total edge count.
     *
     * @return {number} Total edge count
     */
    getEdgeCount(): number;
    /**
     * Returns node by node id.
     *
     * @param {any} id Node id
     * @return {Node | undefined} Node or undefined
     */
    getNodeById(id: any): INode<N, E> | undefined;
    /**
     * Returns edge by edge id.
     *
     * @param {any} id Edge id
     * @return {IEdge | undefined} Edge or undefined
     */
    getEdgeById(id: any): IEdge<N, E> | undefined;
    /**
     * Returns a list of current node positions (x, y).
     *
     * @return {INodePosition[]} List of node positions
     */
    getNodePositions(): INodePosition[];
    /**
     * Sets new node positions (x, y).
     *
     * @param {INodePosition} positions Node positions
     */
    setNodePositions(positions: INodePosition[]): void;
    /**
     * Returns a list of current edge positions. Edge positions do not have
     * (x, y) but a link to the source and target node ids.
     *
     * @return {IEdgePosition[]} List of edge positions
     */
    getEdgePositions(): IEdgePosition[];
    /**
     * Sets default style to new nodes and edges. The applied style will be used
     * for all future nodes and edges added with `.merge` function.
     *
     * @param {IGraphStyle} style Style definition
     */
    setDefaultStyle(style: Partial<IGraphStyle<N, E>>): void;
    setup(data: Partial<IGraphData<N, E>>): void;
    clearPositions(): void;
    merge(data: Partial<IGraphData<N, E>>): void;
    remove(data: Partial<{
        nodeIds: number[];
        edgeIds: number[];
    }>): void;
    isEqual<T extends INodeBase, K extends IEdgeBase>(graph: Graph<T, K>): boolean;
    getBoundingBox(): IRectangle;
    getNearestNode(point: IPosition): INode<N, E> | undefined;
    getNearestEdge(point: IPosition, minDistance?: number): IEdge<N, E> | undefined;
    private _insertNodes;
    private _insertEdges;
    private _upsertNodes;
    private _upsertEdges;
    private _removeNodes;
    private _removeEdges;
    private _applyEdgeOffsets;
    private _applyStyle;
}
export {};
