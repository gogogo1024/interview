function fibonacci(n) {
    if (n === 1 || n === 2) {
        return 1
    }
    let pre = 1, cur = 1;
    for (let i = 3; i <= n; i++) {
        let sum = pre + cur;
        pre = cur;
        cur = sum;
    }
    return cur;
}
console.log(fibonacci(1));
console.log(fibonacci(2));
console.log(fibonacci(3));
console.log(fibonacci(4));
console.log(fibonacci(5));
console.log(fibonacci(6));

