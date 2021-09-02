// const _ = require('lodash')


function takeLongTimeSuccess1() {
    return new Promise(resolve => {
        setTimeout(() => resolve("long_time_value1"), 1000);
    });
}
// function takeLongTimeSuccess2() {
//     return new Promise(resolve => {
//         setTimeout(() => resolve("long_time_value"), 2000);
//     });
// }



function takeLongTimeFail() {
    return new Promise((_, reject) => {
        setTimeout(() => reject("long_time_error"), 500);
    }).catch(e => console.error(e));
}
function takeLongTimeSuccess2() {
    return new Promise(resolve => {
        setTimeout(() => resolve("long_time_value2"), 2000);
    });
}
async function  doIt() {
    // const result = await Promise.all([takeLongTimeSuccess1, takeLongTimeSuccess2, takeLongTimeFail]);

    const result1 = await takeLongTimeSuccess1();
    const result3 = await takeLongTimeFail();

    const result2 = await takeLongTimeSuccess2();


    console.log(result1,result2,result3);
}
doIt();
// async function batchRequests(options) {
//     let query = { offset: 0, limit: options.limit };

//     do {
//         batch = await model.findAll(query);
//         query.offset += options.limit;

//         if (batch.length) {
//             const promise = doLongRequestForBatch(batch).then(() => {
//                 // Once complete, pop this promise from our array
//                 // so that we know we can add another batch in its place
//                 _.remove(promises, p => p === promise);
//             });
//             promises.push(promise);

//             // Once we hit our concurrency limit, wait for at least one promise to
//             // resolve before continuing to batch off requests
//             if (promises.length >= options.concurrentBatches) {
//                 await Promise.race(promises);
//             }
//         }
//     } while (batch.length);

//     // Wait for remaining batches to finish
//     return Promise.all(promises);
// }


// batchRequests({ limit: 100, concurrentBatches: 5 });








type: ons().string().oneOf(["en", "zh"]).required()

productGroups
https://editor.api.ide.im/editor?p=999117&eid=1629810085795000

1./ productGroups /: id <%> PATCH
2. / productGroups / publish /: id <%> POST
3. / productGroups / product /: id <%> GET