// 计算候选人的工作经历总月份
// 1. 不能计算重复月份
// 2. endDate为"present"的算在职，也不参与计算
// 3. 下面数据输出月份为24
// 数据默认已经按照先startDate升序，后endDate升序;endDate > startDate
let inputData = [
    {
        "startDate": "2018-01",
        "endDate": "2018-06"
    },
    {
        "startDate": "2018-03",
        "endDate": "2018-12"
    },
    {
        "startDate": "2019-06",
        "endDate": "2020-01"
    },
    {
        "startDate": "2020-07",
        "endDate": "2020-11"
    },
    {
        "startDate": "2020-08",
        "endDate": "2020-12"
    },
    {
        "startDate": "2020-12",
        "endDate": "2021-01"
    },
    {
        "startDate": "2023-10",
        "endDate": "present"
    }
]
// 对date结构转换成number
function changeDateToNumber(inputData) {
    return inputData.filter(item => item.endDate != "present").map((item) => {
        let startYearAndMonth = item.startDate.split("-")
        item.startYear = Number(startYearAndMonth[0])
        item.startMonth = Number(startYearAndMonth[1])
        item.startNumber = Number(startYearAndMonth[0] + startYearAndMonth[1])

        let endYearAndMonth = item.endDate.split("-")
        item.endYear = Number(endYearAndMonth[0])
        item.endMonth = Number(endYearAndMonth[1])
        item.endNumber = Number(endYearAndMonth[0] + endYearAndMonth[1])

        return item
    })
}

// 统计
function calculate(inputData) {
    let range = inputData[0];
    let totalMonths = calculateMonths(range)
    for (let i = 1; i < inputData.length; ++i) {
        if (judgementOverlap(range, inputData[i])) { // 有重叠
            if (range.endNumber < inputData[i].endNumber) {
                //减去旧range
                totalMonths -= calculateMonths(range)

                range = {
                    startYear: range.startYear,
                    startMonth: range.startMonth,
                    startNumber: range.startNumber,

                    endYear: inputData[i].endYear,
                    endMonth: inputData[i].endMonth,
                    endNumber: inputData[i].endNumber,
                };
                //加上新range
                totalMonths += calculateMonths(range)
            }
        } else { // 无重叠
            totalMonths += calculateMonths(inputData[i])
            range = inputData[i]
        }
    }
    return totalMonths;

}
// 判定时间段是否重叠
function judgementOverlap(a, b) {
    if (b.startNumber < a.endNumber && b.startNumber > a.startNumber) {
        return true;
    } else {
        return false;
    }

}


// 计算1段工作经历月份
function calculateMonths(a) {
    return (a.endYear - a.startYear) * 12 + (a.endMonth - a.startMonth)
}


let dateToNumberDate = changeDateToNumber(inputData)
console.log(dateToNumberDate)

const totalMonths = calculate(dateToNumberDate)
console.log(totalMonths)

