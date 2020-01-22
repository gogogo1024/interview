/*
 * @Author: snoy
 * @Email: jxycbjhc@163.com
 * @Date: 2020-01-14 22:44:52
 * @Last Modified by: snoy
 * @Last Modified time: 2020-01-21 23:29:42
 * @Description: Description
 */

// 了解express中间件next的机制

var http = require("http");

/**
 * 仿express实现中间件机制
 *
 * @return {app}
 */
function express() {
  var funcs = []; // 待执行的函数数组

  var app = function(req, res) {
    var i = 0;

    function next() {
      var task = funcs[i++]; // 取出函数数组里的下一个函数
      if (!task) {
        // 如果函数不存在,return
        return;
      }
      task(req, res, next); // 否则,执行下一个函数
    }

    next();
  };

  /**
   * use方法就是把函数添加到函数数组中
   * @param task
   */
  app.use = function(task) {
    funcs.push(task);
  };

  return app; // 返回实例
}

// 下面是测试case

var app = express();
// 正常的是一个匿名函数执行，所以app中next()执行了
// const server = http.createServer((req, res) => {
//res is an http.ServerResponse object
// });

http.createServer(app).listen("3000", function() {
  console.log("listening 3000....");
});

function middlewareA(req, res, next) {
  console.log("middlewareA before next()");
  next();
  console.log("middlewareA after next()");
}

function middlewareB(req, res, next) {
  console.log("middlewareB before next()");
  next();
  console.log("middlewareB after next()");
}

function middlewareC(req, res, next) {
  console.log("middlewareC before next()");
  next();
  console.log("middlewareC after next()");
}

app.use(middlewareA);
app.use(middlewareB);
app.use(middlewareC);
