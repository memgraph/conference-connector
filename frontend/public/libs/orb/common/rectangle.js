/**
 * Checks if the point (x, y) is in the rectangle.
 *
 * @param {IRectangle} rectangle Rectangle
 * @param {IPosition} point Point (x, y)
 * @return {boolean} True if the point (x, y) is in the rectangle, otherwise false
 */
export const isPointInRectangle = (rectangle, point) => {
    const endX = rectangle.x + rectangle.width;
    const endY = rectangle.y + rectangle.height;
    return point.x >= rectangle.x && point.x <= endX && point.y >= rectangle.y && point.y <= endY;
};
//# sourceMappingURL=rectangle.js.map