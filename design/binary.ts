/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-08-27 17:03:43
 * @modify date 2021-08-27 17:03:43
 * @desc [description] 二叉树的先序，中序，后序遍历
 */

//TODO

// 先序: 先头节点，再左边子树，再右边子树
// 1 2 4 5 6 3 7

// 中序: 先左边子树，再头节点，再右边子树
// 4 2 5 1 6 3 7

// 后序: 先左边子树，再右边子树，再头节点
// 4 5 2 6 7 3 1 
interface Node{
    value: string;
    left?:Node;
    right?:Node;
}