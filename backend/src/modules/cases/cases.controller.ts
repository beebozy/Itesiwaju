import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

import {
  updateCaseStatus,
} from "./cases.service.js";

import {
  updateCaseStatusSchema,
} from "./cases.schema.js";

export async function updateCaseStatusController(
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

  const result = updateCaseStatusSchema.safeParse(
    req.body,
  );

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid case status.",
        details: result.error.issues,
      },
    });
  }

  let caseId: any= req.params.id;
  try {
    const resultData = await updateCaseStatus(
      caseId,
      result.data.status,
      req.user.userId,
    );

    return res.status(200).json({
      data: resultData,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CASE_NOT_FOUND") {
        return res.status(404).json({
          error: {
            code: "CASE_NOT_FOUND",
            message: "Case not found.",
          },
        });
      }

      if (
        error.message ===
        "INVALID_STATUS_TRANSITION"
      ) {
        return res.status(409).json({
          error: {
            code: "INVALID_STATUS_TRANSITION",
            message: "This case status transition is not allowed.",
          },
        });
      }
    }

    console.error(
      "Update case status failed:",
      error,
    );

    return res.status(500).json({
      error: {
        code: "CASE_STATUS_UPDATE_FAILED",
        message: "Failed to update case status.",
      },
    });
  }
}