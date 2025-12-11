# Vanguard Systems (VIS) - Supabase Setup Guide

## Overview
This guide will help you set up a fresh Supabase instance for the Vanguard Systems CRM.

## Prerequisites
- A Supabase account (https://supabase.com)
- A new Supabase project created

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose your organization
4. Set project details:
   - **Name**: `vanguard-crm` (or your preference)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to finish setting up (~2 minutes)

## Step 2: Run Database Migration

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase_migration.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for completion - you should see "Success. No rows returned"

## Step 3: Set Up Storage Buckets

### Create Proposal Bucket
1. Go to **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Name: `Proposal_Bucket`
4. Make it **Public** (check the box)
5. Click "Create bucket"

### Upload Vanguard Logo
1. Click on the `Proposal_Bucket`
2. Click "Upload file"
3. Upload your Vanguard Systems shield logo
4. Name it: `vanguard-logo.png`
5. Copy the public URL and update it in `client/src/lib/constants.ts`

### Upload Product Images (Optional)
If you have Tamko Titan XT shingle images, upload them with these names:
- `BlackWalnut.jpg`
- `GlacierWhite.jpg`
- `OldeEnglishPewter.jpg`
- `OxfordGrey.jpg`
- `RusticBlack.jpg`
- `ShadowGrey.jpg`
- `ThunderstormGrey.jpg`
- `VirginiaSlate.jpg`
- `TitanXT_logo.jpg`
- `TitanXT_Aerial.jpg`
- `tamko-complete-optimized.jpg`

## Step 4: Configure Environment Variables

Update your `.env` file with Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Find these in: Supabase Dashboard → Settings → API
```

### Where to find these values:
1. Go to **Settings** → **API** in your Supabase dashboard
2. **Project URL**: Copy the URL
3. **anon public**: Copy this key (safe for client-side)
4. **service_role**: Copy this key (keep secret, server-side only)

## Step 5: Set Up Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Customize with Vanguard Systems branding
   - Update colors to match (#00D4FF cyan, #001F3F navy)

### Create First Admin User
1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter email and password
4. After creation, go to **SQL Editor** and run:

```sql
-- Make user an owner
UPDATE users 
SET role = 'owner', name = 'Your Name'
WHERE email = 'your-email@example.com';
```

## Step 6: Configure Row Level Security (RLS)

RLS policies are already included in the migration script. Verify they're active:

```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

## Step 7: Test Database Connection

Run this query to verify everything is set up:

```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should return:
-- activities
-- company_settings
-- documents
-- edit_history
-- job_attachments
-- job_message_reads
-- notifications
-- products
-- report_requests
-- users

-- Verify company settings
SELECT * FROM company_settings;
-- Should show: Vanguard Systems as company_name
```

## Step 8: Update Application Configuration

1. Update `client/src/lib/constants.ts` with your Supabase URL:
   ```typescript
   export const BRAND_LOGO_URL = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/Proposal_Bucket/vanguard-logo.png';
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

## Verification Checklist

- [ ] Supabase project created
- [ ] Database migration completed successfully
- [ ] All 10 tables created
- [ ] RLS policies enabled
- [ ] Storage bucket created (Proposal_Bucket)
- [ ] Vanguard logo uploaded
- [ ] Environment variables configured
- [ ] First admin user created
- [ ] Application connects to database

## Database Schema Overview

### Core Tables
- **users**: Team members and authentication
- **report_requests**: Jobs/leads (main entity)
- **activities**: Activity timeline for jobs
- **documents**: File attachments and photos
- **products**: Roofing product catalog
- **company_settings**: Company-wide configuration

### Supporting Tables
- **edit_history**: Audit trail of changes
- **job_attachments**: Message attachments
- **job_message_reads**: Read receipts
- **notifications**: User notifications

## Troubleshooting

### Migration Fails
- Check for syntax errors in SQL
- Ensure you're running the entire file
- Try running sections individually if needed

### RLS Blocks Access
- Verify user is authenticated
- Check user role in `users` table
- Review RLS policies in SQL Editor

### Storage Upload Fails
- Ensure bucket is public
- Check file size limits
- Verify file name matches exactly

## Next Steps

1. **Customize Company Settings**: Update in Settings → Company Settings
2. **Add Team Members**: Create users in Authentication → Users
3. **Configure Integrations**: Set up Stripe, Twilio, etc.
4. **Import Existing Data**: Use CSV import feature for leads

## Support

For issues specific to:
- **Supabase**: https://supabase.com/docs
- **Vanguard CRM**: Check repository documentation

---

**Vanguard Systems (VIS)** - Security & Innovation
