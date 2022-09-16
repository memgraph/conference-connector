/**
 * Creates a new deep copy of the received object. Dates, arrays and
 * plain objects will be created as new objects (new reference).
 *
 * @param {any} obj Object
 * @return {any} Deep copied object
 */
export declare const copyObject: <T extends unknown>(obj: T) => T;
/**
 * Checks if two objects are equal by value. It does deep checking for
 * values within arrays or plain objects. Equality for anything that is
 * not a Date, Array, or a plain object will be checked as `a === b`.
 *
 * @param {any} obj1 Object
 * @param {any} obj2 Object
 * @return {boolean} True if objects are deeply equal, otherwise false
 */
export declare const isObjectEqual: (obj1: any, obj2: any) => boolean;
