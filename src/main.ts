import * as myZ from "./my-zod";

const myZodSchema = myZ.object({
    name: myZ.optional(myZ.string().min(4)),
    age: myZ.number().min(40).optional()
});

const val = "sdfsdf";

type myZType = myZ.infer<typeof myZodSchema>;

const myZodResult = myZodSchema.safeParse(val);

console.log(myZodResult.success ? myZodResult.data : "Invalid");
