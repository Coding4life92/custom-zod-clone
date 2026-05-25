import { MyZodType } from "./base";
import type { ParseContext } from "./types";

export function array<T>(schema: MyZodType<T>) {
    return new MyZodArray(schema);
}

class MyZodArray<T> extends MyZodType<T[]> {
    private inner: MyZodType<T>;

    constructor(schema: MyZodType<T>) {
        super();
        this.inner = schema;
    }

    protected validate(ctx: ParseContext) {
        if (!Array.isArray(ctx.value)) {
            ctx.issues.push({ message: "Expexted array", path: [], fatal: true });
            return ctx;
        }

        for (let i = 0; i < ctx.value.length; i++) {
            const item = ctx.value[i];
            const innerRes = this.inner.safeParse(item);

            if (innerRes.success) {
                ctx.value[i] = innerRes.data;
            } else {
                ctx.issues.push(...innerRes.error.issues.map(issue => {
                    return {
                        ...issue,
                        path: [i, ...issue.path]
                    }
                }));
            }
        }

        return ctx;
    }

    min(length: number) {
        this.validators.push(ctx => {
            if (ctx.value.length >= length) return true;

            ctx.issues.push({ message: "Array is too short", path: [] });

            return false;
        });

        return this;
    }

    max(length: number) {
        this.validators.push(ctx => {
            if (ctx.value.length <= length) return true;

            ctx.issues.push({ message: "Array is too long", path: [] });

            return false;
        });

        return this;
    }

    length(length: number) {
        this.validators.push(ctx => {
            if (ctx.value.length === length) return true;

            ctx.issues.push({ message: "Array is not the exact length", path: [] });

            return false;
        });

        return this;
    }
}