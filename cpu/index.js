const Sort = require("./merge");

var total = 100000; // 可修改数组个数
var total = 100000;
var index = total - 1;
var ary = new Array(total);
for (var i = 0; i < total; ++i) {
  ary[i] = total - i;
}
//动态链接库
var addon = require("./build/Release/merge");
var begin = new Date().getTime();
addon.merge(ary, 0, total - 1);
console.info(new Date().getTime() - begin);
begin = new Date().getTime();
Sort.mergeSort(ary, 0, index);
console.info(new Date().getTime() - begin);
// node v12 可以参考下面
// Using worker_threads in Node.js
//https://medium.com/@Trott/using-worker-threads-in-node-js-80494136dbb6
