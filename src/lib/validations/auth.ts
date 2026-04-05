import { z } from "zod";

export const loginEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

/** Login page: email + password (primary); magic link validates email only via trigger. */
export const loginAuthFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginAuthFormValues = z.infer<typeof loginAuthFormSchema>;

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name is too long"),
    email: z.string().trim().email("Enter a valid email address"),
    password: passwordField,
    confirmPassword: z.string(),
    role: z.enum(["SELLER", "BUYER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
