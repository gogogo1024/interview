/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-06-14 20:24:27
 * @modify date 2022-06-15 12:28:54
 * @desc [description]
 */

// 给你一个未排序的整数数组 nums ，请你找出其中没有出现的最小的正整数。

// 请你实现时间复杂度为 O(n) 并且只使用常数级别额外空间的解决方案。
//  

// 示例 1：

// 输入：nums = [1, 2, 0]
// 输出：3
// 示例 2：

// 输入：nums = [3, 4, -1, 1]
// 输出：2
// 示例 3：

// 输入：nums = [7, 8, 9, 11, 12]
// 输出：1

// 提示：
// 1 <= nums.length <= 5 * 105
// - 2^31 <= nums[i] <= 231 - 1

/**
 * @param {number[]} nums
 * @return {number}
 */
// var firstMissingPositive = function (nums) {
//     let result = 1, oneExist = 0;
//     if (!Array.isArray(nums) || nums.length === 0) {
//         return 1
//     }
//     nums.forEach(item => {
//         if (item == result) {
//             result++;
//         }
//     })
//     return result;

// };
// [[1, 2, 0], [1, 3, 2, 0]].forEach(item => {
//     console.log(firstMissingPositive(item))

// })
