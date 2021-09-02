/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-09-02 16:04:58
 * @modify date 2021-09-02 16:05:06
 * @desc [description] 限流措施算法
 */


/**
 * 滑动窗口
 */
function sliderWindow() {
    const arr = [];
    // 这一块可以设计成定时器，redis存储这些hash
    // 代码只做针对不同触发条件判定
    setInterval(function () {
        // 获取当前的请求详情
        const flow = { success: 10, failed: 10, timeout: 10, rejected: 10 };
        if (arr.length < 10) {
            arr.push(flow);
        } else if (arr.length == 10) {
            arr.shift();
            arr.push(flow)
        }
        // 统计arr中分类总数
        let flowSuccess = 0, flowFailed = 0, flowTimeout = 0, flowRejected = 0;
        arr.map(item => {
            flowSuccess += item.success;
            flowFailed += item.failed;
            flowTimeout += item.timeout;
            flowRejected += item.rejected;
        })
    }, 1000)
}
sliderWindow();
/**
 * 令牌桶
 * @param {*} capacity 桶容量
 * @param {*} rate 令牌的存入速度
 * @param {*} lastAcquire 上一次获取令牌的时间
 * @param {*} leftToken 上一次剩余令牌
 * @returns true获取到令牌，false没有获取到
 */
function bucketToken(capacity = 1000, rate = 10, lastAcquire = Date.now(), leftToken =0) {
    let now = Date.now();
    leftToken = Math.min(leftToken + (now - lastAcquire) * rate, capacity);
    if (leftToken>=1) {
        leftToken--;
        lastAcquire = now;
        return true;
    }
    return false;
}