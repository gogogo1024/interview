/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-08-26 23:36:51
 * @modify date 2021-08-26 23:37:23
 * @desc [description] 字节一面第三题，脑子抽了当时，写的一团糟
 */

//实现 getNameById(id:string, nodes: NodeTree):string


interface NodeTree {
id:string,
name:string,
children?:NodeTree[]
}
const obj:NodeTree = {
    id: '123',
    name: '321',
    children: [{ id: "234", name: "456", children: [] }]
};

function getNameById(id:string ,nodes:NodeTree) {
    let node = nodes['id'];
    if (node == id) {
        return nodes['name'];
    } else {
        let result = "";
        if (Array.isArray(nodes.children) && nodes.children.length > 0) {
            nodes.children.forEach(item => {
                let name = getNameById(id, item);
                if (name) {
                    return result = name;
                }
            })
            return result;
        }
    }
}
console.log(getNameById("223", obj));
console.log(getNameById("234", obj));
