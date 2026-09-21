import { db } from "../../db/client.js";
import {
  wasteCases,
  caseEvents,
    evidence,
} from "../../db/schema/index.js";
import {and,desc, eq} from "drizzle-orm";

export interface CreateReportInput {
  reporterId: string;

  description?: string;

  latitude?: string;
  longitude?: string;
  locationAccuracy?: string;

  address?: string;
  street?: string;
  ward?: string;
  lga?: string;

  privacyLevel?: "IDENTIFIED" | "PRIVATE";

  imageUrl: string;

  capturedAt?: Date;
}
function generateCaseNumber(): string {
  const timestamp = Date.now();

  return `LAG-${timestamp}`;
}

export async function createReport(input: CreateReportInput) {
  return db.transaction(async (tx:any) => {
    // 1. Create the waste case
    const [wasteCase] = await tx
      .insert(wasteCases)
 .values({
  caseNumber: generateCaseNumber(),
  reporterId: input.reporterId,

  source: "MOBILE",
  status: "REPORTED",

  description: input.description,

  latitude: input.latitude,
  longitude: input.longitude,
  locationAccuracy: input.locationAccuracy,

  address: input.address,
  street: input.street,
  ward: input.ward,
  lga: input.lga,

  privacyLevel: input.privacyLevel ?? "PRIVATE",

  reportedAt: new Date(),
})
      .returning();

    // 2. Create the evidence record
    const [reportEvidence] = await tx
      .insert(evidence)
      .values({
        caseId: wasteCase.id,

        uploadedBy: input.reporterId,

        type: "REPORT_PHOTO",

        mediaUrl: input.imageUrl,

        capturedAt: input.capturedAt,
      })
      .returning();

    // 3. Create the initial case event
    const [event] = await tx
      .insert(caseEvents)
      .values({
        caseId: wasteCase.id,

        actorId: input.reporterId,

        eventType: "REPORTED",

        description: "Waste report submitted.",

        metadata: {
          source: "MOBILE",
        },
      })
      .returning();

    return {
      wasteCase,
      evidence: reportEvidence,
      event,
    };
    
  });

  
};

export async function getAllReports() {
  const cases = await db
    .select()
    .from(wasteCases)
    .orderBy(desc(wasteCases.createdAt));

  const allEvidence = await db
    .select({
      caseId: evidence.caseId,
      mediaUrl: evidence.mediaUrl,
      type: evidence.type,
    })
    .from(evidence);

  const evidenceMap = new Map<string, string>();
  for (const ev of allEvidence) {
    if (!evidenceMap.has(ev.caseId) || ev.type === "REPORT_PHOTO") {
      evidenceMap.set(ev.caseId, ev.mediaUrl);
    }
  }

  return cases.map((c) => ({
    ...c,
    imageUrl: evidenceMap.get(c.id) || null,
  }));
}

export async function getMyReports(reporterId: string) {
  const cases = await db
    .select()
    .from(wasteCases)
    .where(eq(wasteCases.reporterId, reporterId))
    .orderBy(desc(wasteCases.createdAt));

  const allEvidence = await db
    .select({
      caseId: evidence.caseId,
      mediaUrl: evidence.mediaUrl,
      type: evidence.type,
    })
    .from(evidence);

  const evidenceMap = new Map<string, string>();
  for (const ev of allEvidence) {
    if (!evidenceMap.has(ev.caseId) || ev.type === "REPORT_PHOTO") {
      evidenceMap.set(ev.caseId, ev.mediaUrl);
    }
  }

  return cases.map((c) => ({
    ...c,
    imageUrl: evidenceMap.get(c.id) || null,
  }));
}

export async function getMyReportById(
  reportId: string,
  reporterId: string,
  isStaff: boolean = false,
) {
  const whereCondition = isStaff
    ? eq(wasteCases.id, reportId)
    : and(
        eq(wasteCases.id, reportId),
        eq(wasteCases.reporterId, reporterId),
      );

  const [wasteCase] = await db
    .select()
    .from(wasteCases)
    .where(whereCondition)
    .limit(1);

  if (!wasteCase) {
    return null;
  }

  const reportEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.caseId, wasteCase.id));

  const events = await db
    .select()
    .from(caseEvents)
    .where(eq(caseEvents.caseId, wasteCase.id))
    .orderBy(caseEvents.createdAt);

  return {
    wasteCase,
    evidence: reportEvidence,
    events,
  };
}