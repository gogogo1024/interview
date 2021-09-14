/**
 * 查询两个字符串的最长相同字串的长度
 * 例子:
 *  LCS => longestCommonSubsequence 最长相同字串
 *  LCS for input Sequences “ABCDGH” and “AEDFHR” is “ADH” of length 3.
 *  LCS for input Sequences “AGGTAB” and “GXTXAYB” is “GTAB” of length 4.
 */

// 把两个长度分别为m,n的字符串分别装入 X[0..m-1], Y[0..n-1]
// 假设Lcs(X[0..m-1], Y[0..n-1])是这个X和Y的LCS
// 1. 如果最后一个字符不相等， Lcs(X[0,m - 1], Y[0,n - 1])=Max(Lcs(X[0,m-2),Y[0,n-1]),Lcs(X[0,m-1),Y[0,n-2]),
// 2. 如果最后一个字符相等， Lcs(X[0,m - 1], Y[0,n - 1])=1 + Lcs(X[0,m-2),Y[0,n-2])



/**
 * X和Y字符串的最长相同字串的长度
 * @param {*} X 字符串X
 * @param {*} Y 字符串Y
 * @param {*} m 字符串X右边界下标
 * @param {*} n 字符串Y右边界下标
 * @returns 
 */
function lcs(X, Y, m, n) {
    let L = new Array(m);
    // 构造一个 (m+1)*(n+1)的二维数组
    for (let index = 0; index < m+1; index++) {
        L[index] = new Array(n+1);
    }
    for (let i = 0; i <=m; i++) {
        for (let j =0; j <=n; j++) {
            // L[m][n] m或者n任意为0就是匹配0个字符串
            if (i == 0 || j == 0) {
                L[i][j] = 0;
            } else if (X[i - 1] == Y[j - 1]) {
                L[i][j] = L[i - 1][j - 1] + 1;
            }
            else {
                L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]);
            }
        }
    }
    // L[m][n]就是累加的相同字符串长度
    return L[m][n];
}

const x = "AGGTAB", y = "GXTXAYB";
const m = x.length, n = y.length;
const len = lcs(x, y, m, n);
console.log(`Length of LCS is : ${len}`);