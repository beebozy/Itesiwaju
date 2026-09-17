import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "CITIZEN",
  "PSP_OPERATOR",
  "AGENCY_OPERATOR",
  "COLLECTOR",
  "ADMIN",
]);

export const languageEnum = pgEnum("language", [
  "en",
  "yo",
  "pcm",
  "fr",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  phone: varchar("phone", { length: 30 }).notNull().unique(),

  email: varchar("email", { length: 255 }).unique(),

  fullName: varchar("full_name", { length: 150 }).notNull(),

  passwordHash: varchar("password_hash", { length: 255 }),

  role: userRoleEnum("role").notNull().default("CITIZEN"),

  preferredLanguage: languageEnum("preferred_language")
    .notNull()
    .default("en"),

  isActive: boolean("is_active").notNull().default(true),

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