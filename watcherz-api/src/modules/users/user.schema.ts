import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Permission } from "@prisma/client";
import { z } from "zod"

extendZodWithOpenApi(z);

export const userSchema = z.object({
    email: z.string().includes("@", {error: "E-mail inválido"})
    .endsWith(".com", {error: "E-mail inválido"})
    .openapi({example: "fulano@gmail.com"}),

    password: z.string({error: "Apenas texto é permitido"}
    ).min(4, "Senha muito curta").max(15, "Senha muito grande").openapi({example: "senha123"}),

    username: z.string({error: "Apenas texto é permitido"})
    .min(4, "Nickname muito curto").max(12, "Nickname muito grande").optional().openapi({example: "Usuario42"}),
});

export const selfProfileSchema = z.object({
    createdAt: z.string().openapi({example: "2026-09-12T18:13:15.026Z"}),

    email: z.string().includes("@", {error: "E-mail inválido"}).includes(".com", {error: "E-mail inválido"})
    .openapi({example: "fulano@gmail.com"}),

    username: z.string().nullish().openapi({example: "usuario42"}),

    permission: z.enum(Permission, {error: `Permissões existentes: MEMBER ou ADMIN`})
    .openapi({example: "ADMIN"})
});

export const editProfileSchema = selfProfileSchema.omit({
    createdAt: true,
    permission: true
}).partial().strict();

export const deletionConfirmSchema = z.object({
    delete: z.literal("confirmar", {error : "Apenas um texto de confirmação explícita é permitido"})
    .openapi({example: "confirmar"}),
});

export type User = z.infer<typeof userSchema>