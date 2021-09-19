// 给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。
// 如果反转后整数超过 32 位的有符号整数的范围[−231, 231 − 1] ，就返回 0。
// 假设环境不允许存储 64 位整数（有符号或无符号）。
// 示例 1：
// 输入：x = 123
// 输出：321

// 示例 2：
// 输入：x = -123
// 输出：-321

// 示例 3：
// 输入：x = 120
// 输出：21
// 示例 4：

// 输入：x = 0
// 输出：0

// 提示：
// -Math.pow(2,31) <= x <= Math.pow(2,31) - 1


/**
 * @param {number} x 输入数字
 * @return {number} 反转后的字符串
 */
var reverse = function (x) {
    let max = Math.pow(2, 31) - 1;
    let min = -Math.pow(2, 31);
    let next = 0;
    while (x != 0) {
        if (x > 0 && next > (max - x % 10) / 10) {
            return 0;
        }
        if (x < 0 && next < (min - x % 10) / 10) {
            return 0;
        }
        next = next * 10 + x % 10;
        x = parseInt(x / 10);
    }
    return next;
};
console.log(reverse(-124));