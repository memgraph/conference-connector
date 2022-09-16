import { IPosition } from '../common/position';
/**
 * Calculate the distance between a point (x3,y3) and a line segment from (x1,y1) to (x2,y2).
 * @see {@link http://stackoverflow.com/questions/849211/shortest-distancae-between-a-point-and-a-line-segment}
 *
 * @param {IPosition} startLinePoint Line start position
 * @param {IPosition} endLinePoint Line end position
 * @param {IPosition} point Target position
 * @return {number} Distance between the point and the line
 */
export declare const getDistanceToLine: (startLinePoint: IPosition, endLinePoint: IPosition, point: IPosition) => number;
