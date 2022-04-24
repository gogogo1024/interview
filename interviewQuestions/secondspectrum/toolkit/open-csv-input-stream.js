const stream = require('stream');
const fs = require('fs');
const papaparse = require('papaparse');
const mathjs = require('mathjs');

//
// Open a streaming CSV file for input.
//
function openCsvInputStream(inputFilePath) {

    const csvInputStream = new stream.Readable({ objectMode: true }); // Create a stream that we can read data records from, note that 'object mode' is enabled.
    csvInputStream._read = () => { }; // Must include, otherwise we get an error.

    const fileInputStream = fs.createReadStream(inputFilePath); // Create stream for reading the input file.
    let result = {}
    papaparse.parse(fileInputStream, {
        header: true,
        dynamicTyping: true,
        // We may not need this, but don't want to get halfway through the massive file before relapsing it is needed.
        skipEmptyLines: true,
        delimiter: ',',
        newline: '\r\n',

        step: (results) => { // Handles incoming rows of CSV data.
            if (!isNaN(results.data.Value) && results.data.Change != "UNKNOWN") {
                if (!result[results.data.Name]) {
                    result[results.data.Name] = {
                        min: {
                            date: results.data.Date, value: results.data.Value
                        },
                    }
                } else {
                    if (!result[results.data.Name]['max']) {
                        if (new Date(result[results.data.Name]['min']['date']).getTime() < new Date(results.data.Date).getTime()) {
                            result[results.data.Name]['max'] = {
                                date: results.data.Date, value: results.data.Value
                            }

                        } else {
                            result[results.data.Name]['max'] = result[results.data.Name]['min']
                            result[results.data.Name]['min'] = {
                                date: results.data.Date, value: results.data.Value
                            }
                        }
                        result[results.data.Name]['max'] = {
                            date: results.data.Date, value: results.data.Value
                        }
                    } else {
                        if (new Date(result[results.data.Name]['max']['date']).getTime() < new Date(results.data.Date).getTime()) {
                            result[results.data.Name]['max'] = {
                                date: results.data.Date, value: results.data.Value
                            }
                        } else if (new Date(result[results.data.Name]['min']['date']).getTime() > new Date(results.data.Date).getTime()) {
                            result[results.data.Name]['min'] = {
                                date: results.data.Date, value: results.data.Value
                            }
                        }
                    }
                    let largest = mathjs.subtract(
                        mathjs.bignumber(result[results.data.Name]['max'].value),
                        mathjs.bignumber(result[results.data.Name]['min'].value))
                    result[results.data.Name]['largest'] = Number(largest) > 0 ? Number(largest) : 0
                }
            }
        },

        complete: () => { // File read operation has completed.
            // csvInputStream.push(null); // Signify end of stream.
            let keys = Object.keys(result)
            keys.sort((a, b) => {
                if (result[a].largest < result[b].largest) {
                    return 1;
                } else if (result[a].largest > result[b].largest) {
                    return -1
                }
                return 0;
            })
            let str = "nil"
            if (result[keys[0]]['largest'] > 0) {
                str = `公司: ${keys[0]}, 股价增值: ${result[keys[0]]['largest'].toFixed(6)}`
            }
            console.log(str)
            console.timeEnd('quick')
            printMemoryUsage()
            function printMemoryUsage() {
                var info = process.memoryUsage();
                function mb(v) {
                    return (v / 1024 / 1024).toFixed(2) + 'MB';
                }
                console.log('rss=%s, heapTotal=%s, heapUsed=%s', mb(info.rss), mb(info.heapTotal), mb(info.heapUsed));
            }
            csvInputStream.emit("completed", str);
            csvInputStream.push(null);
        },

        error: (err) => { // An error has occurred.
            csvInputStream.emit("error", err); // Pass on errors.
        }
    }
    );

    return csvInputStream;
};

module.exports = openCsvInputStream;