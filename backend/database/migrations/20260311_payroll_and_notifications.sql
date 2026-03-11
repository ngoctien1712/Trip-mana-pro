-- Migration: Payroll and Notifications System
-- Date: 2026-03-11

-- 1. Update Provider table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='provider' AND column_name='commission_rate') THEN
        ALTER TABLE provider ADD COLUMN commission_rate DECIMAL(5, 2) DEFAULT 0.15;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='provider' AND column_name='agreed_terms') THEN
        ALTER TABLE provider ADD COLUMN agreed_terms BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='provider' AND column_name='agreed_at') THEN
        ALTER TABLE provider ADD COLUMN agreed_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Update Order table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='id_provider') THEN
        ALTER TABLE "order" ADD COLUMN id_provider UUID REFERENCES provider(id_provider);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='commission_amount') THEN
        ALTER TABLE "order" ADD COLUMN commission_amount DECIMAL(15, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='owner_amount') THEN
        ALTER TABLE "order" ADD COLUMN owner_amount DECIMAL(15, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='payroll_status') THEN
        ALTER TABLE "order" ADD COLUMN payroll_status VARCHAR(20) DEFAULT 'pending'; -- pending, processing, completed
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order' AND column_name='id_payroll') THEN
        ALTER TABLE "order" ADD COLUMN id_payroll UUID; -- Will be defined later in script
    END IF;
END $$;

-- 3. Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id_notification UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, payment, success, warning
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(id_user);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 4. Create Payroll Transactions table
CREATE TABLE IF NOT EXISTS payroll_transactions (
  id_payroll UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_provider UUID NOT NULL REFERENCES provider(id_provider),
  amount DECIMAL(15, 2) NOT NULL,
  commission_total DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed
  bank_info JSONB, -- snapshots of bank details at time of payment
  transaction_proof TEXT, -- image/document URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key back to order
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_order_payroll') THEN
        ALTER TABLE "order" ADD CONSTRAINT fk_order_payroll FOREIGN KEY (id_payroll) REFERENCES payroll_transactions(id_payroll);
    END IF;
END $$;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_provider ON "order"(id_provider);
CREATE INDEX IF NOT EXISTS idx_order_payroll_status ON "order"(payroll_status);
CREATE INDEX IF NOT EXISTS idx_order_id_payroll ON "order"(id_payroll);
