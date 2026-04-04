import { z } from "zod";

export const loginEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

/** Login page: email + optional password (magic link ignores password). */
export const loginAuthFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().optional(),
});

export type LoginAuthFormValues = z.infer<typeof loginAuthFormSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(["SELLER", "BUYER"]),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
