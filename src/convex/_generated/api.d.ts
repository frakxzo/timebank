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
import type * as admin from "../admin.js";
import type * as applications from "../applications.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as courses from "../courses.js";
import type * as http from "../http.js";
import type * as pointPackages from "../pointPackages.js";
import type * as profile from "../profile.js";
import type * as projects from "../projects.js";
import type * as seedData from "../seedData.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  applications: typeof applications;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  courses: typeof courses;
  http: typeof http;
  pointPackages: typeof pointPackages;
  profile: typeof profile;
  projects: typeof projects;
  seedData: typeof seedData;
  transactions: typeof transactions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
