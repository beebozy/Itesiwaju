import {
  pgEnum,
  pgTable,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { wasteCases } from "./waste-cases.js";

export const assignmentStatusEnum = pgEnum(
  "assignment_status",
  [
    "ASSIGNED",
    "ACCEPTED",
    "DECLINED",
    "CANCELLED",
    "COMPLETED",
  ],
);

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),

  caseId: uuid("case_id")
    .notNull()
    .references(() => wasteCases.id),

  collectorId: uuid("collector_id")
    .notNull()
    .references(() => users.id),

  assignedBy: uuid("assigned_by")
    .notNull()
    .references(() => users.id),

  status: assignmentStatusEnum("status")
    .notNull()
    .default("ASSIGNED"),

  assignedAt: timestamp("assigned_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  acceptedAt: timestamp("accepted_at", {
    withTimezone: true,
  }),

  declinedAt: timestamp("declined_at", {
    withTimezone: true,
  }),

  completedAt: timestamp("completed_at", {
    withTimezone: true,
  }),
});