import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createReport } from "./reports.service.js";
import { createReportSchema } from "./reports.schema.js";

export async function createReportController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const result = createReportSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid report data.",
        details: result.error.issues,
      },
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      },
    });
  }

  try {
    const report = await createReport({
      ...result.data,
      reporterId: req.user.userId,
    });

    return res.status(201).json({
      data: report,
    });
  } catch (error) {
    console.error("Create report failed:", error);

    return res.status(500).json({
      error: {
        code: "REPORT_CREATION_FAILED",
        message: "Failed to create report.",
      },
    });
  }
}