// 1. sleep函数 实现等待time时间执行

var sleep = function(time) {
  return new Promise(resolve => setTimeout(resolve, time));
};
async function test() {
  await sleep(2000);
  console.log("print after 2s");
  await sleep(3000);
  console.log("print after 3s");
}
test().then();
// 2.retryTask 实现延迟delay执行times次 task
//  function retryTask(task, delay, times);
// retryTask(()=> Promise.resolve(10),1000,10).then((res) => {console.log('res:',res));
// task1 = () => Promise.resolve(10);
// function sleep(fn, delay) {
//   return new Promise(resolve => {
//     setTimeout(resolve(fn), delay);
//   });
// }
 function retryTask(task,delay,times){
   return new Promise(resolve =>{
     let count = 0;
     if (count < times) {
      resolve(task);
      await sleep(delay);
     }else{
       resolve()
     }
   })
 }
// async function retryTask(task, delay, times) {
//   if (times > 0) {
//     // const result = await sleep(task, delay).catch(e => e);
//     const result = await sleep(task, delay);

//     if (result === "Error") {
//       return await retryTask(task, delay, times - 1);
//     }
//     return result;
//   }
//   return `Tried ${times} times and failed`;
// }

// retryTask(task1, 1000, 3).then(res => {
//   console.log("res:", res);
// });
if (!Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(
      promises.map(p =>
        Promise.resolve(p).then(
          value => ({
            state: "fulfilled",
            value
          }),
          reason => ({
            state: "rejected",
            reason
          })
        )
      )
    );
  };
}
function promisify(f) {
  return function(...args) {
    // return a wrapper-function
    return new Promise((resolve, reject) => {
      function callback(err, result) {
        // our custom callback for f
        if (err) {
          return reject(err);
        } else {
          resolve(result);
        }
      }
      args.push(callback); // append our custom callback to the end of f arguments
      f.call(this, ...args); // call the original function
    });
  };
}


