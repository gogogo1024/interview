// 1. 实现函数_curry(fn)使之具有以下功能：fn是一个二元函数，fn(a, b,c)，
// const _fn = _curry(fn);
//_fn(a)(b)(c) 的结果和 fn(a, b, c)的结果一致
//  两种写法
// 第一种
function curry(f) {
  return function(a) {
    return function(b) {
      return function(c) {
        return f(a, b, c);
      };
    };
  };
}
// 第二种 箭头函数
const _curry = f => a => b => c => f(a, b, c);
//  推广到一般 fn是一个多元函数，fn(a,b,c ...)
function recursive(fn, ...args) {
  if (args.length >= fn.length) {
    return fn(...args);
  }
  return function(...args2) {
    return recursive(fn, ...args, ...args2);
  };
}
function sum(a, b, c) {
  return a + b + c;
}
console.log(curry(sum)(1)(3)(6));
console.log(_curry(sum)(1)(4)(7));
let curryFunc = recursive(sum)(1)(2);
console.log(curryFunc(3));

//2. 实现简单的解析请求参数
// stringfy 实现
// {
//   foo: "bar",             ==>   "foo=bar&abc=xyz&abc=123"
//   abc: ["xyz", "123"]
// }
// parse 实现正好和stringfy相反
function queryString() {}

queryString.prototype.stringify = function(obj) {
  obj = obj || {};
  const keys = Object.keys(obj);
  let str = "";
  keys.forEach(key => {
    if (typeof obj[key] === "string") {
      str += "&" + key + "=" + obj[key];
    } else if (obj[key] instanceof Array) {
      obj[key].forEach(ar => {
        str += "&" + key + "=" + ar;
      });
    }
  });
  if (str) {
    str = str.slice(1);
  }
  return str;
};
queryString.prototype.parse = function(str) {
  const obj = {};
  if (typeof str === "string") {
    str = str.split("&");
    str.forEach(item => {
      const keyValueArr = item.split("=");
      const key = keyValueArr[0];
      const value = keyValueArr[1];
      const arr = [];
      if (!obj[key]) {
        arr.push(value);
        obj[key] = arr;
      } else {
        obj[key].push(value);
      }
    });
    const keys = Object.keys(obj);
    keys.forEach(key => {
      if (obj[key].length === 1) {
        obj[key] = obj[key].join();
      }
    });
    return obj;
  }
};
const qs = new queryString();
const obj = qs.parse("foo=bar&abc=xyz&abc=123");

console.log(JSON.stringify(obj, null, 2));
const str = qs.stringify({
  foo: "bar",
  abc: ["xyz", "123"]
});
console.log(str);

// 3 实现flatten函数 null 和 undefined 丢弃
// 受onelineModules中arr-flatten的影响
// 输入
// {
//   a: 1,
//   b: [1, 2, { c: true }, [3]],
//   d: { e: 2, f: 3 },
//   g: null
// };
// 输出
//     {
//       "a": 1,
//       "b[0]": 1,
//       "b[1]": 2,
//       "b[2].c": true,
//       "b[3][0]": 3,
//       "d.e": 2,
//       "d.f": 3,
//       // "g": null,  值为null或者undefined，丢弃
//    }
function flatten(input) {
  return flat(input, "", {});
}
function flat(input, outerKey, res) {
  if (input && input instanceof Array) {
    for (let index = 0; index < input.length; index++) {
      const element = input[index];
      if (
        typeof element === "number" ||
        typeof element === "string" ||
        typeof element === "boolean"
      ) {
        res[outerKey + "[" + index + "]"] = element;
      } else {
        flat(element, outerKey + "[" + index + "]", res);
      }
    }
  } else if (input && typeof input === "object" && !(input instanceof Array)) {
    const keys = Object.keys(input);
    keys.forEach(key => {
      if (
        typeof input[key] === "number" ||
        typeof input[key] === "string" ||
        typeof input[key] === "boolean"
      ) {
        if (outerKey) {
          res[outerKey + "." + key] = input[key];
        } else {
          res[key] = input[key];
        }
      } else {
        flat(input[key], key, res);
      }
    });
  }
  return res;
}
var input = {
  a: 1,
  b: [1, 2, { c: true }, [3]],
  d: { e: 2, f: 3 },
  g: null
};
const output = flatten(input);
console.log(JSON.stringify(output, null, 2));
