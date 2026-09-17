import type { Request, Response } from "express";

import { registerUser, loginUser } from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

export async function registerController(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid registration data.",
        details: result.error.issues,
      },
    });
  }

  try {
    const user = await registerUser(result.data);

    return res.status(201).json({
      data: { user },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PHONE_ALREADY_EXISTS") {
        return res.status(409).json({
          error: {
            code: "PHONE_ALREADY_EXISTS",
            message: "A user with this phone number already exists.",
          },
        });
      }

      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "A user with this email already exists.",
          },
        });
      }
    }

    console.error("Registration failed:", error);

    return res.status(500).json({
      error: {
        code: "REGISTRATION_FAILED",
        message: "Failed to register user.",
      },
    });
  }
}

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid login data.",
        details: parsed.error.issues,
      },
    });
  }

  try {
    const result = await loginUser(parsed.data.email, parsed.data.password);

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password.",
          },
        });
      }

      if (error.message === "ACCOUNT_DISABLED") {
        return res.status(403).json({
          error: {
            code: "ACCOUNT_DISABLED",
            message: "This account is disabled.",
          },
        });
      }
    }

    console.error("Login failed:", error);

    return res.status(500).json({
      error: {
        code: "LOGIN_FAILED",
        message: "Failed to login.",
      },
    });
  }
}