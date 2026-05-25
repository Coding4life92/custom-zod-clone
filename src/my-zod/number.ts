import { MyZodType } from "./base";
import type { ParseContext } from "./types";

export function number() {
    return new MyZodNumber();
}

export function int() {
    return new MyZodInt();
}

class MyZodNumber extends MyZodType<number> {
    protected validate(ctx: ParseContext) {
        if (typeof ctx.value === "number" && Number.isFinite(ctx.value)) {
            return ctx;
        }

        ctx.issues.push({
            path: [],
            message: "Expected number",
            fatal: true
        });

        return ctx;
    }

    min(n: number) {
        this.validators.push(ctx => {
            if (ctx.value >= n) return true;

            ctx.issues.push({
                path: [],
                message: "Number is too small"
            });

            return false;
        });

        return this;
    }

    max(n: number) {
        this.validators.push(ctx => {
            if (ctx.value <= n) return true;

            ctx.issues.push({
                path: [],
                message: "Number is too large"
            });

            return false;
        });

        return this;
    }

    positive() {
        this.validators.push(ctx => {
            if (ctx.value > 0) return true;

            ctx.issues.push({
                path: [],
                message: "Number must be positive"
            });

            return false;
        });

        return this;
    }

    negative() {
        this.validators.push(ctx => {
            if (ctx.value < 0) return true;

            ctx.issues.push({
                path: [],
                message: "Number must be negative"
            });

            return false;
        });

        return this;
    }
}

class MyZodInt extends MyZodNumber {
    protected validate(ctx: ParseContext) {
        const newCtx = super.validate(ctx);
        if (ctx.issues.length !== newCtx.issues.length) return newCtx;

        const numberCtx = newCtx as ParseContext<number>;

        if (Number.isInteger(numberCtx.value)) return numberCtx;

        ctx.issues.push({
            path: [],
            message: "Expected integer"
        });

        return numberCtx;
    }
}