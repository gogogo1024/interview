const sleepTimeout = (timeout) => new Promise((res, rej) => setTimeout(res, timeout));


exports.sleepTimeout = sleepTimeout