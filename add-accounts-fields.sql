-- Add company number, VAT number, and accounts contact fields to contacts table
-- Run this on your DigitalOcean database

ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS company_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS accounts_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS accounts_contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS accounts_contact_phone VARCHAR(50);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contacts' 
AND column_name IN ('company_number', 'vat_number', 'accounts_contact_name', 'accounts_contact_email', 'accounts_contact_phone');
