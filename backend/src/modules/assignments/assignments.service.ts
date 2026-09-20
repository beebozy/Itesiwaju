import { eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import {
  assignments,
  caseEvents,
  users,
  wasteCases,
} from "../../db/schema/index.js";

export async function createAssignment(
  caseId: string,
  collectorId: string,
  assignedBy: string,
) {
  return db.transaction(async (tx) => {
    // 1. Find the case
    const [wasteCase] = await tx
      .select()
      .from(wasteCases)
      .where(eq(wasteCases.id, caseId))
      .limit(1);

    if (!wasteCase) {
      throw new Error("CASE_NOT_FOUND");
    }

    // 2. Case must be verified before assignment
    if (wasteCase.status !== "VERIFIED") {
      throw new Error("CASE_NOT_VERIFIED");
    }

    // 3. Find the collector
    const [collector] = await tx
      .select()
      .from(users)
      .where(eq(users.id, collectorId))
      .limit(1);

    if (!collector) {
      throw new Error("COLLECTOR_NOT_FOUND");
    }

    // 4. Make sure the user is actually a collector
    if (collector.role !== "COLLECTOR") {
      throw new Error("USER_NOT_COLLECTOR");
    }

    // 5. Make sure the collector is active
    if (!collector.isActive) {
      throw new Error("COLLECTOR_INACTIVE");
    }

    // 6. Create assignment
    const [assignment] = await tx
      .insert(assignments)
      .values({
        caseId,
        collectorId,
        assignedBy,
        status: "ASSIGNED",
      })
      .returning();

    // 7. Move case to ASSIGNED
    const [updatedCase] = await tx
      .update(wasteCases)
      .set({
        status: "ASSIGNED",
        updatedAt: new Date(),
      })
      .where(eq(wasteCases.id, caseId))
      .returning();

    // 8. Record the assignment event
    const [event] = await tx
      .insert(caseEvents)
      .values({
        caseId,
        actorId: assignedBy,
        eventType: "ASSIGNED",
        description: "Case assigned to collector.",
        metadata: {
          collectorId,
          assignmentId: assignment.id,
        },
      })
      .returning();

    return {
      assignment,
      case: updatedCase,
      event,
    };
  });
}
export async function acceptAssignment(
  assignmentId: string,
  collectorId: string,
) {
  return db.transaction(async (tx) => {
    // 1. Find the assignment
    const [assignment] = await tx
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      throw new Error("ASSIGNMENT_NOT_FOUND");
    }

    // 2. Make sure this assignment belongs to the logged-in collector
    if (assignment.collectorId !== collectorId) {
      throw new Error("ASSIGNMENT_NOT_OWNED");
    }

    // 3. Assignment must currently be ASSIGNED
    if (assignment.status !== "ASSIGNED") {
      throw new Error("INVALID_ASSIGNMENT_STATUS");
    }

    // 4. Update assignment
    const [updatedAssignment] = await tx
      .update(assignments)
      .set({
        status: "ACCEPTED",
        acceptedAt: new Date(),
      })
      .where(eq(assignments.id, assignmentId))
      .returning();

    // 5. Update case to ACCEPTED
    const [updatedCase] = await tx
      .update(wasteCases)
      .set({
        status: "ACCEPTED",
        updatedAt: new Date(),
      })
      .where(eq(wasteCases.id, assignment.caseId))
      .returning();

    // 6. Record case event
    const [event] = await tx
      .insert(caseEvents)
      .values({
        caseId: assignment.caseId,
        actorId: collectorId,
        eventType: "ACCEPTED",
        description: "Collector accepted the assignment.",
        metadata: {
          assignmentId,
        },
      })
      .returning();

    return {
      assignment: updatedAssignment,
      case: updatedCase,
      event,
    };
  });
}