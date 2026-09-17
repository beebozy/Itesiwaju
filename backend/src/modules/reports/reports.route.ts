import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createReportController } from "./reports.controller.js";

export const reportsRouter = Router();

reportsRouter.post(
  "/",
  authMiddleware,
  createReportController,
);