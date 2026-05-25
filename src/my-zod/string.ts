import { MyZodType } from "./base";
import type { ParseContext } from "./types";

export function string() {
    return new MyZodString();
}

export function email() {
    return new MyZodEmail();
}

export function uuid() {
    return new MyZodUuid();
}

class MyZodString extends MyZodType<string> {
    protected validate(ctx: ParseContext) {
        if (typeof ctx.value === "string") return ctx;

        ctx.issues.push({
            path: [],
            message: "Expected string",
            fatal: true
        });

        return ctx;
    }

    min(length: number) {
        this.validators.push(ctx => {
            if (ctx.value.length >= length) return true;

            ctx.issues.push({
                path: [],
                message: "String is too short"
            });

            return false;
        });

        return this;
    }

    max(length: number) {
        this.validators.push(ctx => {
            if (ctx.value.length <= length) return true;

            ctx.issues.push({
                path: [],
                message: "String is too long"
            });

            return false;
        });

        return this;
    }

    length(length: number) {
        this.validators.push(ctx => {
            if (ctx.value.length === length) return true;

            ctx.issues.push({
                path: [],
                message: "String is not the exact length"
            });

            return false;
        });

        return this;
    }

    regex(pattern: RegExp) {
        this.validators.push(ctx => {
            if (ctx.value.match(pattern)) return true;

            ctx.issues.push({
                path: [],
                message: "String does not match the pattern"
            });

            return false;
        });

        return this;
    }

    trim() {
        this.transforms.push(input => input.trim());
        return this;
    }

    toLowerCase() {
        this.transforms.push(input => input.toLowerCase());
        return this;
    }

    toUpperCase() {
        this.transforms.push(input => input.toUpperCase());
        return this;
    }

}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

class MyZodEmail extends MyZodString {
    protected validate(ctx: ParseContext) {
        const newCtx = super.validate(ctx);
        if (ctx.issues.length !== newCtx.issues.length) return newCtx;

        const stringCtx = newCtx as ParseContext<string>;

        if (stringCtx.value.match(EMAIL_REGEX)) return stringCtx;

        ctx.issues.push({
            path: [],
            message: "Invalid email"
        });

        return stringCtx;
    }
}

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

class MyZodUuid extends MyZodString {
    protected validate(ctx: ParseContext) {
        const newCtx = super.validate(ctx);
        if (ctx.issues.length !== newCtx.issues.length) return newCtx;

        const stringCtx = newCtx as ParseContext<string>;

        if (stringCtx.value.match(UUID_REGEX)) return stringCtx;

        ctx.issues.push({
            path: [],
            message: "Invalid uuid"
        });

        return stringCtx;
    }
}