/**
 * 给你两个 非空的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。
* 请你将两个数相加，并以相同形式返回一个表示和的链表。
 * 你可以假设除了数字 0 之外，这两个数都不会以 0 开头。
 * 2->4->3
 * 5->6->4
 * 7->0->8
 * 输入：l1 = [2,4,3], l2 = [5,6,4]
 * 输 出：[7,0,8]
 * 解释：342 + 465 = 807.
 */
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode} headNode
 */
var addTwoNumbers = function (l1, l2) {
    // 定义两个指针，头和尾
    let headNode = new ListNode(0);
    let tailNode = headNode;

    let carry = 0;
    while (l1 != null || l2 != null) {
        let x = 0, y = 0;
        if (l1 != null) {
            x = l1.val;
            l1 = l1.next;
        }
        if (l2 != null) {
            y = l2.val;
            l2 = l2.next;
        }
        let sum = x + y + carry;
        carry = parseInt(sum / 10);
        tailNode.next = new ListNode(sum % 10);
        // 移动当前所指向的节点到下一个节点
        tailNode = tailNode.next;
    }
    // 如果最后一位有进位，只可能是1，没有进位就不处理
    if (carry === 1) {
        tailNode.next = new ListNode(1);
    }
    return headNode.next;

};