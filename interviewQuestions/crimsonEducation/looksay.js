function lookSay(number) {
    const num = number.toString().split("");
    let counter = 1;
    let result = [];
    for (let i = 0; i < num.length; i++) {
        let current = num[i];
        let next = num[i + 1];
        if (next === current) {
            counter++;
        } else {
            result.push(counter);
            result.push(current);
            counter = 1;
        }
    }
    return (result.join(""));
}
console.log(lookSay(11342556) === "211314122516") // true
console.log(lookSay(1) === "11") // true