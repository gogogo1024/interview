/**
 * 动态规划处理用最少硬币数凑齐目标钱数
 * @param {*} coinArr  硬币的种类
 * @param {*} target   目标钱数
 * @returns 
 */
function coinChange(coinArr, target) {

    let f = new Array(target + 1);
    let len = coinArr.length;
    f[0] = 0;
    for (let i = 1; i <= target; i++) {
        f[i] = Number.MAX_VALUE;
        for (let j = 0; j < len; j++) {
            if (i >= coinArr[j] && f[i - coinArr[j]] != Number.MAX_VALUE) {
                f[i] = Math.min(f[i - coinArr[j]] + 1, f[i])
            }
        }
    }
    if (f[target] == Number.MAX_VALUE) {
        f[target] = -1;
    }
    return f[target];


}
console.log(coinChange([1, 2, 5], 27));