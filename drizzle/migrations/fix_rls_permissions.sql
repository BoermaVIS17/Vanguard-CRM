-- Fix Row Level Security (RLS) Policies for Sales Reps
-- This allows all authenticated users (including Sales Reps) to create jobs
-- Run this in your Supabase SQL Editor

-- ============================================
-- REPORT_REQUESTS TABLE (Jobs/Leads)
-- ============================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "report_requests_insert_policy" ON report_requests;
DROP POLICY IF EXISTS "report_requests_select_policy" ON report_requests;
DROP POLICY IF EXISTS "report_requests_update_policy" ON report_requests;
DROP POLICY IF EXISTS "report_requests_delete_policy" ON report_requests;

-- Enable RLS on report_requests table
ALTER TABLE report_requests ENABLE ROW LEVEL SECURITY;

-- INSERT Policy: Allow all authenticated users to create jobs
CREATE POLICY "report_requests_insert_policy" 
ON report_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- SELECT Policy: Users can view jobs based on their role
CREATE POLICY "report_requests_select_policy" 
ON report_requests 
FOR SELECT 
TO authenticated 
USING (
  -- Get user role from users table
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.open_id = auth.uid()
    AND (
      -- Owners and Admins see everything
      users.role IN ('owner', 'admin', 'office')
      -- Sales Reps see their assigned jobs
      OR (users.role = 'sales_rep' AND report_requests.assigned_to = users.id)
      -- Team Leads see their team's jobs
      OR (users.role = 'team_lead' AND (
        report_requests.assigned_to = users.id 
        OR report_requests.team_lead_id = users.id
        OR EXISTS (
          SELECT 1 FROM users team_members 
          WHERE team_members.team_lead_id = users.id 
          AND report_requests.assigned_to = team_members.id
        )
      ))
    )
  )
);

-- UPDATE Policy: Users can update jobs based on their role
CREATE POLICY "report_requests_update_policy" 
ON report_requests 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.open_id = auth.uid()
    AND (
      -- Owners and Admins can update everything
      users.role IN ('owner', 'admin', 'office')
      -- Sales Reps can update their assigned jobs
      OR (users.role = 'sales_rep' AND report_requests.assigned_to = users.id)
      -- Team Leads can update their team's jobs
      OR (users.role = 'team_lead' AND (
        report_requests.assigned_to = users.id 
        OR report_requests.team_lead_id = users.id
        OR EXISTS (
          SELECT 1 FROM users team_members 
          WHERE team_members.team_lead_id = users.id 
          AND report_requests.assigned_to = team_members.id
        )
      ))
    )
  )
);

-- DELETE Policy: Only owners can delete jobs
CREATE POLICY "report_requests_delete_policy" 
ON report_requests 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.open_id = auth.uid()
    AND users.role = 'owner'
  )
);

-- ============================================
-- ACTIVITIES TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "activities_insert_policy" ON activities;
DROP POLICY IF EXISTS "activities_select_policy" ON activities;

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert activities
CREATE POLICY "activities_insert_policy" 
ON activities 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to view activities for jobs they can access
CREATE POLICY "activities_select_policy" 
ON activities 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM report_requests 
    WHERE report_requests.id = activities.report_request_id
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.open_id = auth.uid()
      AND (
        users.role IN ('owner', 'admin', 'office')
        OR (users.role = 'sales_rep' AND report_requests.assigned_to = users.id)
        OR (users.role = 'team_lead' AND (
          report_requests.assigned_to = users.id 
          OR report_requests.team_lead_id = users.id
        ))
      )
    )
  )
);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "documents_insert_policy" ON documents;
DROP POLICY IF EXISTS "documents_select_policy" ON documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON documents;

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to upload documents
CREATE POLICY "documents_insert_policy" 
ON documents 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to view documents for jobs they can access
CREATE POLICY "documents_select_policy" 
ON documents 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM report_requests 
    WHERE report_requests.id = documents.report_request_id
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.open_id = auth.uid()
      AND (
        users.role IN ('owner', 'admin', 'office')
        OR (users.role = 'sales_rep' AND report_requests.assigned_to = users.id)
        OR (users.role = 'team_lead' AND (
          report_requests.assigned_to = users.id 
          OR report_requests.team_lead_id = users.id
        ))
      )
    )
  )
);

-- Allow users to delete their own documents or owners to delete any
CREATE POLICY "documents_delete_policy" 
ON documents 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.open_id = auth.uid()
    AND (
      users.role = 'owner'
      OR documents.uploaded_by = users.id
    )
  )
);

-- ============================================
-- EDIT_HISTORY TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "edit_history_insert_policy" ON edit_history;
DROP POLICY IF EXISTS "edit_history_select_policy" ON edit_history;

-- Enable RLS
ALTER TABLE edit_history ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert edit history
CREATE POLICY "edit_history_insert_policy" 
ON edit_history 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to view edit history for jobs they can access
CREATE POLICY "edit_history_select_policy" 
ON edit_history 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM report_requests 
    WHERE report_requests.id = edit_history.report_request_id
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.open_id = auth.uid()
      AND (
        users.role IN ('owner', 'admin', 'office')
        OR (users.role = 'sales_rep' AND report_requests.assigned_to = users.id)
        OR (users.role = 'team_lead' AND (
          report_requests.assigned_to = users.id 
          OR report_requests.team_lead_id = users.id
        ))
      )
    )
  )
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('report_requests', 'activities', 'documents', 'edit_history')
ORDER BY tablename, policyname;
