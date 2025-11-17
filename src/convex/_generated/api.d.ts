/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminSchema from "../adminSchema.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as books from "../books.js";
import type * as crons from "../crons.js";
import type * as dailyLogs from "../dailyLogs.js";
import type * as finance from "../finance.js";
import type * as habits from "../habits.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as seed from "../seed.js";
import type * as tasks from "../tasks.js";
import type * as trial from "../trial.js";
import type * as users from "../users.js";
import type * as workouts from "../workouts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminSchema: typeof adminSchema;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  books: typeof books;
  crons: typeof crons;
  dailyLogs: typeof dailyLogs;
  finance: typeof finance;
  habits: typeof habits;
  health: typeof health;
  http: typeof http;
  seed: typeof seed;
  tasks: typeof tasks;
  trial: typeof trial;
  users: typeof users;
  workouts: typeof workouts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
