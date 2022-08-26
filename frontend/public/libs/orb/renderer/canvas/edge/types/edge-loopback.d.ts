import { INodeBase } from '../../../../models/node';
import { EdgeLoopback, IEdgeBase } from '../../../../models/edge';
import { IEdgeArrow } from '../index';
export declare const drawLoopbackLine: <N extends INodeBase, E extends IEdgeBase>(context: CanvasRenderingContext2D, edge: EdgeLoopback<N, E>) => void;
/**
 * @see {@link https://github.com/visjs/vis-network/blob/master/lib/network/modules/components/Edge.js}
 *
 * @param {EdgeLoopback} edge Edge
 * @return {IEdgeArrow} Arrow shape
 */
export declare const getLoopbackArrowShape: <N extends INodeBase, E extends IEdgeBase>(edge: EdgeLoopback<N, E>) => IEdgeArrow;
