/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as employees from "../employees.js";
import type * as incrementors from "../incrementors.js";
import type * as positions from "../positions.js";
import type * as search from "../search.js";
import type * as storage from "../storage.js";
import type * as triggers from "../triggers.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  employees: typeof employees;
  incrementors: typeof incrementors;
  positions: typeof positions;
  search: typeof search;
  storage: typeof storage;
  triggers: typeof triggers;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
