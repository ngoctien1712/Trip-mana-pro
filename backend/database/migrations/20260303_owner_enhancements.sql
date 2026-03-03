-- Migration: Owner Enhancements
-- Date: 2026-03-03

-- Update Provider table
ALTER TABLE provider ADD COLUMN IF NOT EXISTS fanpage TEXT;
ALTER TABLE provider ADD COLUMN IF NOT EXISTS service_type VARCHAR(50); -- 'tour', 'accommodation', 'vehicle'

-- Update Vehicle table
ALTER TABLE vehicle ADD COLUMN IF NOT EXISTS departure_date DATE;
ALTER TABLE vehicle ADD COLUMN IF NOT EXISTS arrival_date DATE;

-- Update vehicle_trips if needed (it already has TIMESTAMPTZ departure_time, but the user wants these on the vehicle template too)
-- Actually, the user's requirement is "Khi cấu hình thêm một phương tiện cần có thêm ngày khởi hành và ngày đến." 
-- So these should be on the vehicle table which acts as the service template.
