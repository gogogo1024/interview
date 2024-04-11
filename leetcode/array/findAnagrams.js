var findAnagrams = function (s, p) {
    const sLen = s.length, pLen = p.length;

    if (sLen < pLen) {
        return [];
    }

    const ans = [];
    // 存储字符串中对应字符个数
    const sCount = new Array(26).fill(0);
    const pCount = new Array(26).fill(0);
    for (let i = 0; i < pLen; ++i) {
        ++sCount[s[i].charCodeAt(0) - 'a'.charCodeAt(0)];
        ++pCount[p[i].charCodeAt(0) - 'a'.charCodeAt(0)];
    }

    if (sCount.toString() === pCount.toString()) {
        ans.push(0);
    }

    for (let i = 0; i < sLen - pLen; ++i) {
        // 移动滑动窗口
        --sCount[s[i].charCodeAt(0) - 'a'.charCodeAt(0)];
        ++sCount[s[i + pLen].charCodeAt(0) - 'a'.charCodeAt(0)];

        if (sCount.toString() === pCount.toString()) {
            ans.push(i + 1);
        }
    }

    return ans;
};

const arr = [{
    s: "cbaebabacd", p: "abc"
}, {
    s: "abab", p: "ab"
}]

console.time('test')
for (let index = 0; index < arr.length; index++) {
    console.log(findAnagrams(arr[index]['s'], arr[index]['p']))
}
console.timeEnd('test')