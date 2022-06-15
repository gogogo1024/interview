/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-06-15 12:29:05
 * @modify date 2022-06-15 12:32:27
 * @desc [description]
 */

// 给定一个 m x n 的矩阵，如果一个元素为 0 ，则将其所在行和列的所有元素都设为 0 。请使用 原地 算法。

// 示例 1：

// 输入：matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
// 输出：[[1, 0, 1], [0, 0, 0], [1, 0, 1]]
// 示例 2：

// 输入：matrix = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]
// 输出：[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]

// 提示：

// m == matrix.length
// n == matrix[0].length
// 1 <= m, n <= 200
//     - 231 <= matrix[i][j] <= 231 - 1


// 进阶：

// 一个直观的解决方案是使用  O(mn) 的额外空间，但这并不是一个好的解决方案。
// 一个简单的改进方案是使用 O(m + n) 的额外空间，但这仍然不是最好的解决方案。
// 你能想出一个仅使用常量空间的解决方案吗？

/**
 * @param {number[][]} matrix
 * @return {number[][]} Do not return anything, modify matrix in-place instead.
 */
var setZeroes = function (matrix) {
    // m 行 n 列 矩阵 
    const m = matrix.length, n = matrix[0].length;
    // 长度为m全标记为false表示m行
    // 长度为n全标记为false表示n列
    const row = new Array(m).fill(false);
    const col = new Array(n).fill(false);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            // 第i行j列如果为0，则第i行，第j列都标识为true
            if (matrix[i][j] === 0) {
                row[i] = col[j] = true;
            }
        }
    }
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            // 当第i行或者第j列标识为true，需要重置为0
            if (row[i] || col[j]) {
                matrix[i][j] = 0;
            }
        }
    }
    return matrix
};

let matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
console.log(setZeroes(matrix))