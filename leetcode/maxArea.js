/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-05 23:36:49
 * @modify date 2022-04-06 14:24:12
 * @desc [description]
 */


/**
 * 给定一个长度为 n 的整数数组 height 。有 n 条垂线，第 i 条线的两个端点是(i, 0) 和(i, height[i]) 。
 * 找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。
 * 返回容器可以储存的最大水量。
 * 说明：你不能倾斜容器。

eg1:

输入：[1,8,6,2,5,4,8,3,7]
输出：49 
解释：图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。

eg2：

输入：height = [1,1]
输出：1

提示：
n == height.length
2 <= n <= 105
0 <= height[i] <= 104
* /

/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function (height) {
    const len = height.length;
    let left = 0
    let right = len - 1;
    let area = 0, maxArea = Number.MIN_VALUE
    while (left < right) {
        if (height[left] <= height[right]) {
            area = height[left] * (right - left);
            left++
        } else {
            area = height[right] * (right - left);
            right--
        }
        maxArea = Math.max(maxArea, area)
    }
    return maxArea
};

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))

console.log(maxArea([1, 1]))