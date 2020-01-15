function mergeAry(ary, begin, middle, end) {
  var aLen = middle - begin + 1;
  var bLen = end - middle;
  var aryA = ary.slice(begin, middle + 1);
  var aryB = ary.slice(middle + 1);
  var i = 0;
  var j = 0;
  for (var k = begin; k <= end; ++k) {
    if (i >= aLen) {
      ary[k] = aryB[j];
      ++j;
    } else if (j >= bLen) {
      ary[k] = aryA[i];
      ++i;
    } else if (aryA[i] <= aryB[j]) {
      ary[k] = aryA[i];
      ++i;
    } else {
      ary[k] = aryB[j];
      ++j;
    }
  }
}
function mergeSort(ary, begin, end) {
  if (begin < end) {
    var middle = parseInt((begin + end) / 2);
    mergeSort(ary, begin, middle);
    mergeSort(ary, middle + 1, end);
    mergeAry(ary, begin, middle, end);
  }
}
var total = 100000000;
var index = total - 1;
var ary = new Array(total);
for (var i = 0; i < total; ++i) {
  ary[i] = total - i;
}
var begin = new Date().getTime();
mergeSort(ary, 0, index);
console.info(new Date().getTime() - begin);
