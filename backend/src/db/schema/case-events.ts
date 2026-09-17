import {
  pgEnum,
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { wasteCases } from "./waste-cases.js";

export const caseEventTypeEnum = pgEnum("case_event_type", [
  "REPORTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "DUPLICATE",
  "ASSIGNED",
  "ACCEPTED",
  "ARRIVED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "SLA_BREACHED",
  "ESCALATED",
]);

export const caseEvents = pgTable("case_events", {
  id: uuid("id").defaultRandom().primaryKey(),

  caseId: uuid("case_id")
    .notNull()
    .references(() => wasteCases.id),

  actorId: uuid("actor_id").references(() => users.id),

  eventType: caseEventTypeEnum("event_type").notNull(),

  description: text("description"),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});