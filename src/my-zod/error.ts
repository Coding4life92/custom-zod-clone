export class MyZodError extends Error {
    issues: MyZodIssue[];

    constructor(issues: MyZodIssue[]) {
        super(JSON.stringify(issues));

        this.name = "MyZodError";
        this.issues = issues;
    }
}

export type MyZodIssue = {
    message: string;
    fatal?: boolean;
    path: PropertyKey[];
}