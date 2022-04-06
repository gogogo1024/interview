// 前缀和 + 二分查找
// 在处理关键字的换一换功能上面使用
var Solution = function (w, weight) {
    this.pre = new Array(w.length).fill(0);
    this.pre[0] = w[0][weight];
    this.total = this.pre[0]
    for (let i = 1; i < w.length; ++i) {
        this.pre[i] = this.pre[i - 1] + w[i][weight];
        this.total += w[i][weight];
    }
    console.log(`pre:${JSON.stringify(this.pre, null, 2)}`)
};

Solution.prototype.pickIndex = function () {
    const x = Math.floor((Math.random() * this.total)) + 1;
    const binarySearch = (x) => {
        let low = 0, high = this.pre.length - 1;
        while (low < high) {
            const mid = Math.floor((high - low) / 2) + low;
            if (this.pre[mid] < x) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return low;
    }
    return binarySearch(x);
};

Solution.prototype.pickNIndex = function (n) {
    this.nRandomIndex = [];
    while (n >= 0) {
        const randomIndex = this.pickNIndex()
        this.nRandomIndex.push(randomIndex);
        n--
    }
    return this.nRandomIndex;
};
const list = [{ name: "A", weight: 1 }, { name: "B", weight: 3 }, { name: "C", weight: 5 }, { name: "D", weight: 3 }, { name: "E", weight: 1 }]
const solution = new Solution(list, "weight");
let a = 0, b = 0, c = 0, d = 0, e = 0;
for (let index = 0; index < 100000; index++) {
    let randomIndex = solution.pickIndex();
    let key = list[randomIndex]['name'];
    switch (key) {
        case "A":
            a++;
            break;
        case "B":
            b++;
            break;
        case "C":
            c++;
            break;
        case "D":
            d++;
            break;
        case "E":
            e++;
        default:
            break;
    }
}
console.log(e);
console.log("A:" + a + ",B:" + b + ",C:" + c + ",D:" + d, "E:" + e);