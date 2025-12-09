-- Add estimator_data JSONB column to report_requests table
-- Run this in Supabase SQL Editor

ALTER TABLE report_requests 
ADD COLUMN IF NOT EXISTS estimator_data JSONB;

-- Add index for faster queries on the JSON data
CREATE INDEX IF NOT EXISTS idx_report_requests_estimator_data 
ON report_requests USING GIN (estimator_data);

-- Add comment
COMMENT ON COLUMN report_requests.estimator_data IS 'Imported estimate data from NextDoor Exterior Solutions roofing estimator';

-- Example structure:
-- {
--   "totalRoofArea": 2500,
--   "adjustedArea": 2750,
--   "averagePitch": 6,
--   "goodPrice": 12375,
--   "betterPrice": 15125,
--   "bestPrice": 17875,
--   "hasPitchSurcharge": false,
--   "eaveLength": 200,
--   "ridgeValleyLength": 40,
--   "importedAt": "2025-01-15T10:30:00.000Z"
-- }
