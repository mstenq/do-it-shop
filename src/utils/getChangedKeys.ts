type Obj = Record<string, string>;

export const getChangedKeys = (obj1: Obj, obj2: Obj) => {
  const changedKeys1 = Object.keys(obj2).filter(
    (key) => obj1[key] !== obj2[key],
  );
  const changedKeys2 = Object.keys(obj1).filter(
    (key) => obj2[key] !== obj1[key],
  );
  const uniqueChangedKeys = [...new Set([...changedKeys1, ...changedKeys2])];

  return uniqueChangedKeys;
};
