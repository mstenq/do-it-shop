import { api } from "@convex/api";
import { FunctionReturnType } from "convex/server";

type PathToType<T, P extends string> = P extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? PathToType<T[First], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type ApiPaths<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? `${K & string}` | `${K & string}.${ApiPaths<T[K]>}`
        : `${K & string}`;
    }[keyof T]
  : never;

export type ConvexType<Path extends ApiPaths<typeof api>> = NonNullable<
  // @ts-ignore
  FunctionReturnType<PathToType<typeof api, Path>>
>;
