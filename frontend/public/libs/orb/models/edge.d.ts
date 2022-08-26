import { INodeBase, INode } from './node';
import { Color } from './color';
import { IPosition } from '../common/position';
import { ICircle } from '../common/circle';
/**
 * Edge baseline object with required fields
 * that user needs to define for an edge.
 */
export interface IEdgeBase {
    id: any;
    start: any;
    end: any;
}
/**
 * Edge position for the graph simulations. Edge position
 * is determined by source (start) and target (end) nodes.
 */
export interface IEdgePosition {
    id: any;
    source: any;
    target: any;
}
/**
 * Edge properties used to style the edge (color, width, label, etc.).
 */
export interface IEdgeProperties {
    arrowSize: number;
    color: Color | string;
    colorHover: Color | string;
    colorSelected: Color | string;
    fontBackgroundColor: Color | string;
    fontColor: Color | string;
    fontFamily: string;
    fontSize: number;
    label: string;
    shadowColor: Color | string;
    shadowSize: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    width: number;
    widthHover: number;
    widthSelected: number;
}
export interface IEdgeData<N extends INodeBase, E extends IEdgeBase> {
    data: E;
    offset?: number;
    startNode: INode<N, E>;
    endNode: INode<N, E>;
}
export declare enum EdgeType {
    STRAIGHT = "straight",
    LOOPBACK = "loopback",
    CURVED = "curved"
}
export interface IEdge<N extends INodeBase, E extends IEdgeBase> {
    data: E;
    position: IEdgePosition;
    properties: Partial<IEdgeProperties>;
    state: number;
    get id(): any;
    get offset(): number;
    get start(): any;
    get startNode(): INode<N, E>;
    get end(): any;
    get endNode(): INode<N, E>;
    get type(): EdgeType;
    hasProperties(): boolean;
    isSelected(): boolean;
    isHovered(): boolean;
    clearState(): void;
    isLoopback(): boolean;
    isStraight(): boolean;
    isCurved(): boolean;
    getCenter(): IPosition;
    getDistance(point: IPosition): number;
    getLabel(): string | undefined;
    hasShadow(): boolean;
    getWidth(): number;
    getColor(): Color | string | undefined;
}
export declare class EdgeFactory {
    static create<N extends INodeBase, E extends IEdgeBase>(data: IEdgeData<N, E>): IEdge<N, E>;
    static copy<N extends INodeBase, E extends IEdgeBase>(edge: IEdge<N, E>, data?: Omit<IEdgeData<N, E>, 'data' | 'startNode' | 'endNode'>): IEdge<N, E>;
}
export declare const isEdge: <N extends INodeBase, E extends IEdgeBase>(obj: any) => obj is IEdge<N, E>;
declare abstract class Edge<N extends INodeBase, E extends IEdgeBase> implements IEdge<N, E> {
    data: E;
    readonly id: number;
    readonly offset: number;
    readonly startNode: INode<N, E>;
    readonly endNode: INode<N, E>;
    properties: Partial<IEdgeProperties>;
    state: number;
    position: IEdgePosition;
    private _type;
    constructor(data: IEdgeData<N, E>);
    get type(): EdgeType;
    get start(): number;
    get end(): number;
    hasProperties(): boolean;
    isSelected(): boolean;
    isHovered(): boolean;
    clearState(): void;
    isLoopback(): boolean;
    isStraight(): boolean;
    isCurved(): boolean;
    getCenter(): IPosition;
    getDistance(point: IPosition): number;
    getLabel(): string | undefined;
    hasShadow(): boolean;
    getWidth(): number;
    getColor(): Color | string | undefined;
}
export declare class EdgeStraight<N extends INodeBase, E extends IEdgeBase> extends Edge<N, E> {
    getCenter(): IPosition;
    getDistance(point: IPosition): number;
}
export declare class EdgeCurved<N extends INodeBase, E extends IEdgeBase> extends Edge<N, E> {
    getCenter(): IPosition;
    /**
     * @see {@link https://github.com/visjs/vis-network/blob/master/lib/network/modules/components/edges/util/bezier-edge-base.ts}
     *
     * @param {IPosition} point Point
     * @return {number} Distance to the point
     */
    getDistance(point: IPosition): number;
    getCurvedControlPoint(offsetMultiplier?: number): IPosition;
}
export declare class EdgeLoopback<N extends INodeBase, E extends IEdgeBase> extends Edge<N, E> {
    getCenter(): IPosition;
    getDistance(point: IPosition): number;
    getCircularData(): ICircle;
}
export {};
