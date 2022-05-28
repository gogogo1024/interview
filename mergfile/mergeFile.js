const fs = require("fs");
const path = require("path");
const createWriteStream = fs.createWriteStream;
const createReadStream = fs.createReadStream;

const { pipeline } = require('node:stream/promises');
const util = require('util');
const readdir = util.promisify(fs.readdir)



function streamMerge(sourceFileDirectory, targetFile) {
    const scripts = fs.readdirSync(path.resolve(__dirname, sourceFileDirectory)); // 获取源文件目录下的所有文件
    const fileWriteStream = createWriteStream(path.resolve(__dirname, targetFile)); // 创建一个可写流

    // fs.readdir 读取出来的结果，根据具体的规则做下排序，防止因为顺序不对导致最终合并之后的文件无效。
    return streamMergeRecursive(scripts, fileWriteStream, sourceFileDirectory);
}

function streamMergeRecursive(scripts = [], fileWriteStream, sourceFileDirectory) {
    // 递归到尾部情况判断
    if (!scripts.length) {
        // return fileWriteStream.end("// console.log('Stream 合并完成')"); // 最后关闭可写流，防止内存泄漏
        return fileWriteStream.end(); // 最后关闭可写流，防止内存泄漏

    }

    const currentFile = path.resolve(__dirname, sourceFileDirectory, scripts.shift());
    const currentReadStream = createReadStream(currentFile); // 获取当前的可读流

    currentReadStream.pipe(fileWriteStream, { end: false });
    currentReadStream.on('end', function () {
        streamMergeRecursive(scripts, fileWriteStream, sourceFileDirectory);
    });

    currentReadStream.on('error', function (error) { // 监听错误事件，关闭可写流，防止内存泄漏
        console.error(error);
        fileWriteStream.close();
    });
}

const streamConcurrentMerge = async (sourceFileDirectory, targetFile, chunkSize) => {
    const filenames = await readdir(sourceFileDirectory);
    console.log(filenames)
    let start = 0, tmp = 0, step = [];
    await Promise.all(filenames.map((filename, index) => {
        let arr = filename.split('.');
        if (index != 0) {
            start = step[index - 1]
        }
        tmp += Number(arr[1])
        step.push(tmp)

        return pipeline(
            createReadStream(path.join(sourceFileDirectory, filename)),
            createWriteStream(targetFile, {
                start,
            })
        );
    }))
};

console.time('streamMerge');
streamMerge('./dir', './streamMergeFile.js');

console.timeEnd('streamMerge');

console.time('streamConcurrentMerge');

(async () => {
    await streamConcurrentMerge('./dir', './streamConcurrentMergeFile.js');
})()
console.timeEnd('streamConcurrentMerge');
