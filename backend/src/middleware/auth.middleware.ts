import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { USER_ROLES } from "../types/auth.js";
import type { UserRole } from "../types/auth.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token is required.",
      },
    });

    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      error: {
        code: "INVALID_AUTHORIZATION_HEADER",
        message: "Authorization header must use Bearer token.",
      },
    });

    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string"
    ) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token.",
        },
      });

      return;
    }

    const isValidRole = USER_ROLES.includes(
      payload.role as UserRole,
    );

    if (!isValidRole) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token.",
        },
      });

      return;
    }

    req.user = {
      userId: payload.userId,
      role: payload.role as UserRole,
    };

    next();
  } catch {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired authentication token.",
      },
    });

    return;
  }
}