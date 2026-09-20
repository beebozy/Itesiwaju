import { Router } from "express";

import { reverseGeocode } from "../../services/geocoding.service.js";

export const geocodingTestRouter = Router();

geocodingTestRouter.get("/", async (_req, res) => {
  try {
    const location = await reverseGeocode(
      "6.524400",
      "3.379200",
    );

    return res.json({
      data: location,
    });
  } catch (error) {
    console.error("Geocoding test failed:", error);

    return res.status(500).json({
      error: {
        code: "GEOCODING_FAILED",
        message: "Reverse geocoding failed.",
      },
    });
  }
});