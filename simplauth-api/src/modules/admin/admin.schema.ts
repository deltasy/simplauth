import z from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const restoreUserSchema = z.object({
    username: z.string().openapi({description: "Nome do usuário deletado", example: "Fulano"})
})