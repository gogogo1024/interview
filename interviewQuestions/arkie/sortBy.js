/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-12-28 06:58:34
 * @modify date 2021-12-28 07:03:35
 * @desc [description] 根据数组对象的字段作排序
 */

// 当时没写出来,面试官给我看了下他写的,没看懂,太复杂,现在突然想起来了,当时他写的很烂

//eg :  [{salary: 100,age:21},{alary: 120,age:22}] ,["salary", "age"], [1, -1]
//  按照salary升序,age降序
/**
* 基础版本 根据salary升序, age降序
* @param {*} arr  [{salary: 100,age:21},{alary: 120,age:22}]
*/
function sortByCondition(arr) {
    arr = arr.sort((item1, item2) => {
        if (item1.salary > item2.salary) {
            return 1
        }
        else if (item1.salary < item2.salary) {
            return -1
        }
    })

    arr = arr.sort((item1, item2) => {
        if (item1.salary == item2.salary) {
            if (item1.age > item2.age) {
                return -1
            } else if (item1.age < item2.age) {
                return 1
            }
        }
    })
    return arr;
}

/**
 * 设计版本版本 根据salary升序, age降序
 * @param {*} arr  [{salary: 100,age:21},{alary: 120,age:22}]
 * @param {*} arr1  ["salary","age"]
 * @param {*} arr2  [1,-1]
 */
function sortByConditionUpdate(arr, arr1, arr2) {
    arr1.forEach(index => {
        arr = arr.sort((item1, item2) => {
            if (index > 0) {
                if (item1[arr1[index - 1]] == item2[arr1[index - 1]]) {
                    if (item1[arr1[index]] < item2[arr1[index]]) {
                        return arr2[index] * -1
                    }
                    else if (item1[arr1[index]] > item2[arr1[index]]) {
                        return arr2[index]
                    }
                }
            } else {
                if (item1[arr1[index]] < item2[arr1[index]]) {
                    return arr2[index] * -1
                }
                else if (item1[arr1[index]] > item2[arr1[index]]) {
                    return arr2[index] * 1
                }
            }

        })

    })
    return arr;
}
let needSortArray = [{ salary: 100, age: 24 }, { salary: 30, age: 26 }, { salary: 60, age: 22 }, { salary: 20, age: 22 }, { salary: 90, age: 21 },
{ salary: 40, age: 23 }, { salary: 60, age: 27 }, { salary: 30, age: 29 }, { salary: 80, age: 29 }, { salary: 70, age: 28 },
{ salary: 30, age: 28 }, { salary: 30, age: 29 }, { salary: 30, age: 27 }, { salary: 20, age: 26 }, { salary: 20, age: 27 },
]

let arr1 = sortByCondition(needSortArray)
let arr2 = sortByConditionUpdate(needSortArray, ["salary", "age"], [1, -1])

console.log(arr1)
console.log(arr2)

