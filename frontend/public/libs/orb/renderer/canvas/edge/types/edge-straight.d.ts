import { INodeBase } from '../../../../models/node';
import { EdgeStraight, IEdgeBase } from '../../../../models/edge';
import { IEdgeArrow } from '../index';
export declare const drawStraightLine: <N extends INodeBase, E extends IEdgeBase>(context: CanvasRenderingContext2D, edge: EdgeStraight<N, E>) => void;
/**
 * @see {@link https://github.com/visjs/vis-network/blob/master/lib/network/modules/components/Edge.js}
 *
 * @param {EdgeStraight} edge Edge
 * @return {IEdgeArrow} Arrow shape
 */
export declare const getStraightArrowShape: <N extends INodeBase, E extends IEdgeBase>(edge: EdgeStraight<N, E>) => IEdgeArrow;
