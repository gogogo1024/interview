/**
 * @author [gogogo1024]
 * @email [jxycbjhc@gmail.com]
 * @create date 2023-05-06 10:33:16
 * @modify date 2023-05-06 15:51:56
 * @desc [description]
 */
/**
 * 给定m*n矩阵，🤖️从左上角移动到右下角，🤖️只能向右或者向下移动，有多少种方式？
 * f[i][j] 表示🤖️从左上角移动到矩阵A[i][j]位置，有f[i][j]种方式
 * f[i][j] = f[i-1][j] + f[i][j-1]
 * 当 i== 0 || j== 0 时 f[i][j]= 1,代表🤖️是沿着边界移动，只有一种移动方式
 * 
 */
function uniquePaths(m, n) {
    let f = Array.from(Array(m)).map(() => Array(n).fill(0))
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i == 0 || j == 0) {
                f[i][j] = 1
            } else {
                f[i][j] = f[i][j - 1] + f[i - 1][j]
            }
        }
    }
    return f[m - 1][n - 1]
}
console.log(uniquePaths(3, 1))
console.log(uniquePaths(3, 2))
