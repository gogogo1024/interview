/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-09-08 15:11:40
 * @modify date 2021-09-09 01:54:50
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
