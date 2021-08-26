/*
 * @Author: snoy
 * @Email: jxycbjhc@163.com
 * @Date: 2020-01-12 16:42:07
 * @Last Modified by:   snoy
 * @Last Modified time: 2020-01-12 16:42:07
 * @Description: Description
 */

// Store a reference to the global setTimeout,

const cachedSetTimeout = setTimeout;

function createSleepPromise(timeout, { useCachedSetTimeout }) {
  const timeoutFunction = useCachedSetTimeout ? cachedSetTimeout : setTimeout;

  return new Promise(resolve => {
    timeoutFunction(resolve, timeout);
  });
}

function sleep(timeout, { useCachedSetTimeout } = {}) {
  const sleepPromise = createSleepPromise(timeout, { useCachedSetTimeout });

  // Pass value through, if used in a promise chain
  function promiseFunction(value) {
    return sleepPromise.then(() => value);
  }

  // Normal promise
  promiseFunction.then = (...args) => sleepPromise.then(...args);
  promiseFunction.catch = Promise.resolve().catch;

  return promiseFunction;
}

sleep(2000).then(function() {
  console.log("2 seconds later …");
});
let trace = value => {
  console.log(value);
  return value;
};

sleep(2000)
  .then(() => "hello")
  .then(trace)
  .then(sleep(1000))
  .then(value => value + " world")
  .then(trace)
  .then(sleep(500))
  .then(value => value + "!")
  .then(trace);
