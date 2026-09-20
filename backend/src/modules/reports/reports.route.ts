import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createReportController,
  getMyReportsController,
  getMyReportByIdController,
} from "./reports.controller.js";
import { uploadReportPhoto } from "../../middleware/upload.middleware.js";

export const reportsRouter = Router();

reportsRouter.post(
  "/",
  authMiddleware,
  uploadReportPhoto,
  createReportController,
);

reportsRouter.get(
  "/",
  authMiddleware,
  getMyReportsController,
);

reportsRouter.get(
  "/:id",
  authMiddleware,
  getMyReportByIdController,
);