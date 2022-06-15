// 对给定数字重量排序，数字重量计算是每位的数字之和，相同重量再比较ascii
// 输入 "56 65 74 100 99 68 86 180 90"  输出 "100 180 90 56 65 74 68 86 99"
function orderByWeight(input) {
  let inputArr = input && typeof input === "string" && input.split(" ");
  let outArr = [];
  inputArr.forEach(item => {
    let value = 0;
    const obj = {};
    item.split("").forEach(i => {
      value += parseInt(i, 10);
    });
    obj["key"] = item;
    obj["value"] = value;

    outArr.push(obj);
  });
  outArr = outArr.sort(function (a, b) {
    if (a.value === b.value) {
      // 当两个value值相等，只需要比较最高位的数字即可，不需要逐一比对
      return a.key.charCodeAt(0) - b.key.charCodeAt(0);
    }
    return a.value - b.value;
  });
  return outArr.map(item => parseInt(item["key"], 10)).join(" ");
}

console.log(orderByWeight("56 65 74 100 99 68 86 180 90"));
