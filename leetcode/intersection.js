/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-29 21:58:23
 * @modify date 2022-04-29 22:46:56
 * @desc [description]
 */

// 2248. 多个数组求交集

// 给你一个二维整数数组nums，其中nums[i]是由不同正整数组成的一个非空数组，按升序排列 返回一个数组，数组中的每个元素在 nums 所有数组中都出现过。


// 示例 1：

// 输入：nums = [[3, 1, 2, 4, 5], [1, 2, 3, 4], [3, 4, 5, 6]]
// 输出：[3, 4]
// 解释：
// nums[0] = [3, 1, 2, 4, 5]，nums[1] = [1, 2, 3, 4]，nums[2] = [3, 4, 5, 6]，在nums中每个数组中都出现的数字是3和4 ，所以返回[3, 4] 。
// 示例 2：

// 输入：nums = [[1, 2, 3], [4, 5, 6]]
// 输出：[]
// 解释：
// 不存在同时出现在nums[0]和nums[1]的整数，所以返回一个空列表[] 。

// 提示：

// 1 <= nums.length <= 1000
// 1 <= sum(nums[i].length) <= 1000
// 1 <= nums[i][j] <= 1000
// nums[i] 中的所有值 互不相同

//记录录每个整数出现的次数，以 nums 为单位。由于 nums[i] 的所有整数都是不同的，因此如果每个数组中都存在一个整数，则其计数将等于数组的总数。

/**
 * @param {number[][]} nums
 * @return {number[]} num
 */
var intersection = function (nums) {
    let result = [];

    if (nums.length == 0) {
        return result
    }
    if (nums.length == 1) {
        result = nums[0]
    }
    if (nums.length >= 2) {
        let len = nums.length;
        let map = new Map();
        for (var i = 0; i < len; i++) {
            const element = nums[i];
            for (var j = 0; j < element.length; j++) {
                if (map.has(element[j])) {
                    const count = map.get(element[j])
                    map.set(element[j], count + 1);
                } else {
                    map.set(element[j], 1);
                }
            }
        }
        map.forEach(function (val, key) {
            if (val == len) {
                result.push(key)
            }
        })
    }
    result.sort((a, b) => a - b)
    return result
};
let nums = [[[3, 1, 2, 4, 5], [1, 2, 3, 4], [3, 4, 5, 6]], [[1, 2, 3], [4, 5, 6]], [[7, 34, 45, 10, 12, 27, 13], [27, 21, 45, 10, 12, 13]]]

nums.forEach(item => {
    console.log(intersection(item))
})