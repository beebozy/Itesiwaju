import type { Request, Response } from "express";

import { createReport } from "./reports.service.js";

export async function createReportController(
  req: Request,
  res: Response,
) {
  try {
    const result = await createReport(req.body);

    return res.status(201).json({
      data: {
        caseNumber: result.wasteCase.caseNumber,
        status: result.wasteCase.status,
      },
    });
  } catch (error) {
    console.error("Failed to create report:", error);

    return res.status(500).json({
      error: {
        code: "REPORT_CREATION_FAILED",
        message: "Failed to create report.",
      },
    });
  }
}