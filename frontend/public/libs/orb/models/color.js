const IS_VALID_HEX = /^#[a-fA-F0-9]{6}$/;
const DEFAULT_HEX = '#000000';
/**
 * Color object (HEX, RGB).
 */
export class Color {
    constructor(hex) {
        this.hex = IS_VALID_HEX.test(hex !== null && hex !== void 0 ? hex : '') ? hex : DEFAULT_HEX;
        this.rgb = hexToRgb(hex);
    }
    /**
     * Returns HEX representation of the color.
     *
     * @return {string} HEX color code (#XXXXXX)
     */
    toString() {
        return this.hex;
    }
    /**
     * Returns darker color by the input factor. Default factor
     * is 0.3. Factor should be between 0 (same color) and 1 (black color).
     *
     * @param {number} factor Factor for the darker color
     * @return {Color} Darker color
     */
    getDarkerColor(factor = 0.3) {
        return Color.getColorFromRGB({
            r: this.rgb.r - factor * this.rgb.r,
            g: this.rgb.g - factor * this.rgb.g,
            b: this.rgb.b - factor * this.rgb.b,
        });
    }
    /**
     * Returns lighter color by the input factor. Default factor
     * is 0.3. Factor should be between 0 (same color) and 1 (white color).
     *
     * @param {number} factor Factor for the lighter color
     * @return {Color} Lighter color
     */
    getLighterColor(factor = 0.3) {
        return Color.getColorFromRGB({
            r: this.rgb.r + factor * (255 - this.rgb.r),
            g: this.rgb.g + factor * (255 - this.rgb.g),
            b: this.rgb.b + factor * (255 - this.rgb.b),
        });
    }
    /**
     * Returns a new color by mixing the input color with self.
     *
     * @param {Color} color Color to mix with
     * @return {Color} Mixed color
     */
    getMixedColor(color) {
        return Color.getColorFromRGB({
            r: (this.rgb.r + color.rgb.r) / 2,
            g: (this.rgb.g + color.rgb.g) / 2,
            b: (this.rgb.b + color.rgb.b) / 2,
        });
    }
    /**
     * Checks if it is an equal color.
     *
     * @param {Color} color Another color
     * @return {boolean} True if equal colors, otherwise false
     */
    isEqual(color) {
        return this.rgb.r === color.rgb.r && this.rgb.g === color.rgb.g && this.rgb.b === color.rgb.b;
    }
    /**
     * Returns a color from RGB values.
     *
     * @param {IColorRGB} rgb RGB values
     * @return {Color} Color
     */
    static getColorFromRGB(rgb) {
        const r = Math.round(Math.max(Math.min(rgb.r, 255), 0));
        const g = Math.round(Math.max(Math.min(rgb.g, 255), 0));
        const b = Math.round(Math.max(Math.min(rgb.b, 255), 0));
        return new Color(rgbToHex({ r, g, b }));
    }
    /**
     * Returns a random color.
     *
     * @return {Color} Random color
     */
    static getRandomColor() {
        return Color.getColorFromRGB({
            r: Math.round(255 * Math.random()),
            g: Math.round(255 * Math.random()),
            b: Math.round(255 * Math.random()),
        });
    }
}
/**
 * Converts HEX color code to RGB. Doesn't validate the HEX.
 *
 * @param {string} hex HEX color code (#XXXXXX)
 * @return {IColorRGB} RGB color
 */
const hexToRgb = (hex) => {
    return {
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(6, 7), 16),
    };
};
/**
 * Converts RGB color to HEX color code.
 *
 * @param {IColorRGB} rgb RGB color
 * @return {string} HEX color code (#XXXXXX)
 */
const rgbToHex = (rgb) => {
    return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
};
//# sourceMappingURL=color.js.map