var total = 100000000; // 可修改数组个数
var ary = new Array(total);
for (var i = 0; i < total; ++i) {
  ary[i] = total - i;
}
//动态链接库
var addon = require("./build/Release/merge");
var begin = new Date().getTime();
addon.merge(ary, 0, total - 1);
console.info(new Date().getTime() - begin);
