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
export const copyArray = (array) => {
    const newArray = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
        newArray[i] = array[i];
    }
    return newArray;
};
//# sourceMappingURL=array.utils.js.map