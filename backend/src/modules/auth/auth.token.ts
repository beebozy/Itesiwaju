import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export function createAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
}