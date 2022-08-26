/**
 * Type check for string values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a string, false otherwise
 */
export const isString = (value) => {
    return typeof value === 'string';
};
/**
 * Type check for number values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a number, false otherwise
 */
export const isNumber = (value) => {
    return typeof value === 'number';
};
/**
 * Type check for boolean values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a boolean, false otherwise
 */
export const isBoolean = (value) => {
    return typeof value === 'boolean';
};
/**
 * Type check for Date values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a Date, false otherwise
 */
export const isDate = (value) => {
    return value instanceof Date;
};
/**
 * Type check for Array values. Alias for `Array.isArray`.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is an Array, false otherwise
 */
export const isArray = (value) => {
    return Array.isArray(value);
};
/**
 * Type check for plain object values: { [key]: value }
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a plain object, false otherwise
 */
export const isPlainObject = (value) => {
    return value !== null && typeof value === 'object' && value.constructor.name === 'Object';
};
/**
 * Type check for null values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a null, false otherwise
 */
export const isNull = (value) => {
    return value === null;
};
/**
 * Type check for Function values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a Function, false otherwise
 */
export const isFunction = (value) => {
    return typeof value === 'function';
};
//# sourceMappingURL=type.utils.js.map