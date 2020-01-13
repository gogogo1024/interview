const toString = Object.prototype.toString;
// 只捕获后面
// 正则
//developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/n
objectRegExp = /^\[object (\S+)\]$/;

function getType(obj) {
  var type = typeof obj;

  if (type !== "object") {
    return type;
  }

  https: return toString.call(obj).replace(objectRegExp, "$1");
}
console.log(getType(""));
console.log(getType(null));
console.log(getType(undefined));
console.log(getType({}));
console.log(getType("nike"));
console.log(getType(123));
console.log(getType(true));
console.log(getType(new Function("h")));
