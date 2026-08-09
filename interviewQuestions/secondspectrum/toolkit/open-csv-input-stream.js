const stream = require('stream');
const fs = require('fs');
const papaparse = require('papaparse');
const mathjs = require('mathjs');

// Open a streaming CSV file for input.
function openCsvInputStream(inputFilePath) {
    const csvInputStream = new stream.Readable({ objectMode: true });
    csvInputStream._read = () => {};

    const fileInputStream = fs.createReadStream(inputFilePath, { encoding: 'utf8' });
    const result = Object.create(null);

    const invalidChangeValues = new Set(['unknown', 'unkown', 'na', 'n/a', '']);

    function isNumeric(v) {
        return typeof v === 'number' && Number.isFinite(v);
    }

    function isValidChange(change) {
        if (change == null) return true; // accept missing Change, we'll rely on Value
        const c = String(change).trim().toLowerCase();
        return !invalidChangeValues.has(c);
    }

    papaparse.parse(fileInputStream, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        step: (row) => {
            const data = row.data;
            const name = data.Name;
            const value = data.Value;
            const dateStr = data.Date;
            const change = data.Change;

            if (!name) return;
            if (!isNumeric(value)) return;
            if (!isValidChange(change)) return;

            const ts = Date.parse(String(dateStr));
            if (Number.isNaN(ts)) return;

            if (!result[name]) {
                result[name] = {
                    first: { date: ts, value },
                    last: { date: ts, value },
                };
            } else {
                if (ts < result[name].first.date) {
                    result[name].first = { date: ts, value };
                }
                if (ts > result[name].last.date) {
                    result[name].last = { date: ts, value };
                }
            }
        },
        complete: () => {
            // compute largest positive increase (last - first)
            let winner = null;
            let winnerDelta = 0;

            for (const name of Object.keys(result)) {
                const r = result[name];
                const delta = mathjs.subtract(mathjs.bignumber(r.last.value), mathjs.bignumber(r.first.value));
                const num = Number(delta);
                if (num > winnerDelta) {
                    winnerDelta = num;
                    winner = name;
                }
            }

            let str = 'nil';
            if (winner && winnerDelta > 0) {
                str = `公司: ${winner}, 股价增值: ${winnerDelta.toFixed(6)}`;
            }

            console.log(str);
            console.timeEnd('quick');
            printMemoryUsage();

            function printMemoryUsage() {
                const info = process.memoryUsage();
                function mb(v) {
                    return (v / 1024 / 1024).toFixed(2) + 'MB';
                }
                console.log('rss=%s, heapTotal=%s, heapUsed=%s', mb(info.rss), mb(info.heapTotal), mb(info.heapUsed));
            }

            csvInputStream.emit('completed', str);
            csvInputStream.push(null);
        },
        error: (err) => {
            csvInputStream.emit('error', err);
        },
    });

    return csvInputStream;
}

module.exports = openCsvInputStream;