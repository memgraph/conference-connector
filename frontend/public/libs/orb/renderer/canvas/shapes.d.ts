/**
 * Draws a circle shape.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} r Radius
 */
export declare const drawCircle: (context: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
/**
 * Draws a square shape.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} r Size (width and height) of the square
 */
export declare const drawSquare: (context: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
/**
 * Draws a triangle shape.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} r Radius, half the length of the sides of the triangle
 */
export declare const drawTriangleUp: (context: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
/**
 * Draws a triangle shape in downward orientation.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} r Radius, half the length of the sides of the triangle
 */
export declare const drawTriangleDown: (context: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
/**
 * Draw a star shape, a star with 5 points.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} r Radius, half the length of the sides of the triangle
 */
export declare const drawStar: (context: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
/**
 * Draws a Diamond shape.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} r Radius, half the length of the sides of the triangle
 */
export declare const drawDiamond: (context: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
/**
 * Draws a rounded rectangle.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 * @see {@link http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} w Width
 * @param {number} h Height
 * @param {number} r Border radius
 */
export declare const drawRoundRect: (context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => void;
/**
 * Draws an ellipse.
 * @see {@link https://github.com/almende/vis/blob/master/lib/network/shapes.js}
 * @see {@link http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas}
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {number} x Horizontal center
 * @param {number} y Vertical center
 * @param {number} w Width
 * @param {number} h Height
 */
export declare const drawEllipse: (context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;
/**
 * Draws a Hexagon shape with 6 sides.
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {Number} x Horizontal center
 * @param {Number} y Vertical center
 * @param {Number} r Radius
 */
export declare const drawHexagon: (context: CanvasRenderingContext2D, x: number, y: number, r: number) => void;
/**
 * Draws a N-gon shape with N sides.
 *
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {Number} x Horizontal center
 * @param {Number} y Vertical center
 * @param {Number} r Radius
 * @param {Number} sides Number of sides
 */
export declare const drawNgon: (context: CanvasRenderingContext2D, x: number, y: number, r: number, sides: number) => void;
