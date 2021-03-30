// TODO: complete this object/class

// The constructor takes in an array of items and a integer indicating how many
// items fit within a single page
function PaginationHelper(collection, itemsPerPage) {
    this.collection = collection || [];
    this.itemsPerPage = itemsPerPage || 1;
    this.countPage = 0;
    this.countItem = 0;

}

// returns the number of items within the entire collection
PaginationHelper.prototype.itemCount = function () {
    this.countItem = this.collection.length;
    return this.countItem;
}

// returns the number of pages
PaginationHelper.prototype.pageCount = function () {
    if (Array.isArray(this.collection) && this.collection.length > 0) {
        this.countPage = Math.ceil((this.collection.length) / (this.itemsPerPage));
        return this.countPage;
    }
    this.countPage = 0;
    return 0;
}

// returns the number of items on the current page. page_index is zero based.
// this method should return -1 for pageIndex values that are out of range
PaginationHelper.prototype.pageItemCount = function (pageIndex) {
    if (pageIndex + 1 < this.countPage) {
        return this.itemsPerPage;
    } else if (pageIndex + 1 == this.countPage) {
        return pageIndex * (this.itemsPerPage + 1) - this.countItem

    }
    return -1;
}

// determines what page an item is on. Zero based indexes
// this method should return -1 for itemIndex values that are out of range
PaginationHelper.prototype.pageIndex = function (itemIndex) {
    if (itemIndex < this.collection.length && itemIndex >= 0) {
        return Math.floor(itemIndex / this.itemsPerPage)
    } else {
        return -1;
    }
}

var helper = new PaginationHelper(['a', 'b', 'c', 'd', 'e', 'f'], 4);
console.log(helper.pageCount()); //should == 2
console.log(helper.itemCount()); //should == 6
console.log(helper.pageItemCount(0)); //should == 4
console.log(helper.pageItemCount(1)); // last page - should == 2
console.log(helper.pageItemCount(2)); // should == -1 since the page is invalid

// pageIndex takes an item index and returns the page that it belongs on
console.log(helper.pageIndex(5)); //should == 1 (zero based index)
console.log(helper.pageIndex(2)); //should == 0
console.log(helper.pageIndex(20)); //should == -1
console.log(helper.pageIndex(-10)); //should == -1

// var collection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
// var helper = new PaginationHelper(collection, 10);

// Test.assertEquals(helper.pageCount(), 3, 'page_count is returning incorrect value.');
// Test.assertEquals(helper.pageIndex(23), 2, 'page_index returned incorrect value');
// Test.assertEquals(helper.itemCount(), 24, 'item_count returned incorrect value');