/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-01 02:57:17
 * @modify date 2022-04-01 19:27:12
 * @desc [description]
 */

/**
 * 
 * 给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按 任意顺序 返回。

给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。
示例 1：

输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]
示例 2：

输入：digits = ""
输出：[]
示例 3：

输入：digits = "2"
输出：["a","b","c"]
 

提示：

0 <= digits.length <= 4
digits[i] 是范围 ['2', '9'] 的一个数字。


 */
const phoneMap = new Map([
    ['2', "abc"],
    ['3', "def"],
    ['4', "ghi"],
    ['5', "jkl"],
    ['6', "mno"],
    ['7', "pqrs"],
    ['8', "tuv"],
    ['9', "wxyz"],
])

let combinations = []

/**
 * @param {string} digits
 * @return {string[]}
 */
function letterCombinations(digits) {
    if (digits.length == 0) {
        return []
    }
    combinations = []
    backtrack(digits, 0, "")
    return combinations
}

function backtrack(digits, index, combination) {
    if (index == digits.length) {
        combinations.push(combination)
    } else {
        let digit = digits[index]
        let letters = phoneMap.get(digit)
        let lettersCount = letters.length
        for (let i = 0; i < lettersCount; i++) {
            backtrack(digits, index + 1, combination + letters[i])
        }
    }
}
console.log(letterCombinations('23'))
console.log(letterCombinations(''))
console.log(letterCombinations('2'))
console.log(letterCombinations('234'))




