import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(150, "Full name must not exceed 150 characters."),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short.")
    .max(30, "Phone number is too long."),

  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must not exceed 100 characters."),

  preferredLanguage: z
    .enum(["en", "yo", "pcm", "fr"])
    .default("en"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  password: z
    .string()
    .min(1, "Password is required."),
});