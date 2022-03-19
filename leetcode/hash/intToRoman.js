/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-03-19 22:44:34
 * @modify date 2022-03-19 22:44:35
 * @desc [description]
 */

/*
整数转罗马数字
罗马数字包含以下七种字符： I， V， X， L，C，D 和 M。
字符          数值
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
例如， 罗马数字 2 写做 II ，即为两个并列的 1。12 写做 XII ，即为 X + II 。 27 写做  XXVII, 即为 XX + V + II 。
通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 IX。
这个特殊的规则只适用于以下六种情况：
I 可以放在 V(5) 和 X(10) 的左边，来表示 4 和 9。
X 可以放在 L(50) 和 C(100) 的左边，来表示 40 和 90。 
C 可以放在 D(500) 和 M(1000) 的左边，来表示 400 和 900。
给你一个整数，将其转为罗马数字。

提示：
1 <= num <= 3999
*/


/**
 * @param {num} num
 * @return {string}
 */
var intToRoman = function (num) {
    if (num == 0) return ''
    const map = new Map([
        [1, 'I'],
        [4, 'IV'],
        [5, 'V'],
        [9, 'IX'],
        [10, 'X'],
        [40, 'XL'],
        [50, 'L'],
        [90, 'XC'],
        [100, 'C'],
        [400, 'CD'],
        [500, 'D'],
        [900, 'CM'],
        [1000, 'M'],
    ])

    if (map.get(num)) {
        return map.get(num)
    }
    if (num > 1 && num < 4) {
        return map.get(1).toString().repeat(num)
    }
    if (num > 5 && num < 9) {
        return 'V' + map.get(1).toString().repeat(num - 5)
    }
    if (num > 10 && num < 40) {
        return map.get(10).toString().repeat(num / 10) + intToRoman(num % 10)
    }
    if (num > 40 && num < 50) {
        return map.get(40).toString().repeat(num / 40) + intToRoman(num % 40)
    }
    if (num > 50 && num < 90) {
        return map.get(50).toString().repeat(num / 50) + intToRoman(num % 50)
    }
    if (num > 90 && num < 100) {
        return map.get(90).toString().repeat(num / 90) + intToRoman(num % 90)
    }
    if (num > 100 && num < 400) {
        return map.get(100).toString().repeat(num / 100) + intToRoman(num % 100)
    }
    if (num > 400 && num < 500) {
        return map.get(400).toString().repeat(num / 400) + intToRoman(num % 400)
    }
    if (num > 500 && num < 900) {
        return map.get(500).toString().repeat(num / 500) + intToRoman(num % 500)
    }
    if (num > 900 && num < 1000) {
        return map.get(900).toString().repeat(num / 900) + intToRoman(num % 900)
    }
    if (num > 1000) {
        return map.get(1000).toString().repeat(num / 1000) + intToRoman(num % 1000)
    }
};

var intToRomanUpdate = function (num) {
    // 通过数组索引找到对应的字符串。 关键 1 <= num <= 3999
    const thousands = ["", "M", "MM", "MMM"];
    const hundreds = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
    const tens = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
    const ones = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
    const roman = [];
    roman.push(thousands[Math.floor(num / 1000)]);
    roman.push(hundreds[Math.floor(num % 1000 / 100)]);
    roman.push(tens[Math.floor(num % 100 / 10)]);
    roman.push(ones[num % 10]);
    return roman.join('');
}
console.log(intToRoman(20))
console.log(intToRoman(4) == "IV")
console.log(intToRoman(9) == "IX")
console.log(intToRoman(58) == "LVIII")
console.log(intToRoman(1994) == "MCMXCIV")

console.log(intToRomanUpdate(20))
console.log(intToRomanUpdate(4) == "IV")
console.log(intToRomanUpdate(9) == "IX")
console.log(intToRomanUpdate(58) == "LVIII")
console.log(intToRomanUpdate(1994) == "MCMXCIV")
