import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const caseSourceEnum = pgEnum("case_source", [
  "MOBILE",
  "WHATSAPP",
  "USSD",
  "AUTHORITY",
  "INSPECTION",
]);

export const caseStatusEnum = pgEnum("case_status", [
  "REPORTED",
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
]);

export const privacyLevelEnum = pgEnum("privacy_level", [
  "IDENTIFIED",
  "PRIVATE",
]);

export const wasteCases = pgTable("waste_cases", {
  id: uuid("id").defaultRandom().primaryKey(),

  caseNumber: varchar("case_number", {
    length: 30,
  })
    .notNull()
    .unique(),

  reporterId: uuid("reporter_id").references(() => users.id),

  source: caseSourceEnum("source").notNull(),

  status: caseStatusEnum("status")
    .notNull()
    .default("REPORTED"),

  description: text("description"),

  latitude: numeric("latitude", {
    precision: 9,
    scale: 6,
  }),

  longitude: numeric("longitude", {
    precision: 9,
    scale: 6,
  }),

  locationAccuracy: numeric("location_accuracy", {
    precision: 8,
    scale: 2,
  }),

  address: varchar("address", {
    length: 255,
  }),
  street: varchar("street", { length: 255 }),

  ward: varchar("ward", {
    length: 100,
  }),

  lga: varchar("lga", {
    length: 100,
  }),

  officialIncidentType: varchar("official_incident_type", {
    length: 100,
  }),

  officialSeverity: varchar("official_severity", {
    length: 30,
  }),

  privacyLevel: privacyLevelEnum("privacy_level")
    .notNull()
    .default("PRIVATE"),

  reportedAt: timestamp("reported_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  verifiedAt: timestamp("verified_at", {
    withTimezone: true,
  }),

  verifiedBy: uuid("verified_by").references(() => users.id),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});