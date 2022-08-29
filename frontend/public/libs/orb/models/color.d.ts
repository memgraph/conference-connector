export interface IColorRGB {
    r: number;
    g: number;
    b: number;
}
/**
 * Color object (HEX, RGB).
 */
export declare class Color {
    readonly hex: string;
    readonly rgb: IColorRGB;
    constructor(hex: string);
    /**
     * Returns HEX representation of the color.
     *
     * @return {string} HEX color code (#XXXXXX)
     */
    toString(): string;
    /**
     * Returns darker color by the input factor. Default factor
     * is 0.3. Factor should be between 0 (same color) and 1 (black color).
     *
     * @param {number} factor Factor for the darker color
     * @return {Color} Darker color
     */
    getDarkerColor(factor?: number): Color;
    /**
     * Returns lighter color by the input factor. Default factor
     * is 0.3. Factor should be between 0 (same color) and 1 (white color).
     *
     * @param {number} factor Factor for the lighter color
     * @return {Color} Lighter color
     */
    getLighterColor(factor?: number): Color;
    /**
     * Returns a new color by mixing the input color with self.
     *
     * @param {Color} color Color to mix with
     * @return {Color} Mixed color
     */
    getMixedColor(color: Color): Color;
    /**
     * Checks if it is an equal color.
     *
     * @param {Color} color Another color
     * @return {boolean} True if equal colors, otherwise false
     */
    isEqual(color: Color): boolean;
    /**
     * Returns a color from RGB values.
     *
     * @param {IColorRGB} rgb RGB values
     * @return {Color} Color
     */
    static getColorFromRGB(rgb: IColorRGB): Color;
    /**
     * Returns a random color.
     *
     * @return {Color} Random color
     */
    static getRandomColor(): Color;
}
