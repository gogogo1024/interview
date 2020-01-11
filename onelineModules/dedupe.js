"use strict";

function dedupe(client, hasher) {
  hasher = hasher || JSON.stringify;

  const clone = [];
  const lookup = {};

  for (let i = 0; i < client.length; i++) {
    let elem = client[i];
    let hashed = hasher(elem);

    if (!lookup[hashed]) {
      clone.push(elem);
      lookup[hashed] = true;
    }
  }
  return clone;
}
var a = [1, 2, 2, 3];
var b = dedupe(a);
// console.log(b);
var aa = [{ a: 2 }, { a: 1 }, { a: 1 }, { a: 1 }];
var bb = dedupe(aa);
console.log(JSON.stringify(bb, null, 2));
var aaa = [
  { a: 2, b: 1 },
  { a: 1, b: 2 },
  { a: 1, b: 3 },
  { a: 1, b: 4 }
];
var bbb = dedupe(aaa, value => value.a);

console.log(JSON.stringify(bbb, null, 2));

var aaaa = [
  { a: 2, b: 1, c: 2 },
  { a: 1, b: 2, c: 3 },
  { a: 2, b: 1, c: 4 },
  { a: 1, b: 4, c: 2 }
];
var bbbb = dedupe(aaaa, value => value.a + value.b);

console.log(JSON.stringify(bbbb, null, 2));
function delay(f, ms) {
  return new Proxy(f, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    }
  });
}

function sayHi(user) {
  console.log(`Hello, ${user}!`);
}

sayHi = delay(sayHi, 3000);

console.log(sayHi.length); // 1 (*) proxy forwards "get length" operation to the target

sayHi("John"); // Hello, John! (after 3 seconds)

let user = {
  _name: "Guest",
  get name() {
    return this._name;
  }
};

let userProxy = new Proxy(user, {
  get(target, prop, receiver) {
    return target[prop]; // (*) target = user
  }
});

let admin = {
  __proto__: userProxy,
  _name: "Admin"
};

// Expected: Admin
console.log(admin.name); // outputs: Guest (?!?)
