// normal program > process.nextTick > promise.resolve/reject > normal phase


// normal phase belows
// 1. poll  -> io callback
// 2. check -> callback like  setImmediate
// 3. close -> callback that triggered via EventEmitter close events(net.TCP close, it emits a close event on it's callback in this phase) 
// 4. timer ->   setTimeout and setInterval callback
// 5. pending -> special system events are run in this phase, like when a net.Socket TCP socket throws an ECONNREFUSED error

setImmediate(() => console.log(1));
console.log(2);
Promise.resolve().then(
    () => {
        console.log(10);
        setTimeout(() => {
            setImmediate(() => console.log(3));
            console.log(4);
            Promise.resolve().then(() => setImmediate(() => {
                setImmediate(() => console.log(5));
                console.log(6);
                Promise.resolve().then(() => {
                    setImmediate(() => console.log(7));
                    console.log(8);
                });
            }));
        }, 0)
    }
);
// break CPU-heavy operations up across multiple stacks(don't starve the event loop)
// 1. use setImmediate break problem into many pieces
// 2 .use  child process


// When exposing a method that takes a callback, that callback should always be run asynchronously
// use process.nextTick or setImmediate
function foo(count, callback) {
    if (count <= 0) {
        return process.nextTick(() => callback(new TypeError('count > 0')));
    }
    myAsyncOperation(count, callback);
}
function myAsyncOperation(count, callback) {
    return new Promise(() => {
        callback(count)
    })
}

