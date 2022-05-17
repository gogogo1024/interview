/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-05-18 03:12:13
 * @modify date 2022-05-18 03:30:12
 * @desc [description]
 */

const { sleepTimeout } = require("./util");

/**
 * 令牌桶 (一个设定的速率rateOfMilliseconds产生令牌并放入容量为capacity的令牌桶，每次请求applyNumber个令牌，
 * 如果令牌不足，则拒绝请求。
 * 令牌桶算法中新请求到来时会从桶里拿走一个令牌，如果桶内没有令牌可拿，就拒绝服务。当然，
 * 令牌的数量也是有上限的。令牌的数量与时间和发放速率强相关，时间流逝的时间越长，会不断往桶里加入越多的令牌
 * 实际场景中会令current等于桶容量，保证在启动瞬间的令牌请求不至于拒绝用户
 * @param {*} capacity 桶的容量
 * @param {*} rateOfMilliseconds 令牌生成的速度每毫秒多少个
 * @returns 
 */
function tokenBucket(capacity = 100, rateOfMilliseconds = 10, applyNumber = 10) {
    let current = 0, lastTime = Date.now();
    return function () {
        let now = Date.now();
        let generateToken = Math.floor((now - lastTime) * rateOfMilliseconds / 1000);
        current = Math.min(capacity, current + generateToken);
        if (current < applyNumber) {
            return false;
        } else {
            current = current - applyNumber;
            lastTime = Date.now();
            return true;
        }
    }
}

const tb = tokenBucket();
(async () => {
    while (true) {
        const randomTime = Math.floor(Math.random() * 10000)
        await sleepTimeout(randomTime)
        const flag = tb()
        console.log(flag)
    }
})()