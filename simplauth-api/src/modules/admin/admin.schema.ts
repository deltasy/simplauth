import z from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const restoreUserSchema = z.object({
    username: z.string().openapi({description: "Deleted username", example: "Fulano"})
})