import * as myZ from "./my-zod";

const myZodSchema = myZ.object({
    name: myZ.string(),
    age: myZ.number().optional()
});

const val = {
    name: "Rob",
};

const myZodResult = myZodSchema.safeParse(val);

console.log(myZodResult.success ? myZodResult.data : "Invalid");
