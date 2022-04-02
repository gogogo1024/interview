/**
 * @author [gogogo1024]
 * @email [jxycbjhc@163.com]
 * @create date 2022-04-02 20:37:23
 * @modify date 2022-04-02 20:40:48
 * @desc [description]
 */

const csv = require('csvtojson')
const csvFilePath = 'values.csv'

const { processCsvData } = require('./largestAbsIncr')
csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
        processCsvData(jsonObj)
    })
