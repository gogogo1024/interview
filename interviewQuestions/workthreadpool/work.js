
import { parentPort, threadId } from 'node:worker_threads';

parentPort.on('message', (task) => {
    const { num } = task
    // console.log(`running task on thread: ${threadId}`)
    parentPort.postMessage(getFib(num))
})

function getFib(num) {
    if (num === 0) {
        return 0;
    }
    else if (num === 1) {
        return 1;
    }
    else {
        return getFib(num - 1) + getFib(num - 2);
    }
}