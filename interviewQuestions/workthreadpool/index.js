import WorkerPool from "./work_pool.js"
import os from 'node:os';
// import path from 'node:path';

// simulate for async function eg: deal with database 
const sleep = (delay = 1000) => {
    return new Promise((resolve) => {
        return setTimeout(() => {
            return resolve();
        }, delay);
    });
};

// arraybuffer can share memory between two different js instance
// use postMessage
// so both threads can read and write memory at the same time
const pool = new WorkerPool(os.cpus().length, './work.js');
let finished = 0;
let count = 2000;
console.time('cpu-timing');
for (let i = 0; i < count; i++) {
    pool.runTask({ num: 30 }, (err, result) => {
        (async () => {
            await sleep(1000);
        })();
        // console.log(`第${i + 1}个任务`);
        // console.log(`num:${i}, i:${i}, err:${err}, result:${result}`);
        if (++finished === count) {
            console.timeEnd('cpu-timing');
            pool.close();
        }
    });
}





