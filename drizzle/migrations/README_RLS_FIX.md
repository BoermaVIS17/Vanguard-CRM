# RLS Permissions Fix for Sales Reps

## Problem
Sales Reps are getting stuck on a spinner when creating jobs because Row Level Security (RLS) policies are blocking their INSERT operations.

## Solution
The `fix_rls_permissions.sql` migration updates RLS policies to allow all authenticated users to create jobs while maintaining proper access control for viewing and editing.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `fix_rls_permissions.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Verify success by checking the output

### Option 2: Supabase CLI
```bash
# From project root
supabase db push --file drizzle/migrations/fix_rls_permissions.sql
```

### Option 3: psql Command Line
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f drizzle/migrations/fix_rls_permissions.sql
```

## What This Migration Does

### 1. Report Requests (Jobs) Table
- ✅ **INSERT**: All authenticated users can create jobs
- ✅ **SELECT**: Role-based viewing (Owners see all, Reps see their own)
- ✅ **UPDATE**: Role-based editing (Reps can edit their assigned jobs)
- ✅ **DELETE**: Only owners can delete jobs

### 2. Activities Table
- ✅ **INSERT**: All authenticated users can log activities
- ✅ **SELECT**: Users can view activities for jobs they have access to

### 3. Documents Table
- ✅ **INSERT**: All authenticated users can upload documents
- ✅ **SELECT**: Users can view documents for jobs they have access to
- ✅ **DELETE**: Users can delete their own documents, owners can delete any

### 4. Edit History Table
- ✅ **INSERT**: All authenticated users can create edit history
- ✅ **SELECT**: Users can view edit history for jobs they have access to

## Access Control Matrix

| Action | Owner | Admin | Office | Sales Rep | Team Lead |
|--------|-------|-------|--------|-----------|-----------|
| Create Job | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Jobs | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Jobs | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Team Jobs | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit All Jobs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Own Jobs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete Jobs | ✅ | ❌ | ❌ | ❌ | ❌ |

## Verification

After running the migration, verify the policies are active:

```sql
-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('report_requests', 'activities', 'documents', 'edit_history')
ORDER BY tablename, policyname;
```

Expected output should show:
- `report_requests_insert_policy` - FOR INSERT
- `report_requests_select_policy` - FOR SELECT
- `report_requests_update_policy` - FOR UPDATE
- `report_requests_delete_policy` - FOR DELETE
- Similar policies for other tables

## Testing

### Test as Sales Rep:
1. Log in as a Sales Rep user
2. Navigate to CRM → Leads
3. Click "New Job"
4. Fill out the form
5. Click "Create Job"
6. ✅ Should create successfully (no spinner hang)
7. ✅ Job should appear in the Prospect pipeline

### Test as Team Lead:
1. Log in as a Team Lead user
2. Create a job
3. ✅ Should work without issues
4. ✅ Should see own jobs and team members' jobs

## Rollback (If Needed)

If you need to revert these changes:

```sql
-- Drop all policies
DROP POLICY IF EXISTS "report_requests_insert_policy" ON report_requests;
DROP POLICY IF EXISTS "report_requests_select_policy" ON report_requests;
DROP POLICY IF EXISTS "report_requests_update_policy" ON report_requests;
DROP POLICY IF EXISTS "report_requests_delete_policy" ON report_requests;

-- Disable RLS (NOT RECOMMENDED for production)
ALTER TABLE report_requests DISABLE ROW LEVEL SECURITY;
```

## Notes

- This migration is **idempotent** - you can run it multiple times safely
- Existing data is not affected
- Only policy definitions are changed
- No downtime required
- Changes take effect immediately

## Related Files

- **Migration**: `drizzle/migrations/fix_rls_permissions.sql`
- **Router**: `server/routers.ts` (createJob uses `protectedProcedure`)
- **Schema**: `drizzle/schema.ts` (table definitions)

## Support

If you encounter issues:
1. Check Supabase logs for RLS policy violations
2. Verify user roles in the `users` table
3. Ensure `open_id` matches Supabase auth UID
4. Check that RLS is enabled on tables
