/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-05-18 02:04:02
 * @modify date 2022-05-22 12:49:20
 * @desc [description]
 */

const { sleepTimeout } = require("./util");


// 优点：能够已固定处理速率来应对请求
// 缺点：1. 当突增的流量会导致请求迅速堵满桶容量，导致后续的请求被丢弃，
//      2. 并且桶大小和令牌的流出速率是固定的，所以调整到合适的值比较难

/**
 * 漏桶（往固定容量为capacity桶中以任意速率流入水，
 * 以一定速率rateOfMilliseconds流出水，当水超过桶容量（capacity）则丢弃，因为桶容量是不变的，保证了整体的速率）
 * @param {*} capacity 桶的容量
 * @param {*} rateOfMilliseconds 令牌生成的速度每毫秒多少个
 * @returns 
 */
function leakBucket(capacity = 100, rateOfMilliseconds = 10) {
    let current = 0, lastTime = Date.now();
    return function () {
        if (current == 0) {
            current += 1;
            lastTime = Date.now();
            return true
        }
        let leak = Math.floor((Date.now() - lastTime) * rateOfMilliseconds / 1000);
        let left = current - leak;
        current = Math.max(0, left)
        lastTime = Date.now();
        if (current < capacity) {
            current += 1;
            return true
        } else {
            return false
        }
    }
}

const lb = leakBucket();
(async () => {
    while (true) {
        const randomTime = Math.floor(Math.random() * 10000)
        await sleepTimeout(randomTime)
        const flag = lb()
        console.log(flag)
    }
})()





