import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Permission } from "@prisma/client";

extendZodWithOpenApi(z);

export const userSchema = z.object({
    email: z.string().includes("@", {error: "Invalid e-mail"})
    .endsWith(".com", {error: "Invalid e-mail"})
    .openapi({example: "fulano@gmail.com"}),

    password: z.string({error: "Only text is allowed"}
    ).min(4, "Password too short").max(15, "Password too long").openapi({example: "senha123"}),

    username: z.string({error: "Only text is allowed"})
    .min(4, "Nickname too short").max(12, "Nickname too long").optional().openapi({example: "Usuario42"}),
});

export const selfProfileSchema = z.object({
    createdAt: z.string().openapi({example: "2026-09-12T18:13:15.026Z"}),

    email: z.string().includes("@", {error: "Invalid e-mail"}).includes(".com", {error: "Invalid e-mail"})
    .openapi({example: "fulano@gmail.com"}),

    username: z.string().nullish().openapi({example: "usuario42"}),

    permission: z.enum(Permission, {error: `Existing permissions: MEMBER or ADMIN`})
    .openapi({example: "ADMIN"})
});

export const editProfileSchema = selfProfileSchema.omit({
    createdAt: true,
    permission: true
}).partial().strict();

export const deletionConfirmSchema = z.object({
    delete: z.literal("confirm", {error : "Only an explicit confirmation text is allowed"})
    .openapi({example: "confirm"}),
});

export type User = z.infer<typeof userSchema>