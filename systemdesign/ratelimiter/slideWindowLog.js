/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-05-22 18:43:39
 * @modify date 2022-05-22 23:41:55
 * @desc [description]
 */


const { sleepTimeout } = require("./util");


// 缺点：1. redis需要大量的删除操作，score set
//      下图所示
//       【1:00:01】【1:00:30】【1:00:50】【1:01:40】
//            1        1          1           1     

/**
 * 滑动窗口日志
 * @param {*} rateOfMinutes 允许通过的最大请求每分钟多少个
 */
function slideWindowLog(rateOfMinutes = 2) {
    let redisSimulator = [];
    return function () {
        const now = Date.now();
        console.log(`now:${now}`)
        redisSimulator.push(now);
        console.log(`before redisSimulator:${redisSimulator}`)


        let lastIndex = 0;
        for (let index = 0; index < redisSimulator.length; index++) {
            const element = redisSimulator[index];
            if (element + 60000 >= now) {
                lastIndex = index;
                break;
            }
        }
        if (lastIndex > 0) {
            redisSimulator.splice(lastIndex);
            console.log(`after redisSimulator:${redisSimulator}`)
        }

        if (redisSimulator.length <= rateOfMinutes) {
            return true;
        } else {
            return false;
        }
    }
}

const lb = slideWindowLog();
(async () => {
    const now = Date.now();
    console.log(`now:${now}`)


    let flag = lb()
    console.log(flag)

    await sleepTimeout(29000)
    flag = lb()
    console.log(flag)

    await sleepTimeout(20000)
    flag = lb()
    console.log(flag)

    await sleepTimeout(50000)
    flag = lb()
    console.log(flag)

})()





