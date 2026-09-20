import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { getOverview } from "./analytics.service.js";

export async function getOverviewController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      },
    });
  }

  try {
    const overview = await getOverview();

    return res.status(200).json({
      data: overview,
    });
  } catch (error) {
    console.error("Get analytics overview failed:", error);

    return res.status(500).json({
      error: {
        code: "ANALYTICS_OVERVIEW_FAILED",
        message: "Failed to retrieve analytics overview.",
      },
    });
  }
}