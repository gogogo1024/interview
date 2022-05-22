/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-05-18 03:12:13
 * @modify date 2022-05-22 12:48:46
 * @desc [description]
 */


// 优点：应对短时间的流量激增场景
// 缺点：桶大小和令牌的放入速率是固定的，所以调整到合适的值比较难
// 1.如果一个用户被限制每秒发送一个帖子，每天添加100个好友，点赞100帖子，那就需要三个不同的tokenBucket
// 2.如果对于请求的限制是基于ip，那每一个ip都需要一个tokenBucket
// 3.如果是应用系统只允许每秒10000个请求，那这种一般就放在应用系统的前置网关

const { sleepTimeout } = require("./util");

/**
 * 令牌桶 (一个设定的速率rateOfMilliseconds产生令牌并放入容量为capacity的令牌桶，请求applyNumber个令牌，
 * 如果令牌不足，则拒绝请求。
 * 令牌桶算法中新请求到来时会从桶里拿走一个令牌，如果桶内没有令牌可拿，就拒绝服务。当然，
 * 令牌的数量也是有上限的。令牌的数量与时间和发放速率强相关，时间流逝的时间越长，会不断往桶里加入越多的令牌
 * 实际场景中会令初始current等于桶容量，保证在启动瞬间的令牌请求不至于拒绝用户
 * @param {*} capacity 桶的容量
 * @param {*} rateOfMilliseconds 令牌生成的速度每毫秒多少个
 * @returns 
 */
function tokenBucket(capacity = 100, rateOfMilliseconds = 10, applyNumber = 1) {
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