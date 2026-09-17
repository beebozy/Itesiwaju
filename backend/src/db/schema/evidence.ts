import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { wasteCases } from "./waste-cases.js";

export const evidenceTypeEnum = pgEnum("evidence_type", [
  "REPORT_PHOTO",
  "BEFORE_PHOTO",
  "AFTER_PHOTO",
  "INSPECTION_PHOTO",
  "ADDITIONAL_PHOTO",
  "VIDEO",
]);

export const evidence = pgTable("evidence", {
  id: uuid("id").defaultRandom().primaryKey(),

  caseId: uuid("case_id")
    .notNull()
    .references(() => wasteCases.id),

  uploadedBy: uuid("uploaded_by").references(() => users.id),

  type: evidenceTypeEnum("type").notNull(),

  mediaUrl: varchar("media_url", {
    length: 1000,
  }).notNull(),

  description: text("description"),

  capturedAt: timestamp("captured_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});