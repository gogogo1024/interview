// 找出给定数字并且是3或者5倍数的数字集合，求集合的数字之和
function solution(maxNumber) {
  let i3 = 0;
  let i5 = 0;
  let current = 0;
  let result = [];
  while (true) {
    const min = Math.min(Math.min(3 * i3, 5 * i5));
    if (min == 3 * i3) {
      i3++;
    }
    if (min == 5 * i5) {
      i5++;
    }
    current = min;
    if (current < maxNumber) {
      result.push(min);
    }
    else {
      break;
    }
  }
  return result.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

const result = solution(10);
console.log(result);
