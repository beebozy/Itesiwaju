import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

import { createAssignmentController,acceptAssignmentController } from "./assignments.controller.js";

export const assignmentsRouter = Router();

assignmentsRouter.post(
  "/:id/assign",
  authMiddleware,
  requireRole("AGENCY_OPERATOR", "ADMIN"),
  createAssignmentController,
);
assignmentsRouter.post(
  "/:assignmentId/accept",
  authMiddleware,
  requireRole("COLLECTOR"),
  acceptAssignmentController,
);