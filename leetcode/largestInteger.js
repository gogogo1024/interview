/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-21 21:31:12
 * @modify date 2022-04-21 22:22:38
 * @desc [description]
 */


// 2231. 按奇偶性交换后的最大数字
// 给你一个正整数 num 。你可以交换 num 中 奇偶性 相同的任意两位数字（即，都是奇数或者偶数）。

// 返回交换 任意 次之后 num 的 最大 可能值。


// 示例 1：
// 输入：num = 1234
// 输出：3412
// 解释：交换数字 3 和数字 1 ，结果得到 3214 。
// 交换数字 2 和数字 4 ，结果得到 3412 。
// 注意，可能存在其他交换序列，但是可以证明 3412 是最大可能值。
// 注意，不能交换数字 4 和数字 1 ，因为它们奇偶性不同。
// 示例 2：

// 输入：num = 65875
// 输出：87655
// 解释：交换数字 8 和数字 6 ，结果得到 85675 。
// 交换数字 5 和数字 7 ，结果得到 87655 。
// 注意，可能存在其他交换序列，但是可以证明 87655 是最大可能值。


// 提示：

// 1 <= num <= 109
// 通过次数7, 858提交次数12, 596
/**
 * @param {number} num
 * @return {number}
 */
var largestInteger = function (num) {
    let arrayNumber = num.toString().split('').map(item => Number(item))
    let arr = getEvenOdd(arrayNumber)
    let evenArr = sortNumber(arr[0])
    let oddArr = sortNumber(arr[1])
    let len = arrayNumber.length
    let i = 0, j = 0;
    for (let index = 0; index < len; index++) {
        const element = arrayNumber[index];
        if (element % 2 == 0) {
            arrayNumber[index] = evenArr[i++]
        } else {
            arrayNumber[index] = oddArr[j++]
        }
    }

    return Number(arrayNumber.join(''))
};

/**
 * @param {array} num
 * @return {array}
 */
var getEvenOdd = (num) => {
    let even = [], odd = [];
    num.forEach(item => {
        if (item % 2 == 0) {
            even.push(item)
        } else {
            odd.push(item)
        }
    })
    return [even, odd]
}
var sortNumber = (num) => {
    return num.sort((a, b) => b - a)
}

let nums = [1234, 65875]
nums.forEach(item => {
    console.log(largestInteger(item))
})
