const t1 = setTimeout(() => { console.log('t1 will run') }, 1000)
const t2 = setTimeout(() => { console.log('t2 won\'t run') }, 1000)

t1.ref()
clearTimeout(t2)