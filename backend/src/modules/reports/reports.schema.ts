import { z } from "zod";

export const createReportSchema = z.object({
  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  latitude: z
    .string()
    .trim()
    .refine((value) => {
      const number = Number(value);

      return (
        Number.isFinite(number) &&
        number >= -90 &&
        number <= 90
      );
    }, "Latitude must be between -90 and 90."),

  longitude: z
    .string()
    .trim()
    .refine((value) => {
      const number = Number(value);

      return (
        Number.isFinite(number) &&
        number >= -180 &&
        number <= 180
      );
    }, "Longitude must be between -180 and 180."),

  locationAccuracy: z
    .string()
    .trim()
    .refine((value) => {
      const number = Number(value);

      return (
        Number.isFinite(number) &&
        number >= 0
      );
    }, "Location accuracy must be a positive number."),

  privacyLevel: z
    .enum(["IDENTIFIED", "PRIVATE"])
    .default("PRIVATE"),

  capturedAt: z.coerce.date().optional(),
});

//imageUrl: z.string().url(),