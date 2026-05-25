import { MyZodType } from "./base";
import type { ParseContext } from "./types";

type Literal = string | number | bigint | boolean | null | undefined;

export function literal<const T extends Literal>(value: T | readonly T[]) {
    return new MyZodLiteral<T>(value);
}

export function num() {
    return new MyZodNaN();
}

export function any() {
    return new MyZodAny();
}

export function unknown() {
    return new MyZodUnknown();
}

export function never() {
    return new MyZodNever();
}

function _null() {
    return new MyZodNull();
}

function _undefined() {
    return new MyZodUndefined();
}

export { _null as null };
export { _undefined as undefined };

class MyZodLiteral<const T extends Literal> extends MyZodType<T> {
    private values: readonly T[];

    constructor(value: T | readonly T[]) {
        super();
        this.values = Array.isArray(value) ? value : [value];
    }

    protected validate(ctx: ParseContext) {
        if (this.values.includes(ctx.value as T)) return ctx;

        ctx.issues.push({
            path: [],
            message: `Expected ${this.values
                .map(v => JSON.stringify(v))
                .join(", ")}`,
            fatal: true
        });
        return ctx;
    }
}

class MyZodNull extends MyZodLiteral<null> {
    constructor() {
        super(null);
    }
}

class MyZodUndefined extends MyZodLiteral<undefined> {
    constructor() {
        super(undefined);
    }
}

class MyZodNaN extends MyZodType<number> {
    protected validate(ctx: ParseContext) {
        if (Number.isNaN(ctx.value)) return ctx;

        ctx.issues.push({
            path: [],
            message: "Expected NaN",
            fatal: true
        });
        return ctx;
    }
}

class MyZodAny extends MyZodType<any> {
    protected validate(ctx: ParseContext) {
        return ctx;
    }
}

class MyZodUnknown extends MyZodType<unknown> {
    protected validate(ctx: ParseContext) {
        return ctx;
    }
}

class MyZodNever extends MyZodType<unknown> {
    protected validate(ctx: ParseContext) {
        ctx.issues.push({
            path: [],
            message: "Expected never",
            fatal: true
        });

        return ctx;
    }
}