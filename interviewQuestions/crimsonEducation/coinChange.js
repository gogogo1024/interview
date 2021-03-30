/**
 * 
 * @param {*} number 拼凑数字之和
 * @param {*} array  可用的数组
 * @param {*} m 数组长度
 * @returns 利用可用数组array一共有多少种组合能拼凑出number
 */
function countChange(number, array, m = array.length) {
    // 拼凑数字之和
    if (number == 0) {
        return 1;
    }

    if (number < 0) {
        return 0;
    }

    // 如果数组长度为0，拼凑出的数字大于等于1，明显是不可能的
    if (m <= 0 && number >= 1) {
        return 0;
    }


    // 能够拼凑出来number的组合有下面两种情况
    // 1. 包含数组最后一个数字 countChange(number - array[m - 1], array, m)
    // 2. 不包含数组最后一个数字 countChange(number, array, m - 1)

    return countChange(number, array, m - 1) +
        countChange(number - array[m - 1], array, m);
}

const result = countChange(4, [1, 2]);
console.log(result);