import { MyZodType } from "./base";
import type { ParseContext } from "./types";

function _enum<const T>(val: readonly T[]) {
    return new MyZodEnum<T>(val);
}

export { _enum as enum };

class MyZodEnum<const T> extends MyZodType<T> {
    private values: readonly T[];

    constructor(values: readonly T[]) {
        super();
        this.values = values;
    }

    protected validate(ctx: ParseContext) {
        if (this.values.includes(ctx.value as T)) return ctx;

        ctx.issues.push({
            path: [],
            message: "Expected correct enum",
            fatal: true
        });
        return ctx;
    }
}