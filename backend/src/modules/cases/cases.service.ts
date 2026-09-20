import { db } from "../../db/client.js";
import {
  caseEvents,
  wasteCases,
} from "../../db/schema/index.js";

import { eq } from "drizzle-orm";

type CaseStatus =
  | "REPORTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED"
  | "DUPLICATE"
  | "REOPENED";

const allowedTransitions: Record<CaseStatus, CaseStatus[]> = {
  REPORTED: ["UNDER_REVIEW"],

  UNDER_REVIEW: [
    "VERIFIED",
    "REJECTED",
    "DUPLICATE",
  ],

  VERIFIED: ["ASSIGNED"],

  ASSIGNED: ["ACCEPTED"],

  ACCEPTED: ["IN_PROGRESS"],

  IN_PROGRESS: ["RESOLVED"],

  RESOLVED: [
    "CLOSED",
    "REOPENED",
  ],

  CLOSED: [],

  REJECTED: [],

  DUPLICATE: [],

  REOPENED: ["UNDER_REVIEW"],
};

export async function updateCaseStatus(
  caseId: string,
  newStatus: CaseStatus,
  actorId: string,
) {
  return db.transaction(async (tx) => {
    const [existingCase] = await tx
      .select()
      .from(wasteCases)
      .where(eq(wasteCases.id, caseId))
      .limit(1);

    if (!existingCase) {
      throw new Error("CASE_NOT_FOUND");
    }

    const currentStatus = existingCase.status as CaseStatus;

    const allowedStatuses =
      allowedTransitions[currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const [updatedCase] = await tx
      .update(wasteCases)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(wasteCases.id, caseId))
      .returning();

    const [event] = await tx
      .insert(caseEvents)
      .values({
        caseId,
        actorId,
        eventType: newStatus,
        description: `Case status changed from ${currentStatus} to ${newStatus}.`,
        metadata: {
          previousStatus: currentStatus,
          newStatus,
        },
      })
      .returning();

    return {
      case: updatedCase,
      event,
    };
  });
}