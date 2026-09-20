import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createAssignmentSchema } from "./assignments.schema.js";
import { createAssignment,acceptAssignment } from "./assignments.service.js";

export async function createAssignmentController(
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

  const result = createAssignmentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid assignment data.",
        details: result.error.issues,
      },
    });
  }

  const request: any = req.params.id;
  try {
    const assignment = await createAssignment(
      request,
      result.data.collectorId,
      req.user.userId,
    );

    return res.status(201).json({
      data: assignment,
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

      if (error.message === "CASE_NOT_VERIFIED") {
        return res.status(409).json({
          error: {
            code: "CASE_NOT_VERIFIED",
            message: "Only verified cases can be assigned.",
          },
        });
      }

      if (error.message === "COLLECTOR_NOT_FOUND") {
        return res.status(404).json({
          error: {
            code: "COLLECTOR_NOT_FOUND",
            message: "Collector not found.",
          },
        });
      }

      if (error.message === "USER_NOT_COLLECTOR") {
        return res.status(409).json({
          error: {
            code: "USER_NOT_COLLECTOR",
            message: "The selected user is not a collector.",
          },
        });
      }

      if (error.message === "COLLECTOR_INACTIVE") {
        return res.status(409).json({
          error: {
            code: "COLLECTOR_INACTIVE",
            message: "The selected collector is inactive.",
          },
        });
      }
    }

    console.error("Create assignment failed:", error);

    return res.status(500).json({
      error: {
        code: "ASSIGNMENT_CREATION_FAILED",
        message: "Failed to create assignment.",
      },
    });
  }
}export async function acceptAssignmentController(
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

  const assignmentId: any = req.params.assignmentId;

  if (!assignmentId) {
    return res.status(400).json({
      error: {
        code: "INVALID_ASSIGNMENT_ID",
        message: "Assignment ID is required.",
      },
    });
  }

  try {
    const result = await acceptAssignment(
      assignmentId,
      req.user.userId,
    );

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ASSIGNMENT_NOT_FOUND") {
        return res.status(404).json({
          error: {
            code: "ASSIGNMENT_NOT_FOUND",
            message: "Assignment not found.",
          },
        });
      }

      if (error.message === "ASSIGNMENT_NOT_OWNED") {
        return res.status(403).json({
          error: {
            code: "ASSIGNMENT_NOT_OWNED",
            message: "You are not assigned to this case.",
          },
        });
      }

      if (error.message === "INVALID_ASSIGNMENT_STATUS") {
        return res.status(409).json({
          error: {
            code: "INVALID_ASSIGNMENT_STATUS",
            message: "Only assigned assignments can be accepted.",
          },
        });
      }
    }

    console.error("Accept assignment failed:", error);

    return res.status(500).json({
      error: {
        code: "ASSIGNMENT_ACCEPT_FAILED",
        message: "Failed to accept assignment.",
      },
    });
  }
}