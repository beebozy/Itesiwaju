import { count, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { wasteCases } from "../../db/schema/index.js";

export async function getOverview() {
  const totalResult = await db
    .select({ count: count() })
    .from(wasteCases);

  const reportedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "REPORTED"));

  const underReviewResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "UNDER_REVIEW"));

  const verifiedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "VERIFIED"));

  const assignedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "ASSIGNED"));

  const acceptedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "ACCEPTED"));

  const inProgressResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "IN_PROGRESS"));

  const resolvedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "RESOLVED"));

  const closedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "CLOSED"));

  const rejectedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "REJECTED"));

  const duplicateResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "DUPLICATE"));

  const reopenedResult = await db
    .select({ count: count() })
    .from(wasteCases)
    .where(eq(wasteCases.status, "REOPENED"));

  return {
    totalCases: totalResult[0].count,

    casesByStatus: {
      reported: reportedResult[0].count,
      underReview: underReviewResult[0].count,
      verified: verifiedResult[0].count,
      assigned: assignedResult[0].count,
      accepted: acceptedResult[0].count,
      inProgress: inProgressResult[0].count,
      resolved: resolvedResult[0].count,
      closed: closedResult[0].count,
      rejected: rejectedResult[0].count,
      duplicate: duplicateResult[0].count,
      reopened: reopenedResult[0].count,
    },
  };
}