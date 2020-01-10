/*
 * @Author: snoy
 * @Email: jxycbjhc@163.com
 * @Date: 2020-01-06 10:02:07
 * @Last Modified by: snoy
 * @Last Modified time: 2020-01-06 10:06:51
 * @Description: Description
 */

//Recursively flatten an array or arrays.
"use strict";

module.exports = function(arr) {
  return flat(arr, []);
};

function flat(arr, res) {
  var i = 0,
    cur;
  var len = arr.length;
  for (; i < len; i++) {
    cur = arr[i];
    Array.isArray(cur) ? flat(cur, res) : res.push(cur);
  }
  return res;
}

var flatten = require("arr-flatten");

flatten(["a", ["b", ["c"]], "d", ["e"]]);
//=> ['a', 'b', 'c', 'd', 'e']
