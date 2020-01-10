/*
 * @Author: snoy
 * @Email: jxycbjhc@163.com
 * @Date: 2020-01-06 09:14:28
 * @Last Modified by:   snoy
 * @Last Modified time: 2020-01-06 09:14:28
 * @Description: Description
 */

//A small module to check if an Array is sorted. asc
function defaultComparator(a, b) {
  return a - b;
}
function checksort(array, comparator) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected Array, got " + typeof array);
  }
  comparator = comparator || defaultComparator;
  for (let index = 1; index < array.length; index++) {
    if (comparator(array[index - 1], array[index]) > 0) {
      return false;
    }
  }
  return true;
}
console.log(checksort([1, 2, 3]));
console.log(checksort([1, 4, 3]));
console.log(checksort([4, 3, 2]));
console.log(
  checksort([4, 3, 2], function(a, b) {
    return b - a;
  })
);
