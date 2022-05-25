// 利用cluster对producer-http-basic.js做多进程包装
// 充分利用多核CPU,但是由于cluster是工作在第四层tcp/ip
// 无法意识到第七层http，而grpc是基于http2的，连接同样会保持一段时间
// 因此http请求不会被分到不同的worker执行，就浪费了cluster的优势

const cluster = require('cluster');
console.log(`master pid=${process.pid}`);
cluster.setupMaster({
    exec: __dirname + '/producer-grpc.js'
});
cluster.fork();
cluster.fork();
cluster
    .on('disconnect', (worker) => {
        console.log('disconnect', worker.id);
    })
    .on('exit', (worker, code, signal) => {
        console.log('exit', worker.id, code, signal);
        // cluster.fork();
    })
    .on('listening', (worker, { address, port }) => {
        console.log('listening', worker.id, `${address}:${port}`);
    });