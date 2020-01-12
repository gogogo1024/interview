/*
 * @Author: snoy
 * @Email: jxycbjhc@163.com
 * @Date: 2020-01-11 21:32:13
 * @Last Modified by: snoy
 * @Last Modified time: 2020-01-11 21:53:15
 * @Description: Description
 */
// 简单的用了 new Array(n).fill(number) 用number 填充 长度为n的数组
"use strict";
function filledArray(item, n) {
  var ret = new Array(n);
  var isFn = typeof item === "function";
  if (!isFn && typeof ret.fill === "function") {
    return ret.fill(item);
  }
  for (var i = 0; i < n; i++) {
    ret[i] = isFn ? item(i, n) : item;
  }
  return ret;
}
console.log(filledArray("x", 3));

console.log(filledArray(0, 3));

console.log(
  filledArray(i => {
    return (++i % 3 ? "" : "Fizz") + (i % 5 ? "" : "Buzz") || i;
  }, 15)
);
//=> [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']
