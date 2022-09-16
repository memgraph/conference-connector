/**
 * Makes all deep properties partial. Same as Partial<T> but deep.
 */
export declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
/**
 * Makes all deep properties required. Same as Required<T> but deep.
 */
export declare type DeepRequired<T> = T extends object ? {
    [P in keyof T]-?: DeepRequired<T[P]>;
} : T;
/**
 * Type check for string values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a string, false otherwise
 */
export declare const isString: (value: any) => value is string;
/**
 * Type check for number values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a number, false otherwise
 */
export declare const isNumber: (value: any) => value is number;
/**
 * Type check for boolean values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a boolean, false otherwise
 */
export declare const isBoolean: (value: any) => value is boolean;
/**
 * Type check for Date values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a Date, false otherwise
 */
export declare const isDate: (value: any) => value is Date;
/**
 * Type check for Array values. Alias for `Array.isArray`.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is an Array, false otherwise
 */
export declare const isArray: (value: any) => value is any[];
/**
 * Type check for plain object values: { [key]: value }
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a plain object, false otherwise
 */
export declare const isPlainObject: (value: any) => value is Record<string, any>;
/**
 * Type check for null values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a null, false otherwise
 */
export declare const isNull: (value: any) => value is null;
/**
 * Type check for Function values.
 *
 * @param {any} value Any value
 * @return {boolean} True if it is a Function, false otherwise
 */
export declare const isFunction: (value: any) => value is Function;
