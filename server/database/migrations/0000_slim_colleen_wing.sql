CREATE TABLE IF NOT EXISTS "t_user_oauth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"sub" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	CONSTRAINT "t_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_roles" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "t_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" varchar(8) NOT NULL,
	CONSTRAINT "t_user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"time_slot_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_courts" (
	"id" varchar(8) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_coach_lesson_coaches" (
	"coach_lesson_id" uuid NOT NULL,
	"coach_id" uuid NOT NULL,
	CONSTRAINT "t_coach_lesson_coaches_coach_lesson_id_coach_id_pk" PRIMARY KEY("coach_lesson_id","coach_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_coach_lesson_students" (
	"coach_lesson_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "t_coach_lesson_students_coach_lesson_id_student_id_pk" PRIMARY KEY("coach_lesson_id","student_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_coach_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time_slot_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"capacity" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	CONSTRAINT "t_coach_lessons_time_slot_id_unique" UNIQUE("time_slot_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t_time_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"court_id" varchar(8) NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	CONSTRAINT "type_check" CHECK ("t_time_slots"."type" IN ('lesson', 'normal'))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_user_oauth" ADD CONSTRAINT "t_user_oauth_user_id_t_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_user_roles" ADD CONSTRAINT "t_user_roles_user_id_t_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_user_roles" ADD CONSTRAINT "t_user_roles_role_id_t_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."t_roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_bookings" ADD CONSTRAINT "t_bookings_user_id_t_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_bookings" ADD CONSTRAINT "t_bookings_time_slot_id_t_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."t_time_slots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_coach_lesson_coaches" ADD CONSTRAINT "t_coach_lesson_coaches_coach_lesson_id_t_coach_lessons_id_fk" FOREIGN KEY ("coach_lesson_id") REFERENCES "public"."t_coach_lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_coach_lesson_coaches" ADD CONSTRAINT "t_coach_lesson_coaches_coach_id_t_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."t_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_coach_lesson_students" ADD CONSTRAINT "t_coach_lesson_students_coach_lesson_id_t_coach_lessons_id_fk" FOREIGN KEY ("coach_lesson_id") REFERENCES "public"."t_coach_lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_coach_lesson_students" ADD CONSTRAINT "t_coach_lesson_students_student_id_t_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."t_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_coach_lessons" ADD CONSTRAINT "t_coach_lessons_time_slot_id_t_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."t_time_slots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t_time_slots" ADD CONSTRAINT "t_time_slots_court_id_t_courts_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."t_courts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "nameIdx" ON "t_courts" USING btree ("name");