import { z } from "zod";

export const createReportSchema = z.object({
  description: z.string().optional(),

  latitude: z.string().optional(),

  longitude: z.string().optional(),

  locationAccuracy: z.string().optional(),

  privacyLevel: z
    .enum(["IDENTIFIED", "PRIVATE"])
    .default("PRIVATE"),

  imageUrl: z.string().url(),

  capturedAt: z.coerce.date().optional(),
});