-- Migration for adding OTP and Payment timeouts to Database
-- Author: Antigravity AI
-- Date: 2026-03-29

-- 1. Add OTP columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- 2. Add waiting time column to order table for payment expiration
ALTER TABLE "order" 
ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMPTZ;

-- 3. Mark existing active users as verified
UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE status = 'active' AND otp_code IS NOT NULL;
