/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-03-20 13:41:58
 * @modify date 2023-06-03 18:05:01
 * @desc [description]
 */
const mergerArrays = function (ar1, ar2) {
    let len1 = ar1.length, len2 = ar2.length;
    let i = 0, j = 0, k = 0;
    let ar3 = []
    while (i < len1 && j < len2) {
        if (ar1[i] <= ar2[j]) {
            ar3[k++] = ar1[i++];
        } else if (ar1[i] > ar2[j]) {
            ar3[k++] = ar2[j++]
        }
    }
    while (i < len1) {
        ar3[k++] = ar1[i++]
    }
    while (j < len2) {
        ar3[k++] = ar2[j++]
    }
    return ar3;
}
let daa = {
    val: 1,
    children: [
        {
            val: 2,
            children: [
                {
                    val: 4

                },
                {
                    val: 5,
                    children: [{ val: 7 }, { val: 8, children: [{ val: 9 }] }]
                }],
        },

        {
            val: 3,
            children: [{ val: 6 }]
        }

    ]
}
console.log(mergerArrays([1, 3, 5, 7], [2, 4, 6, 8]))
