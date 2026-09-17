CREATE TYPE "public"."case_source" AS ENUM('MOBILE', 'WHATSAPP', 'USSD', 'AUTHORITY', 'INSPECTION');--> statement-breakpoint
CREATE TYPE "public"."case_status" AS ENUM('REPORTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'DUPLICATE', 'REOPENED');--> statement-breakpoint
CREATE TYPE "public"."privacy_level" AS ENUM('IDENTIFIED', 'PRIVATE');--> statement-breakpoint
CREATE TABLE "waste_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" varchar(30) NOT NULL,
	"reporter_id" uuid,
	"source" "case_source" NOT NULL,
	"status" "case_status" DEFAULT 'REPORTED' NOT NULL,
	"description" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"location_accuracy" numeric(8, 2),
	"address" varchar(255),
	"ward" varchar(100),
	"lga" varchar(100),
	"official_incident_type" varchar(100),
	"official_severity" varchar(30),
	"privacy_level" "privacy_level" DEFAULT 'PRIVATE' NOT NULL,
	"reported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waste_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
ALTER TABLE "waste_cases" ADD CONSTRAINT "waste_cases_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waste_cases" ADD CONSTRAINT "waste_cases_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;