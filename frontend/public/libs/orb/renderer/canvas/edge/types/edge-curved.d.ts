import { INodeBase } from '../../../../models/node';
import { EdgeCurved, IEdgeBase } from '../../../../models/edge';
import { IEdgeArrow } from '../index';
export declare const drawCurvedLine: <N extends INodeBase, E extends IEdgeBase>(context: CanvasRenderingContext2D, edge: EdgeCurved<N, E>) => void;
/**
 * @see {@link https://github.com/visjs/vis-network/blob/master/lib/network/modules/components/Edge.js}
 *
 * @param {EdgeCurved} edge Edge
 * @return {IEdgeArrow} Arrow shape
 */
export declare const getCurvedArrowShape: <N extends INodeBase, E extends IEdgeBase>(edge: EdgeCurved<N, E>) => IEdgeArrow;
