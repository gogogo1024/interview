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