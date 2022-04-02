/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-02 20:37:17
 * @modify date 2022-04-02 20:37:18
 * @desc [description]
 */

const processCsvData = function (inputData) {
    if (!Array.isArray(inputData) || inputData.length == 0) {
        return
    }
    // 处理不规范的value，change
    inputData = inputData.filter(item => !isNaN(item.Value) && item.Change != "UNKNOWN");

    // 按照特定的字段来分组
    function groupBy(array, f) {
        let groups = {};
        array.forEach(function (o) {
            let group = f(o);
            groups[group[0]] = groups[group[0]] || [];
            groups[group[0]].push(o);
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    }
    const groupInputData = groupBy(inputData, function (item) {
        return [item.Name];
    });
    const sortDataByDate = function (a, b) {
        if (new Date(a.Date).getTime() < new Date(b.Date).getTime()) {
            return -1
        } else if (new Date(a.Date).getTime() > new Date(b.Date).getTime()) {
            return 1
        }
        return 0
    }
    groupInputData.map(item => {
        item.sort(sortDataByDate)
        return item
    })

    let maxFunc = function (arr) {
        let max = 0
        const len = arr.length - 1
        let tmpValue = arr[len].Value * 1000 - arr[0].Value * 1000;
        max = Math.max(max, tmpValue);
        return {
            max: max / 1000,
            name: arr[0].Name,
        }
    }
    let finalMax = 0
    let maxName = ""
    groupInputData.forEach(item => {
        let temp = maxFunc(item)
        finalMax = Math.max(finalMax, temp.max)
        if (temp.max == finalMax && finalMax > 0) {
            maxName = temp.name
        }
    })
    if (finalMax != 0) {
        console.log(`公司: ${maxName}, 股价增值: ${finalMax.toFixed(6)}`)
    } else {
        console.log(`nil`)
    }

}
exports.processCsvData = processCsvData


