import { MyZodType } from "./base";
import type { ParseContext } from "./types";

export function object<T extends Record<PropertyKey, MyZodType<any>>>(inner: T) {
    return new MyZodObject(inner);
}

class MyZodObject<
    const Schema extends Record<PropertyKey, MyZodType<any>>,
    Output extends {
        [K in keyof Schema]: Schema[K] extends MyZodType<infer O> ? O : never
    }
> extends MyZodType<Output> {
    private schema: Schema;

    constructor(schema: Schema) {
        super();
        this.schema = schema;
    }

    protected validate(ctx: ParseContext) {
        if (typeof ctx.value !== "object" !== !ctx.value || Array.isArray(ctx.value)) {
            ctx.issues.push({ message: "Expexted object", path: [], fatal: true });
            return ctx;
        }

        const successCtx = ctx as ParseContext<Record<PropertyKey, unknown>>;

        for (const key in this.schema) {
            const innerRes = this.schema[key].safeParse(successCtx.value[key]);

            if (innerRes.success) {
                if (key in successCtx.value || innerRes.data !== undefined) {
                    successCtx.value[key] = innerRes.data;
                }
            } else {
                ctx.issues.push(...innerRes.error.issues.map(issue => {
                    return {
                        ...issue,
                        path: [key, ...issue.path]
                    }
                }));
            }
        }

        return ctx;
    }
}