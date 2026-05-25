import { MyZodError } from "./error";
import type { infer as myZodInfer, ParseContext } from "./types";

export abstract class MyZodType<T> {
    protected validators: Array<(ctx: ParseContext<T>) => boolean> = [];
    protected customValidators: Array<(ctx: ParseContext<T>) => boolean> = [];
    protected transforms: Array<(input: T) => T> = [];

    protected abstract validate(ctx: ParseContext): ParseContext;

    #default: T | undefined;

    parse(input: unknown): T {
        const res = this.safeParse(input);
        if (res.success) return res.data;

        throw res.error;
    }

    safeParse(input: unknown): { success: true; data: T } | { success: false; error: MyZodError } {
        if (input === undefined && this.#default !== undefined) {
            return { success: true, data: this.#default };
        }
        const data = this.validate({
            value: input,
            issues: []
        });

        if (data.issues.some(issue => issue.fatal && issue.path.length === 0)) {
            return {
                success: false,
                error: new MyZodError(data.issues)
            };
        }

        const successData = data as ParseContext<T>;

        this.validators.forEach(fn => fn(successData));

        if (data.issues.some(issue => issue.fatal && issue.path.length === 0)) {
            return { success: false, error: new MyZodError(data.issues) };
        }

        if (successData.issues.length > 0) {
            return {
                success: false,
                error: new MyZodError(successData.issues)
            };
        }

        return {
            success: true,
            data: this.transforms.reduce((acc, fn) => fn(acc), successData.value)
        };
    }

    optional() {
        return optional(this);
    }

    nullable() {
        return nullable(this);
    }

    transform<Out>(fn: (input: T) => Out) {
        return new MyZodTransform<Out, T>(this, fn);
    }

    default(val: T) {
        this.#default = val;

        return this;
    }

    refine(fn: (input: T) => boolean, message: string) {
        this.customValidators.push(ctx => {
            if (fn(ctx.value)) return true;

            ctx.issues.push({ message, path: [] });

            return false;
        });

        return this;
    }
}

export function optional<T extends MyZodType<any>>(schema: T) {
    return new MyZodOptional(schema);
}

export function nullable<T extends MyZodType<any>>(schema: T) {
    return new MyZodNullable(schema);
}

class MyZodOptional<T extends MyZodType<any>> extends MyZodType<undefined | myZodInfer<T>> {
    private schema: T;

    constructor(schema: T) {
        super();
        this.schema = schema;
    }

    protected validate(ctx: ParseContext) {
        if (ctx.value === undefined) return ctx;

        const res = this.schema.safeParse(ctx.value);
        if (res.success) {
            ctx.value = res.data;
        } else {
            ctx.issues.push(...res.error.issues);
        }

        return ctx;
    }
}

class MyZodNullable<T extends MyZodType<any>> extends MyZodType<null | myZodInfer<T>> {
    private schema: T;

    constructor(schema: T) {
        super();
        this.schema = schema;
    }

    protected validate(ctx: ParseContext) {
        if (ctx.value === null) return ctx;

        const res = this.schema.safeParse(ctx.value);
        if (res.success) {
            ctx.value = res.data;
        } else {
            ctx.issues.push(...res.error.issues);
        }

        return ctx;
    }
}

class MyZodTransform<Out, In> extends MyZodType<Out> {
    private inputSchema: MyZodType<In>;
    private transformFn: (input: In) => Out;

    constructor(schema: MyZodType<In>, transformFn: (input: In) => Out) {
        super();
        this.inputSchema = schema;
        this.transformFn = transformFn;
    }

    protected validate(ctx: ParseContext) {
        const res = this.inputSchema.safeParse(ctx.value);

        if (res.success) {
            ctx.value = this.transformFn(res.data);
        } else {
            ctx.issues.push(...res.error.issues);
        }

        return ctx;
    }
}