/*
 * @Author: snoy
 * @Email: jxycbjhc@163.com
 * @Date: 2020-01-11 13:17:29
 * @Last Modified by:   snoy
 * @Last Modified time: 2020-01-11 13:17:29
 * @Description: 观察者
 */

let handlers = Symbol("handlers");

function makeObservable(target) {
  // 1. Initialize handlers store
  target[handlers] = [];

  // Store the handler function in array for future calls
  target.observe = function(handler) {
    this[handlers].push(handler);
  };

  // 2. Create a proxy to handle changes
  return new Proxy(target, {
    set(target, property, value, receiver) {
      let success = Reflect.set(...arguments); // forward the operation to object
      if (success) {
        // if there were no error while setting the property
        // call all handlers
        target[handlers].forEach(handler => handler(property, value));
      }
      return success;
    }
  });
}

let user = {};

user = makeObservable(user);

user.observe((key, value) => {
  console.log(`SET ${key}=${value}`);
});

user.name = "John";
user.age = "a34";
user.sex = 1;
