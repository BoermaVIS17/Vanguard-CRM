-- Add manual_area_sqft column to report_requests table
-- This allows users to manually override the calculated roof area

ALTER TABLE report_requests 
ADD COLUMN IF NOT EXISTS manual_area_sqft INTEGER;

COMMENT ON COLUMN report_requests.manual_area_sqft IS 'Manual roof area override in square feet - takes precedence over calculated area';
