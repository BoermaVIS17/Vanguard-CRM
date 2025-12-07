-- Migration: Add stripe_customer_id to users table
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" varchar(255);
