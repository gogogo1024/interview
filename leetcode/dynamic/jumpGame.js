/**
 * @author [gogogo1024]
 * @email [jxycbjhc@gmail.com]
 * @create date 2023-05-06 15:51:51
 * @modify date 2023-05-07 00:48:10
 * @desc [description]
 */
/**
 * 有n块石头放在x轴的0,1,2,n-1位置上，🐸从位置0上跳跃，想跳跃到n-1位置上
 * 如果当前🐸在i位置上，它最多能跳a[i]距离,
 * 问🐸能否调到n-1位置上去
 * 🐸能跳到n-1位置上去，必须满足下面条件
 * 1. 🐸能挑到n-2位置上去
 * 2. 🐸当前位置 + a[i] >= n-1
 * 例如: 
 * 输入: a =[2,3,1,1,4]
 * 输出: true
 * 输入: a =[3,2,1,0,4]
 * 输出: false
 * 输入: a = [3, 3, 1, 0, 4]
 * 输出: true
 */
function jumpGame(A) {
    let len = A.length;
    let f = new Array(len);
    f[0] = true;
    let outFlag = false;
    for (let j = 1; j < len; j++) {
        f[j] = false;
        for (let i = 0; i < j; i++) {
            // 如果当前🐸能直接跳到n-1位置，直接跳出大循环
            if (f[i] && i + A[i] >= len - 1) {
                outFlag = true;
                break;
            }
            if (f[i] && i + A[i] >= j) {
                f[j] = true;
                break
            }
        }
        if (outFlag) {
            f[len - 1] = true
            break;
        }
    }
    return f[len - 1]
}
console.log(jumpGame([2, 3, 1, 1, 4]))
console.log(jumpGame([3, 2, 1, 0, 4]))
console.log(jumpGame([3, 3, 1, 0, 4]))

