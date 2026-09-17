CREATE TYPE "public"."language" AS ENUM('en', 'yo', 'pcm', 'fr');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CITIZEN', 'PSP_OPERATOR', 'AGENCY_OPERATOR', 'COLLECTOR', 'ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(255),
	"full_name" varchar(150) NOT NULL,
	"role" "user_role" DEFAULT 'CITIZEN' NOT NULL,
	"preferred_language" "language" DEFAULT 'en' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
