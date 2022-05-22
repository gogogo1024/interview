/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-05-22 13:43:49
 * @modify date 2022-05-22 18:56:59
 * @desc [description]
 */

const { sleepTimeout } = require("./util");


// 缺点：1. 当突增的流量在时间段的边界处，比如1:00:01前后100ms有12个请求，违反了每秒中10个请求的要求
//      下图所示
//       【1:00:00:100】【1:00:00:900】【1:00:01:000】【1:00:01:100】【1:00:01:900】【1:00:02:000】
//            0               9              2             1            2             5


/**
 * 固定窗口计数
 * @param {*} rateOfSeconds 允许通过的最大请求每秒多少个
 * @returns 
 */
function fixWindowCounter(rateOfSeconds = 10) {
    let current = 0, lastTime = Date.now();
    return function () {
        console.log(`current:${current}`)
        if (current == 0) {
            current++;
            lastTime = Date.now();
            return true
        }
        const now = Date.now();
        console.log(`now:${now}`)
        // 时间过去了多少毫秒
        console.log(`lastTime:${lastTime}`)

        let timePast = Math.floor(now - lastTime);
        console.log(timePast)

        if (timePast > 1000) {
            current = 1;
            lastTime = Date.now();
            return true
        } else {
            current++;
            return current <= rateOfSeconds

        }
    }
}

// 正好是每100毫秒一个请求过来，因此能看到输出连续10个true,
const lb = fixWindowCounter();
(async () => {
    let count = 0
    while (true) {
        await sleepTimeout(50)
        const flag = lb()
        console.log(flag)
        count++;
        if (count > 30) {
            break
        }

    }
})()





