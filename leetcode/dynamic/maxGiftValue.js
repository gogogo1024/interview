/**
在一个 m*n 的棋盘的每一格都放有一个礼物，每个礼物都有一定的价值（价值大于 0）。
你可以从棋盘的左上角开始拿格子里的礼物，并每次向右或者向下移动一格、直到到达棋盘的右下角。给定一个棋盘及其上面的礼物的价值，请计算你最多能拿到多少价值的礼物？
示例 1:
输入:
[
  [1,3,1],
  [1,5,1],
  [4,2,1]
]
输出: 12
解释: 路径 1→3→5→2→1 可以拿到最多价值的礼物
提示：

0 < grid.length <= 200
0 < grid[0].length <= 200

// keys:
// 当前dp[x,y]的最大值，是由上一步的最大值加上当前grid[x,y]的值
// 而上一步的最大值max。只需要比较正上方向和左方向，即dp[x-1,y], dp[x,y-1]
*/
let maxValue = function (grid) {
  let row = grid.length, column = grid[0].length;
  let dp = new Array(row + 1).fill(new Array(column + 1).fill(0));
  for (let i = 1; i <= row; i++) {
    for (let j = 1; j <= column; j++) {
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]) + grid[i - 1][j - 1];
    }
  }
  return dp[row][column];
}
let giftValueGrid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]];
let value = maxValue(giftValueGrid);
console.log(value);
