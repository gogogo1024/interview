/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2021-08-26 23:36:51
 * @modify date 2021-09-16 22:34:56
 * @desc [description] 字节一面第三题，脑子抽了当时，写的一团糟
 */
var obj = {
    id: '123',
    name: '321',
    children: [{ id: "234", name: "456", children: [] }]
};
function getNameById(id, nodes) {
    var node = nodes['id'];
    if (node == id) {
        return nodes['name'];
    }
    else {
        var result = "";
        if (Array.isArray(nodes.children) && nodes.children.length > 0) {
            nodes.children.forEach(function (item) {
                var name = getNameById(id, item);
                if (name) {
                    return result = name;
                }
            });
            return result;
        }
    }
}
console.log(getNameById("223", obj));
console.log(getNameById("234", obj));
