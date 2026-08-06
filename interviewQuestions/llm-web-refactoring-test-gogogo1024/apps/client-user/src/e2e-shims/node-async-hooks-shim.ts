// Minimal shim for `node:async_hooks` AsyncLocalStorage used in
// some server-side utilities. This is a no-op placeholder for
// browser/dev environments so bundlers can resolve the import.
export class AsyncLocalStorage {
  run(store, callback, ...args) {
    return callback(...args);
  }
  getStore() {
    return undefined;
  }
  enterWith(_store) {
    // no-op
  }
}

export default AsyncLocalStorage;
