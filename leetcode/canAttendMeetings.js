var canAttendMeetings = function (intervals) {
    intervals = intervals.sort((a, b) => {
        if (a[0] > b[0]) {
            return 1
        } else if (a[0] < b[0]) {
            return -1
        }
        return 0
    })
    for (let i = 0; i < intervals.length - 1; i++) {
        if (intervals[i][1] > intervals[i + 1][0]) {
            return false
        }
    }
    return true
};
let intervals = [[0, 30], [5, 10], [15, 20]]
console.log(canAttendMeetings(intervals))
intervals = [[7, 10], [2, 4]]
console.log(canAttendMeetings(intervals))
