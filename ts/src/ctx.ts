/**
 * @author [gogogo1024]
 * @email [jxycbjhc@gmail.com]
 * @create date 2023-03-29 02:13:58
 * @modify date 2023-03-29 02:13:58
 * @desc [description] ctx上的变量全局共享，但是不同的ctx上的数据相互独立
 */

import { strict as assert } from "node:assert";

type Ctx = Map<symbol, Slice>;

type Slice<T = unknown> = {
  id: symbol;
  set: (value: T) => void;
  get: () => T;
};

type Metadata<T> = {
  id: symbol;
  (ctx: Ctx): Slice<T>;
};
const createSlice = <T>(defaultValue: T): Metadata<T> => {
  const id = Symbol("Slice");

  const metadata = (ctx: Ctx) => {
    let inner = defaultValue;
    const slice: Slice<T> = {
      id,
      set: (next) => {
        inner = next;
      },
      get: () => inner,
    };
    ctx.set(id, slice as Slice);
    return slice;
  };
  metadata.id = id;

  return metadata;
};

const createCtx = () => {
  // 每一个ctx都有一个map,所以createSlice中用来处理map的metadata函数只是
  // 初始值defaultValue相同，id是不同的，因为Symbol("Slice")!=Symbol("Slice")
  // 这样就达到了ctx可以全局共享，但是不同的ctx的数据是相互独立
  const map: Ctx = new Map();

  const getSlice = <T>(metadata: Metadata<T>): Slice<T> => {
    const value = map.get(metadata.id);
    if (!value) {
      throw new Error("Slice not injected");
    }
    return value as Slice<T>;
  };

  return {
    inject: <T>(metadata: Metadata<T>) => metadata(map),
    get: <T>(metadata: Metadata<T>): T => getSlice(metadata).get(),
    set: <T>(metadata: Metadata<T>, value: T): void => {
      getSlice(metadata).set(value);
    },
  };
};

const num = createSlice(0);
const ctx1 = createCtx();
const ctx2 = createCtx();

ctx1.inject(num);
ctx2.inject(num);

const values = [];

const x = ctx1.get(num);
values.push(x);

ctx1.set(num, x + 1);

values.push(ctx1.get(num));
values.push(ctx2.get(num));

assert.deepEqual(values, [0, 1, 0], "fail");
