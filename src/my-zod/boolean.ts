import { MyZodType } from "./base";
import type { ParseContext } from "./types";

export function boolean() {
    return new MyZodBoolean();
}

class MyZodBoolean extends MyZodType<boolean> {
    protected validate(ctx: ParseContext) {
        if (typeof ctx.value === "boolean") return ctx;

        ctx.issues.push({
            path: [],
            message: "Expected boolean",
            fatal: true
        });

        return ctx;
    }
}