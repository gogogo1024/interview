const swapArray = (Arr, Caller, Target) => {
  let Instance = Arr.constructor();
  let Stash = Arr;

  let InstanceType = Array.isArray(Instance) ? "array" : typeof Instance;

  // Check types and throw err if no arr is passed
  if (InstanceType !== "array")
    throw "[ERR] SwapArray expects a array as first param";

  // Copy the Arr-Content into new Instance - so we don't overwrite the passed array
  Stash.map((s, i) => (Instance[i] = s));

  // Update indexes
  // splice() 方法通过删除或替换现有元素或者原地添加新的元素来修改数组,
  //并以数组形式返回被修改的内容。此方法会改变原数组
  Instance[Caller] = Instance.splice(Target, 1, Instance[Caller])[0];

  return Instance;
};
const SomeArray = ["thats", "cool", "dude"];

console.log(swapArray(SomeArray, 0, 2));
