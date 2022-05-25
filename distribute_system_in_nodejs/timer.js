setTimeout(() => {
    console.time('A')
    console.log('A')
    console.timeEnd('A')

}, 0
)
console.time('B')
console.log('B')
console.timeEnd('B')

setTimeout(() => {
    console.time('C')
    console.log('C')
    console.timeEnd('C')
}, 100)
setTimeout(() => {
    console.time('D')
    console.log('D')
    console.timeEnd('D')
}, 0)
let i = 0
console.time('E')
while (i < 10000000000) {
    let j = Math.sqrt(i)
    i++
}
console.timeEnd('E')
console.log('E')


const fs = require('fs');
fs.readFile('./timer.js', (err, data) => {
    if (err) throw err;
    console.log(data.toString());
});
setImmediate(() => {
    console.log('This runs while file is being read');
});