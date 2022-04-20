/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-21 01:19:32
 * @modify date 2022-04-21 02:31:49
 * @desc [description]
 */

/**
 * @param {string} s
 * @param {string[]} words
 * @return {number[]}
 */
var findSubstring = function (s, words) {
    if (s.length == 0 || words.length == 0) return []
    let sLen = s.length, wLen = words.length, oneWordLen = words[0].length;
    let obj = Object.create(null);
    words.forEach(item => {
        if (obj[item]) {
            obj[item] = obj[item] + 1
        } else {
            obj[item] = 1
        }
    })

    let result = []
    for (let i = 0; i < sLen;) {
        let flag = true
        let _obj = Object.assign({}, obj);
        for (let j = 0; j < wLen && (i + (wLen - 1) * oneWordLen) < sLen; j++) {
            // for (let j = 0; j < wLen; j++) {

            const wd = s.slice(i + j * oneWordLen, i + (j + 1) * oneWordLen)
            if (!obj[wd]) {
                i++
                flag = false
                break;
            } else {
                _obj[wd] = _obj[wd] > 0 ? _obj[wd] - 1 : _obj[wd]
                if (_obj[wd] == 0) {
                    delete _obj[wd]
                }
            }
        }
        if (flag == true) {
            if (Object.keys(_obj).length == 0) {
                result.push(i)
            }
            i = i + 1
        }
    }
    return result;
};
let arr = [
    {
        s: "barfoothefoobarman",
        words: ["foo", "bar"]
    },
    {
        s: "wordgoodgoodgoodbestword",
        words: ["word", "good", "best", "word"]
    },
    {
        s: "barfoofoobarthefoobarman",
        words: ["bar", "foo", "the"]
    },
    {
        s: "lingmindraboofooowingdingbarrwingmonkeypoundcake",
        words: ["fooo", "barr", "wing", "ding", "wing"]
    },
    {
        s: "a",
        words: ["a"]
    },
    {
        s: "aaaaaaaaaaaaaa",
        words: ["aa", "aa"]
    }
];

console.time('test')
for (let index = 0; index < arr.length; index++) {
    console.log(findSubstring(arr[index]['s'], arr[index]['words']))
}
console.timeEnd('test')
