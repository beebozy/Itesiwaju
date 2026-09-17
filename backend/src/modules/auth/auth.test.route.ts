import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

export const authTestRouter = Router();

authTestRouter.get(
  "/citizen",
  authMiddleware,
  requireRole("CITIZEN"),
  (_req, res) => {
    res.json({
      message: "You are authorized as a citizen.",
    });
  },
);

authTestRouter.get(
  "/agency",
  authMiddleware,
  requireRole("AGENCY_OPERATOR"),
  (_req, res) => {
    res.json({
      message: "You are authorized as an agency operator.",
    });
  },
);