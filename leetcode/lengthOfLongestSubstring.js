
// 给定一个字符串 s ，请你找出其中不含有重复字符的 最长子串 的长度。
// 示例 1:
// 输入: s = "abcabcbb"
// 输出: 3
// 解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。

// 示例 2:
// 输入: s = "bbbbb"
// 输出: 1
// 解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。

// 示例 3:
// 输入: s = "pwwkew"
// 输出: 3
// 解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
// 请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。

// 示例 4:
// 输入: s = ""
// 输出: 0

// 提示：
// 0 <= s.length <= 5 * 104
// s 由英文字母、数字、符号和空格组成

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
    const len = s.length;
    const set = new Set();
    // r 右指针， result最大的长度
    let rp = -1, result = 0;
    // i 充当左指针
    for (let i = 0; i < len; i++) {
        if (i != 0) {
            // 左指针向右移动一格，移除一个字符
            set.delete(s.charAt(i - 1))
        }
        while (rp + 1 < len && !set.has(s.charAt(rp + 1))) {
            // 不断地移动右指针
            set.add(s.charAt(rp + 1));
            ++rp;
        }
        // 第 i 到 rp 个字符是一个极长的无重复字符子串
        result = Math.max(result, rp - i + 1);
    }
    return result;
};
const ep1 = lengthOfLongestSubstring('abcabcbb');
console.log(ep1);
const ep2 = lengthOfLongestSubstring('bbbbb');
console.log(ep2);
const ep3 = lengthOfLongestSubstring('pwwkew');
console.log(ep3);
const ep4 = lengthOfLongestSubstring('');
console.log(ep4);
const ep5 = lengthOfLongestSubstring('dvdf');
console.log(ep5);