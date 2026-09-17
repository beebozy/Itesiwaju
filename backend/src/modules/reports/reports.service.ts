import { db } from "../../db/client.js";
import {
  wasteCases,
  caseEvents,
    evidence,
} from "../../db/schema/index.js";

export interface CreateReportInput {
  reporterId: string;

  description?: string;

  latitude?: string;
  longitude?: string;
  locationAccuracy?: string;

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
}