import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";

import {
  updateCaseStatusController,
} from "./cases.controller.js";

export const casesRouter = Router();

casesRouter.patch(
  "/:id/status",
  authMiddleware,
  updateCaseStatusController,
);