import { z } from "zod";

export const createAssignmentSchema = z.object({
  collectorId: z.string().uuid("Invalid collector ID."),
});