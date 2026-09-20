import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { createReport, getMyReports, getMyReportById } from "./reports.service.js";
import { createReportSchema } from "./reports.schema.js";
import { uploadImage } from "../../services/cloudinary.service.js";
import { reverseGeocode } from "../../services/geocoding.service.js";

export async function createReportController(
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

  if (!req.file) {
    return res.status(400).json({
      error: {
        code: "PHOTO_REQUIRED",
        message: "Report photo is required.",
      },
    });
  }

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

  try {
    const uploaded = await uploadImage(req.file.buffer);

    const location = await reverseGeocode(
      result.data.latitude,
      result.data.longitude,
    );

    const report = await createReport({
      ...result.data,
      reporterId: req.user.userId,
      imageUrl: uploaded.secureUrl,
      address: location.address ?? undefined,
      ward: location.ward ?? undefined,
      lga: location.lga ?? undefined,
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

export async function getMyReportsController(
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
    const reports = await getMyReports(req.user.userId);

    return res.status(200).json({
      data: reports,
    });
  } catch (error) {
    console.error("Get my reports failed:", error);

    return res.status(500).json({
      error: {
        code: "REPORTS_FETCH_FAILED",
        message: "Failed to fetch reports.",
      },
    });
  }
}

export async function getMyReportByIdController(
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

  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid report id.",
      },
    });
  }

  try {
    const report = await getMyReportById(id, req.user.userId);

    if (!report) {
      return res.status(404).json({
        error: {
          code: "REPORT_NOT_FOUND",
          message: "Report not found.",
        },
      });
    }

    return res.status(200).json({
      data: report,
    });
  } catch (error) {
    console.error("Get report failed:", error);

    return res.status(500).json({
      error: {
        code: "REPORT_FETCH_FAILED",
        message: "Failed to fetch report.",
      },
    });
  }
}