/**
 * Copies input array into a new array. Doesn't do deep copy.
 *
 * The following implementation is faster:
 * - ~ 6x than `array.map(v => v)`
 * - ~15x than `[...array]
 *
 * @param {Array} array Input array
 * @return {Array} Copied array
 */
export declare const copyArray: <T>(array: T[]) => T[];
