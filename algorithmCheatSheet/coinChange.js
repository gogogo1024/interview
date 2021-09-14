function coinChange(coinArr, target) {
    let res = Number.MAX_VALUE;
    function dp(n) {
        if (n === 0) {
            return 0;
        }
        if (n < 0) {
            return -1;
        }
        coinArr.forEach(coin => {
            let sub = dp(n - coin);
            if (sub !== -1) {
                res = Math.min(1 + sub, res)
            }
        })
        return res != Number.MAX_VALUE ? res : -1;
    }
    return dp(target);
}
console.log(coinChange([1,2,5],11));
var reverse = function (x) {
    let max = Math.pow(2, 31) - 1;
    let min = -Math.pow(2, 31);
    let next = 0;
    while (x != 0) {
        if (x > 0 && next > (max - x % 10) / 10) {
            return 0;
        }
        if (x < 0 && next < (min - x % 10) / 10) {
            return 0;
        }
        next = next * 10 + x % 10;
        x = parseInt(x/10);
    }
    return next;
};
console.log(reverse(-124));