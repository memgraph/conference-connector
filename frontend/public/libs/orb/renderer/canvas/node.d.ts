import { INodeBase, INode } from '../../models/node';
import { IEdgeBase } from '../../models/edge';
export interface INodeDrawOptions {
    isShadowEnabled: boolean;
    isLabelEnabled: boolean;
}
export declare const drawNode: <N extends INodeBase, E extends IEdgeBase>(context: CanvasRenderingContext2D, node: INode<N, E>, options?: Partial<INodeDrawOptions> | undefined) => void;
