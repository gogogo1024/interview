
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

// 我们选择字符串中的第 k个字符作为起始位置，并且得到了不包含重复字符的最长子串的结束位置为 rp 
// 那么当我们选择第 k + 1个字符作为起始位置时，首先从 k + 1到 rp的字符显然是不重复的，
//并且由于少了原本的第 k 个字符，我们可以尝试继续增大rp直到右侧出现了重复字符为止。



/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
    let len = s.length;
    let set = new Set();
    let rp = -1, result = 0;
    for (let i = 0; i < len; i++) {
        if (i != 0) {
            set.delete(s.charAt(i - 1))
        }
        while (rp + 1 < len && !set.has(s.charAt(rp + 1))) {
            set.add(s.charAt(rp + 1))
            rp++
        }
        result = Math.max(result, rp - i + 1)
    }
    return result
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