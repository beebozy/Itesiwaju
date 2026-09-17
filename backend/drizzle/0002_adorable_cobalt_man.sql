CREATE TYPE "public"."case_event_type" AS ENUM('REPORTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'DUPLICATE', 'ASSIGNED', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'SLA_BREACHED', 'ESCALATED');--> statement-breakpoint
CREATE TABLE "case_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"actor_id" uuid,
	"event_type" "case_event_type" NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_case_id_waste_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."waste_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;