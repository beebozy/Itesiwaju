CREATE TYPE "public"."evidence_type" AS ENUM('REPORT_PHOTO', 'BEFORE_PHOTO', 'AFTER_PHOTO', 'INSPECTION_PHOTO', 'ADDITIONAL_PHOTO', 'VIDEO');--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"uploaded_by" uuid,
	"type" "evidence_type" NOT NULL,
	"media_url" varchar(1000) NOT NULL,
	"description" text,
	"captured_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_case_id_waste_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."waste_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;