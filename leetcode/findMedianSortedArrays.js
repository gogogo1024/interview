/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-03-19 22:44:43
 * @modify date 2022-03-19 22:44:43
 * @desc [description]
 */

/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function (nums1, nums2) {
    let p1 = -1, p2 = -1;
    let len1 = nums1.length, len2 = nums2.length;
    let count;
    let i = 0, j = 0;
    let mid = Math.floor((len1 + len2) / 2);
    let isEven = (len1 + len2) % 2 == 0
    // 不管哪个指针移动一次 ，count都加1
    for (count = 0; count <= mid; count++) {
        if (isEven) {
            p2 = p1
        }
        if (i != len1 && j != len2) {
            p1 = (nums1[i] > nums2[j]) ? nums2[j++] : nums1[i++];
        } else if (i < len1) {
            p1 = nums1[i]
        } else if (j < len2) {
            p1 = nums2[j++]
        }
    }
    if (isEven) {
        return (p1 + p2) / 2
    } else {
        return p1
    };
};
let ar1 = [900]
let ar2 = [5, 8, 10, 20]

console.log(findMedianSortedArrays([900], [5, 8, 10, 20]))
console.log(findMedianSortedArrays([1, 3], [2]))
console.log(findMedianSortedArrays([1, 2], [2, 4]))
