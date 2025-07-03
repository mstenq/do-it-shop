type GroupByResult<
  T,
  Groupers extends ((item: T) => PropertyKey)[],
> = Groupers extends [infer FirstGrouper, ...infer RestGroupers]
  ? FirstGrouper extends (item: T) => PropertyKey
    ? RestGroupers extends ((item: T) => PropertyKey)[]
      ? Record<
          ReturnType<FirstGrouper>,
          RestGroupers["length"] extends 0
            ? T[]
            : GroupByResult<T, RestGroupers>
        >
      : never
    : never
  : T[];

function groupBy<T, Groupers extends ((item: T) => PropertyKey)[]>(
  array: T[],
  groupers: [...Groupers]
): GroupByResult<T, Groupers> {
  if (groupers.length === 0) {
    return array as GroupByResult<T, Groupers>;
  }

  const result: Record<PropertyKey, any> = {};
  const currentGrouper = groupers[0];
  const remainingGroupers = groupers.slice(1);

  for (const item of array) {
    const key = currentGrouper(item);

    if (!result[key]) {
      result[key] =
        remainingGroupers.length > 0 ? groupBy([], remainingGroupers) : [];
    }

    if (remainingGroupers.length > 0) {
      const subGroup = groupBy([item], remainingGroupers);
      for (const subKey in subGroup) {
        if (!result[key][subKey]) {
          result[key][subKey] = [];
        }
        const subGroupArray = Array.isArray(subGroup[subKey])
          ? subGroup[subKey]
          : [subGroup[subKey]];
        result[key][subKey].push(...subGroupArray);
      }
    } else {
      result[key].push(item);
    }
  }

  return result as GroupByResult<T, Groupers>;
}

interface Person {
  name: string;
  age: number;
  city: string;
}

const data: Person[] = [
  { name: "John", age: 25, city: "NY" },
  { name: "Jack", age: 25, city: "NY" },
  { name: "Jane", age: 25, city: "LA" },
  { name: "Bob", age: 30, city: "NY" },
];

const result = groupBy(data, [(row) => row.age.toString(), (row) => row.city]);

console.log(JSON.stringify(result, null, 2));
