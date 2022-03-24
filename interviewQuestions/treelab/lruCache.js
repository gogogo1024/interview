// 1. LRU 最少最近使用

// cache get set
var LRUCache = function (len) {
    this.len = len || 10;
    this.map = new Map();
    this.head = {}
    this.tail = {}
    this.head.next = this.tail;
    this.tail.prev = this.head;

}
LRUCache.prototype.get = function (key) {
    if (!this.map.has(key)) {
        return -1
    } else {
        let findNode = this.map.get(key);
        findNode.prev.next = findNode.next;
        findNode.next.prev = findNode.prev;

        this.tail.prev.next = findNode;
        findNode.prev = this.tail.prev;
        findNode.next = this.tail;
        this.tail.prev = findNode;

        return findNode.value;
    }
}
LRUCache.prototype.set = function (key, value) {
    if (this.get(key) != -1) { // 不存在，更新最后一个节点值
        this.tail.prev.value = value;
    } else {
        if (this.map.size == this.len) {
            this.map.delete(this.head.next.key)
            this.head.next = this.head.next.next
            this.head.next.prev = this.head
        }
        let node = {
            value, key
        }
        this.map.set(key, node) // 添加当前节点到map
        this.tail.prev.next = node // 添加节点在链表尾部
        node.prev = this.tail.prev // 修改尾部节点到前一个和后一个指针执行当前节点
        node.next = this.tail
        this.tail.prev = node

    }
}
var lruCache = new LRUCache(2)

lruCache.set("age", "age")
lruCache.set("name", "name")

console.log(lruCache.get("age"))


lruCache.set("sex", "sex")

console.log(lruCache.get("name"))


