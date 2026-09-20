import { z } from "zod";

export const updateCaseStatusSchema = z.object({
  status: z.enum([
    "UNDER_REVIEW",
    "VERIFIED",
    "ASSIGNED",
    "ACCEPTED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
    "DUPLICATE",
    "REOPENED",
  ]),
});