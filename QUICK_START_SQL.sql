-- ============================================
-- VANGUARD SYSTEMS (VIS) - QUICK START
-- Essential SQL Commands for New Supabase Instance
-- ============================================

-- 1. VERIFY TABLES EXIST
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. CHECK COMPANY SETTINGS
SELECT * FROM company_settings;

-- 3. CREATE YOUR FIRST ADMIN USER (after user signs up via auth)
-- Replace 'your-email@example.com' with actual email
UPDATE users 
SET role = 'owner', 
    name = 'Admin Name'
WHERE email = 'your-email@example.com';

-- 4. VERIFY RLS POLICIES ARE ACTIVE
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 5. UPDATE COMPANY INFORMATION
UPDATE company_settings 
SET 
  company_name = 'Vanguard Systems',
  company_email = 'info@vanguardsystems.com',
  company_phone = '(555) 123-4567',
  address = '123 Main Street',
  city = 'Your City',
  state = 'FL',
  zip_code = '12345',
  contractor_license_number = 'CCC1234567',
  logo_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/Proposal_Bucket/vanguard-logo.png'
WHERE id = 1;

-- 6. VIEW ALL USERS AND THEIR ROLES
SELECT id, name, email, role, rep_code, created_at 
FROM users 
ORDER BY created_at DESC;

-- 7. CHECK PRODUCTS CATALOG
SELECT category, manufacturer, product_name, color, is_active 
FROM products 
WHERE is_active = true 
ORDER BY category, product_name;

-- 8. VIEW RECENT JOBS/LEADS
SELECT id, full_name, email, phone, status, deal_type, created_at 
FROM report_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- USEFUL MAINTENANCE QUERIES
-- ============================================

-- Reset a user's password (they'll need to reset via email)
-- Run this, then user clicks "Forgot Password" in app
UPDATE auth.users 
SET encrypted_password = NULL 
WHERE email = 'user@example.com';

-- Assign a job to a sales rep
UPDATE report_requests 
SET assigned_to = (SELECT id FROM users WHERE email = 'salesrep@example.com')
WHERE id = 123;

-- View activity timeline for a specific job
SELECT a.*, u.name as user_name
FROM activities a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.report_request_id = 123
ORDER BY a.created_at DESC;

-- Count jobs by status
SELECT status, COUNT(*) as count
FROM report_requests
GROUP BY status
ORDER BY count DESC;

-- Find jobs without assigned sales rep
SELECT id, full_name, email, status, created_at
FROM report_requests
WHERE assigned_to IS NULL
ORDER BY created_at DESC;

-- ============================================
-- STORAGE BUCKET VERIFICATION
-- ============================================

-- After creating Proposal_Bucket in Supabase Storage UI,
-- verify it's accessible by uploading the Vanguard logo:
-- URL format: https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/Proposal_Bucket/vanguard-logo.png

-- ============================================
-- VANGUARD SYSTEMS (VIS) - Ready to Go!
-- ============================================
