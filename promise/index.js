const bar = () => console.log("bar");

const baz = () => console.log("baz");

const foo = () => {
  console.log("foo");
  setTimeout(bar, 0);
  var sleep = function(test) {
    return new Promise((resolve, reject) => setTimeout(resolve(test), 20000));
  };
  sleep("test").then(value => console.log(value));
  baz();
};

foo();
