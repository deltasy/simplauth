import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod"

extendZodWithOpenApi(z);

export const restoreUserSchema = z.object({
    username: z.string().openapi({description: "Nome do usuário deletado", example: "Fulano"})
})