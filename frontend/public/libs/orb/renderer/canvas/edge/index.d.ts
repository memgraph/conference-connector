import { INodeBase } from '../../../models/node';
import { IEdge, IEdgeBase } from '../../../models/edge';
import { IPosition } from '../../../common/position';
export interface IEdgeDrawOptions {
    isShadowEnabled: boolean;
    isLabelEnabled: boolean;
}
export interface IBorderPosition extends IPosition {
    t: number;
}
export interface IEdgeArrow {
    point: IBorderPosition;
    core: IPosition;
    angle: number;
    length: number;
}
export declare const drawEdge: <N extends INodeBase, E extends IEdgeBase>(context: CanvasRenderingContext2D, edge: IEdge<N, E>, options?: Partial<IEdgeDrawOptions> | undefined) => void;
