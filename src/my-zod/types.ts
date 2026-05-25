import type { MyZodType } from "./base";
import type { MyZodIssue } from "./error";

export type ParseContext<T = unknown> = {
    value: T;
    issues: MyZodIssue[];
}

export type infer<T extends MyZodType<any>> = T extends MyZodType<infer O> ? O : never;