
var MyCalendarTwo = function() {
    this.booked = [];
    this.overlaps = [];
};

MyCalendarTwo.prototype.book = function(start, end) {
    for (const arr of this.overlaps) {
        let l = arr[0], r = arr[1];
        if (l < end && start < r) {
            return false;
        }
    }
    for (const arr of this.booked) {
        let l = arr[0], r = arr[1];
        if (l < end && start < r) {
            this.overlaps.push([Math.max(l, start), Math.min(r, end)]);
        }
    }
    this.booked.push([start, end]);
    return true;
};
