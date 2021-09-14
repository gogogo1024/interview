/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-09-08 11:22:21
 * @modify date 2021-09-15 02:51:55
 * @desc [description]
 */


//输入数组 nums，找到峰值元素并返回其索引。数组可能包含多个峰值，在这种情况下，返回任何一个峰值所在位置即可

/**
 * 分治算法
 * 首先看 n/2 位置，然后与它做左边的数作对比，再与它右边的数作对比
 * 如果 a[n/2] < a[n/2-1] ，那么只需要在左半边查找峰值，即： 1 ~ n/2-1 范围内
 * 如果 a[n/2] < a[n/2+1] ，那么只需要在右半边查找峰值，即： n/2+1 ~ n 范围内
 * 如果上面两个条件都不满足，查找结束， a[n/2] 位置的元素就是我们要找的「峰值」
 * @param {*} nums 全为数字的数组
 * @returns 数组内峰值索引
 */
function searchOnePeek(nums) {
    if (!Array.isArray(nums) || nums.length === 0) {
        return;
    }
    function find(arr, l, r) {
        let mid = l + parseInt((r - l) / 2);
        if (nums[mid] < nums[mid + 1]) {
            return find(arr, mid + 1, r);
        }
        else if (nums[mid] < nums[mid - 1]) {
            return find(arr, l, mid - 1);
        }
        else {
            return mid
        }

    }
    return find(nums,0, nums.length - 1)
}
const peek1 = searchOnePeek([1, 2, 3, 4, 5, 6, 4, 3, 1]);
const peek2 = searchOnePeek([1, 2, 1, 3, 5, 6, 4]);
const peek3 = searchOnePeek([2, 1]);

const peek4 = searchOnePeek([2]);
const peek5 = searchOnePeek([1, 2]);
const peek6 = searchOnePeek([3, 2, 1]);
const peek7 = searchOnePeek([1, 2, 3]);


console.log(peek1);
console.log(peek2);
console.log(peek3);
console.log(peek4);
console.log(peek5);
console.log(peek6);
console.log(peek7);






