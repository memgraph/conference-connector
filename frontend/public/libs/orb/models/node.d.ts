import { IEdge, IEdgeBase } from './edge';
import { IRectangle } from '../common/rectangle';
import { Color } from './color';
import { IPosition } from '../common/position';
/**
 * Node baseline object with required fields
 * that user needs to define for a node.
 */
export interface INodeBase {
    id: any;
}
/**
 * Node position for the graph simulations. Node position
 * is determined by x and y coordinates.
 */
export interface INodePosition {
    id: any;
    x?: number;
    y?: number;
}
export declare enum NodeShapeType {
    CIRCLE = "circle",
    DOT = "dot",
    SQUARE = "square",
    DIAMOND = "diamond",
    TRIANGLE = "triangle",
    TRIANGLE_DOWN = "triangleDown",
    STAR = "star",
    HEXAGON = "hexagon"
}
/**
 * Node properties used to style the node (color, width, label, etc.).
 */
export interface INodeProperties {
    borderColor: Color | string;
    borderColorHover: Color | string;
    borderColorSelected: Color | string;
    borderWidth: number;
    borderWidthSelected: number;
    color: Color | string;
    colorHover: Color | string;
    colorSelected: Color | string;
    fontBackgroundColor: Color | string;
    fontColor: Color | string;
    fontFamily: string;
    fontSize: number;
    imageUrl: string;
    imageUrlSelected: string;
    label: string;
    shadowColor: Color | string;
    shadowSize: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shape: NodeShapeType;
    size: number;
    mass: number;
}
export interface INodeData<N extends INodeBase> {
    data: N;
}
export interface INode<N extends INodeBase, E extends IEdgeBase> {
    data: N;
    position: INodePosition;
    properties: Partial<INodeProperties>;
    state: number;
    get id(): any;
    clearPosition(): void;
    getCenter(): IPosition;
    getRadius(): number;
    getBorderedRadius(): number;
    getBoundingBox(): IRectangle;
    getInEdges(): IEdge<N, E>[];
    getOutEdges(): IEdge<N, E>[];
    getEdges(): IEdge<N, E>[];
    getAdjacentNodes(): INode<N, E>[];
    hasProperties(): boolean;
    addEdge(edge: IEdge<N, E>): void;
    removeEdge(edge: IEdge<N, E>): void;
    isSelected(): boolean;
    isHovered(): boolean;
    clearState(): void;
    getDistanceToBorder(): number;
    includesPoint(point: IPosition): boolean;
    hasShadow(): boolean;
    hasBorder(): boolean;
    getLabel(): string | undefined;
    getColor(): Color | string | undefined;
    getBorderWidth(): number;
    getBorderColor(): Color | string | undefined;
    getBackgroundImage(): HTMLImageElement | undefined;
}
export declare class NodeFactory {
    static create<N extends INodeBase, E extends IEdgeBase>(data: INodeData<N>): INode<N, E>;
}
export declare const isNode: <N extends INodeBase, E extends IEdgeBase>(obj: any) => obj is INode<N, E>;
export declare class Node<N extends INodeBase, E extends IEdgeBase> implements INode<N, E> {
    readonly id: number;
    data: N;
    position: INodePosition;
    properties: Partial<INodeProperties>;
    state: number;
    private readonly _inEdgesById;
    private readonly _outEdgesById;
    constructor(data: INodeData<N>);
    clearPosition(): void;
    getCenter(): IPosition;
    getRadius(): number;
    getBorderedRadius(): number;
    getBoundingBox(): IRectangle;
    getInEdges(): IEdge<N, E>[];
    getOutEdges(): IEdge<N, E>[];
    getEdges(): IEdge<N, E>[];
    getAdjacentNodes(): INode<N, E>[];
    hasProperties(): boolean;
    addEdge(edge: IEdge<N, E>): void;
    removeEdge(edge: IEdge<N, E>): void;
    isSelected(): boolean;
    isHovered(): boolean;
    clearState(): void;
    getDistanceToBorder(): number;
    includesPoint(point: IPosition): boolean;
    hasShadow(): boolean;
    hasBorder(): boolean;
    getLabel(): string | undefined;
    getColor(): Color | string | undefined;
    getBorderWidth(): number;
    getBorderColor(): Color | string | undefined;
    getBackgroundImage(): HTMLImageElement | undefined;
    protected _isPointInBoundingBox(point: IPosition): boolean;
}
