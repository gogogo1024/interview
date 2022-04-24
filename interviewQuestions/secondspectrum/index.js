/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-07 15:59:36
 * @modify date 2022-04-24 15:41:40
 * @desc [description]
 */


const openCsvInputStream = require('./toolkit/open-csv-input-stream');
const csvFilePath = 'values.csv'
console.time('quick')
openCsvInputStream(csvFilePath)
    .on("completed", value => {
        console.log(value);
    })
    .on("error", err => {
        console.error("An error occurred while transforming the CSV file.");
        console.error(err);
    });

