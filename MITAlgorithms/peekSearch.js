/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-09-08 11:22:21
 * @modify date 2021-09-08 15:12:13
 * @desc [description]
 */


//输入数组 nums，找到峰值元素并返回其索引。数组可能包含多个峰值，在这种情况下，返回任何一个峰值所在位置即可

/**
 * 分治算法
 * 首先看 n/2 位置，然后与它做左边的数作对比，再与它右边的数作对比
 * 如果 a[n/2] < a[n/2-1] ，那么只需要在左半边查找峰值，即： 1 ~ n/2-1 范围内
 * 如果 a[n/2] < a[n/2+1] ，那么只需要在右半边查找峰值，即： n/2+1 ~ n 范围内
 * 如果上面两个条件都不满足，查找结束， a[n/2] 位置的元素就是我们要找的「峰值」
 * @param {*} nums 全为数字的数组
 * @returns 数组内zhi
 */
function searchOnePeek(nums) {
    if (!Array.isArray(nums) || nums.length === 0) {
        return;
    }
    const len = nums.length;
    if (nums[Math.floor(len / 2)] < nums[Math.floor(len / 2) + 1]) {
        nums = nums.slice(Math.floor(len / 2) + 1);
        return searchOnePeek(nums);
    } else if (nums[Math.floor(len / 2)] < nums[Math.floor(len / 2) - 1]) {
        nums = nums.slice(0, Math.floor(len / 2) - 1);
        return searchOnePeek(nums)
    } else {
        return nums[Math.floor(len / 2)]
    }
}
const peek = searchOnePeek([1, 2, 3, 4, 5, 6, 4, 3, 1]);
console.log(peek);