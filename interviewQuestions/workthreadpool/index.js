import WorkerPool from "./work_pool.js"
import os from 'node:os';
// import path from 'node:path';

const pool = new WorkerPool(os.cpus().length, './work.js');
let finished = 0;
console.time('Fib')
let count = 20
for (let i = 0; i < count; i++) {
    pool.runTask({ num: i }, (err, result) => {
        console.log(`num:${i}, i:${i}, err:${err}, result:${result}`);
        if (++finished === count)
            pool.close();
    });
}




