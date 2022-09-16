import { IPosition } from './position';
/**
 * 2D rectangle with top left point (x, y), width and height.
 */
export interface IRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * Checks if the point (x, y) is in the rectangle.
 *
 * @param {IRectangle} rectangle Rectangle
 * @param {IPosition} point Point (x, y)
 * @return {boolean} True if the point (x, y) is in the rectangle, otherwise false
 */
export declare const isPointInRectangle: (rectangle: IRectangle, point: IPosition) => boolean;
