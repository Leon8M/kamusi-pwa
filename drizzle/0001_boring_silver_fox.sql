CREATE TABLE "token_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "token_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"timestamp" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tokens" integer DEFAULT 3;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;