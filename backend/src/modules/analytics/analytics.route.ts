import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

import { getOverviewController } from "./analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.get(
  "/overview",
  authMiddleware,
  requireRole("AGENCY_OPERATOR", "ADMIN"),
  getOverviewController,
);