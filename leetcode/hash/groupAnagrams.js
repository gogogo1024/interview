/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-06-15 17:45:07
 * @modify date 2022-06-15 18:25:45
 * @desc [description]
 */

// 给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。

// 字母异位词 是由重新排列源单词的字母得到的一个新单词，所有源单词中的字母通常恰好只用一次。

//  

// 示例 1:

// 输入: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
// 输出: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]
// 示例 2:

// 输入: strs = [""]
// 输出: [[""]]
// 示例 3:

// 输入: strs = ["a"]
// 输出: [["a"]]


// 提示：

// 1 <= strs.length <= 104
// 0 <= strs[i].length <= 100
// strs[i] 仅包含小写字母


/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
    const map = new Object();
    let countString = ""
    for (let s of strs) {
        // 考虑如果有大小写字母，因此只需要长度为52的数组
        const count = new Array(52).fill(0);
        for (let c of s) {
            count[c.charCodeAt(0) - 'A'.charCodeAt(0)]++;
        }
        countString = count.toString();
        map[countString] ? map[countString].push(s) : map[countString] = [s];
    }
    return Object.values(map);
};
const strs1 = ["eat", "tea", "tan", "ate", "nat", "bat"]
const strs2 = ["eAt", "eat", "teA", "tan", "ate", "nat", "bat"]
const str3 = ["nozzle", "punjabi", "waterlogged", "imprison", "crux", "numismatists",
    "sultans", "rambles", "deprecating", "aware", "outfield", "marlborough", "guardrooms", "roast", "wattage",
    "shortcuts", "confidential", "reprint", "foxtrot", "dispossession",
    "dippers", "engrossing", "undertakings", "unforeseen", "oscilloscopes", "pioneers",
    "geller", "neglects", "cultivates", "mantegna", "elicit", "couriered", "shielded", "shrew",
    "heartening", "lucks", "teammates", "jewishness", "documentaries", "subliming", "sultan", "redo",
    "recopy", "flippancy", "rothko", "conductor", "e", "carolingian", "outmanoeuvres", "gewgaw", "saki",
    "sarah", "snooping"]
// console.log(groupAnagrams(strs1))
// console.log(groupAnagrams(strs2))
console.log(groupAnagrams(str3))

