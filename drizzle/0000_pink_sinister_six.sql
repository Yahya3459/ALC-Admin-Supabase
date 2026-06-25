CREATE TYPE "public"."admin_role" AS ENUM('superadmin', 'admin', 'teacher');--> statement-breakpoint
CREATE TYPE "public"."certificate_status" AS ENUM('pending', 'processing', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'contacted', 'enrolled', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(64) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"isSuperAdmin" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "certificate_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "certificate_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"courseName" varchar(255) NOT NULL,
	"fullNameAr" varchar(255) NOT NULL,
	"fullNameEn" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"birthPlace" varchar(255) NOT NULL,
	"birthDate" varchar(50) NOT NULL,
	"gender" "gender" NOT NULL,
	"idCardUrl" varchar(500),
	"grades" json,
	"finalGrade" varchar(50),
	"average" varchar(50),
	"total" varchar(50),
	"status" "certificate_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"offerIndex" integer NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(320),
	"notes" text,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
