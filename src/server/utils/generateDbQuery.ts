import {
  and,
  or,
  type Column,
  type eq,
  type like,
  type SQL,
} from "drizzle-orm";

type FilterType = typeof eq | typeof like;

export type QueryOption = {
  columns: (Column | SQL)[];
  values: Array<string> | Array<number>;
  filterType: FilterType;
};

export const generateDbQuery = (...args: QueryOption[]) => {
  const query = [];
  for (const { columns, values, filterType } of args) {
    const orQuery = [];
    for (const column of columns) {
      for (const value of values) {
        orQuery.push(filterType(column as Column, value as string));
      }
    }
    query.push(or(...orQuery)!);
  }
  return and(...query)!;
};
