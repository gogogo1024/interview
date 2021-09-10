/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-09-08 15:11:40
 * @modify date 2021-09-09 20:32:47
 * @desc [description]
 */
// insert sort and merge sort
function insertSort(nums) {
    if (!Array.isArray(nums) || nums.length === 0) {
        return;
    }
    const len = nums.length;
    let i, j;
    for (i = 1; i < len; i++) {
        const current = nums[i];
        j = i - 1;
        while (nums[j] > current && j >= 0) {
            nums[j + 1] = nums[j];
            j = j - 1;
        }
        nums[j + 1] = current;
    }
    return nums;
}
const sortNums = insertSort([5, 2, 4, 6, 1, 3]);
console.log(sortNums);

/**
 * 1. 对数组二分 2. 分组后两个数组两两合并排序
 * @param {*} arr 数字数组
 * @param {*} l 数组左边界
 * @param {*} m 数组中间
 * @param {*} r 数组右边界
 * @returns 部分排序好的数组
 */
function merge(arr, l, m, r) {
    let n1 = m - l + 1;
    let n2 = r - m;

    let L = arr.slice(l, l + n1);
    let R = arr.slice(m + 1, m + 1 + n2);

    let i = 0, j = 0;
    let k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        }
        else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
    return arr;
}

function mergeSort(arr, l, r) {
    if (l >= r) {
        return;//returns recursively
    }
    var m = l + parseInt((r - l) / 2);
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
    return arr;
}
const arr = mergeSort([12, 11, 13, 5, 6, 7], 0, 5);
console.log(arr)
