-- Migration to add bank details and fix vehicle timing visibility
ALTER TABLE provider 
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);

-- No schema changes needed for vehicle timing, just code changes in controller.
