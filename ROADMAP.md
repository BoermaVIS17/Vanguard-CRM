# Project TODO

- [x] Basic landing page with hero, features, pricing, form
- [x] Dark theme with cyan accents (Precision & Trust design)
- [x] Responsive navigation
- [x] FAQ section
- [x] Trust indicators (license, FAA compliant)
- [x] Upgrade to web-db-user for backend capabilities
- [x] Database schema for report requests
- [x] Stripe payment integration ($199 report)
- [x] Promo code "neighbor25" logic to waive fee
- [x] Email notification to owner on form submission
- [x] Update frontend form to handle payment flow
- [x] Test payment flow (promo code validation tests passing)
- [x] Integrate Twilio SMS notifications for new report requests (code ready, awaiting credentials)
- [x] Add roof concerns/notes text area to form
- [x] Add optional hands-on inspection checkbox to form
- [x] Update database schema for new fields
- [x] Update backend to handle new fields
- [x] Remove promo code hint from form
- [x] Add proper backlink to Nextdoorextroofing.com in footer
- [x] Make checkboxes more visible against dark background
- [x] Create Thank You page after form submission
- [x] Redirect to Thank You page after successful submission
- [x] Add route for Thank You page in App.tsx
- [x] Update FAQ: remove promo code mention, add home requirement, update scheduling info, add drone opt-in policy
- [x] Add multiple promo codes for different sales reps
- [x] Include sales rep attribution in email notifications
- [x] Update promo code validation to support rep-specific codes
- [x] Update promo code system to accept any code ending in S26 (e.g., MJS26, STS26)

## CRM Development (Phase 1)
- [x] Update database schema for CRM (users, roles, leads, jobs, activities)
- [x] Create user roles system (Owner, Office Staff, Sales Rep, Project Manager)
- [x] Build CRM login page
- [x] Create protected CRM routes
- [x] Build CRM dashboard with lead overview
- [x] Create leads management table with filtering/sorting
- [x] Build job pipeline kanban board
- [x] Create customer profile pages (via lead detail modal)
- [x] Add activity log functionality
- [x] Build team/user management (Owner only)

## CRM Development (Phase 2)
- [x] Document upload functionality for leads (photos, PDFs, storm reports)
- [x] File storage integration with S3
- [x] Document viewer/preview in lead detail
- [x] Scheduling calendar page with appointment management
- [x] Appointment creation with rep assignment
- [x] Calendar view (month view with day appointments)
- [x] Reports export page with filters
- [x] CSV export for lead lists
- [x] PDF report generation

## CRM Redesign (AccuLynx-Style)
- [x] Research AccuLynx UI patterns (navigation, dashboard, dropdowns)
- [x] Implement AccuLynx-style top navigation with dropdown menus
- [x] Redesign dashboard with widget cards and quick actions
- [x] Create CRMLayout component with consistent header/navigation
- [x] Update leads/jobs view with light theme and table style
- [x] Add quick-add buttons (New Job) and action menus
- [x] Update Pipeline page with kanban board
- [x] Update Calendar page with scheduling
- [x] Update Reports page with export functionality
- [x] Update Team page with member management
- [x] Add status badges and color coding

## CRM Color Scheme Update
- [x] Replace black backgrounds (#0a0a0a, #111, black) with dark blue (slate-800/slate-900)
- [x] Change gray text to white for better readability
- [x] Update CRMLayout component colors
- [x] Update Dashboard page colors
- [x] Update Leads, Pipeline, Calendar, Reports, Team page colors

## Dashboard Analytics & Job Detail Page Enhancement
- [x] Add backend endpoints for dashboard analytics (conversion trends, monthly stats)
- [x] Add backend endpoints for comprehensive job detail data
- [x] Enhance Dashboard with analytical charts (Canvas-based)
- [x] Add category tabs to Dashboard (Prospect, Completed, Invoiced, etc.)
- [x] Create dedicated Job Detail page route
- [x] Implement Overview tab with job summary
- [x] Implement Documents tab with upload/download and search
- [x] Implement Photos tab with gallery view and search
- [x] Implement Notes/Messages tab with user communication and search
- [x] Implement Timeline tab with chronological activity history
- [x] Add search functionality across all tabs
- [x] Style job detail page with dark blue theme

## Role-Based Access Control & Edit History
- [x] Add user roles enum to schema (owner, admin, team_lead, sales_rep)
- [x] Create edit_history table to track all changes
- [x] Add teamLeadId field to users for team assignment
- [x] Create role-based access control middleware
- [x] Implement permission helpers (canView, canEdit, canDelete)
- [x] Update CRM router with role-based filtering
- [x] Add edit history logging on all mutations
- [x] Make customer info editable in Job Detail page
- [x] Add edit history view for Owners/Admins
- [x] Update Leads page with role-based job filtering
- [x] Sales Rep: view/edit only assigned jobs
- [x] Team Lead: view assigned jobs + team members' jobs
- [x] Admin: view/edit all, no delete
- [x] Owner: full access including delete and history view

## Team Management Updates
- [x] Remove role hierarchy & permissions display from Team page
- [x] Change "Invite Member" to "Create Account" button
- [x] Add account creation form (name, email, role, team lead assignment)
- [x] Add backend endpoint for owner to create team member accounts
- [x] Show credentials after account creation for owner to share
- [x] Clean up database - removed test admin accounts

## Email Notification for New Team Accounts
- [x] Set up email service using built-in notification API
- [x] Create welcome email template with login instructions
- [x] Update createTeamAccount endpoint to send welcome email
- [x] Include Manus login URL and role information in email
- [x] Test email delivery

## Pipeline Redesign with Lien Rights Tracking
- [x] Update database schema with new pipeline stages
- [x] Add deal type field (insurance, cash, financed)
- [x] Add completedAt date field for lien rights tracking
- [x] Add lienRightsStatus field (active, warning, critical, expired, legal)
- [x] Create new pipeline stages: Lead, Appointment Set, Prospect, Approved, Project Scheduled, Completed, Invoiced, Lien Legal, Closed Deal
- [x] Update backend with lien rights calculation (90-day window)
- [x] Redesign Pipeline page with new kanban columns
- [x] Add deal type subsections under Approved stage
- [x] Add lien rights countdown timer with urgency indicators
- [x] Add weekly urgency updates for lien rights
- [x] Update Dashboard with new pipeline stages
- [x] Update Leads page with new status options

## Lien Rights Email Notifications
- [x] Create lien rights notification service
- [x] Build email templates for warning (30 days) and critical (14 days) alerts
- [x] Add backend endpoint to check lien rights status and send alerts
- [x] Include job details, days remaining, and action links in emails
- [x] Send notifications to all admin and owner users
- [x] Add manual "Send Lien Rights Alert" button to Dashboard
- [x] Set up scheduled task for weekly lien rights checks (GitHub Actions workflow)
- [x] Test notification delivery

## Website Dead-End Review
- [x] Review landing page navigation and links
- [x] Review CRM Dashboard navigation and buttons
- [x] Review Leads page functionality
- [x] Review Pipeline page functionality
- [x] Review Calendar page functionality
- [x] Review Reports page functionality
- [x] Review Team page functionality
- [x] Review Job Detail page and all tabs
- [x] Fix footer links (Our Story, Full Services → toast, Contact Us → scroll to form)
- [x] Fix Reports page NaN% conversion rate issue
- [x] Add New Job creation form with dialog to Leads page
- [x] Add createJob backend endpoint for owners/admins

## Customer Portal
- [x] Create public endpoint for job lookup by phone number
- [x] Create endpoint for customer to send message to their job file
- [x] Create endpoint for customer to request a callback
- [x] Add customerStatusMessage field to schema for custom status display
- [x] Add editable Customer Status Message section in Job Detail page
- [x] Build customer portal page with phone number lookup form
- [x] Display only the custom status message to customers (not internal data)
- [x] Add message form to send inquiry to job file
- [x] Add "Request a Call" button with 48 business hours confirmation
- [x] Send notification to admins when customer sends message or requests call
- [x] Add route for customer portal in App.tsx (/portal)

## Role System & Portal Updates
- [x] Replace Admin role with Field Crew role (limited to viewing scope of work and uploading photos)
- [x] Fix portal status field to only update when Enter is pressed
- [x] Add customer messages display in Notes/Messages section of job detail

## Job Detail Enhancements
- [x] Add Team Lead assignment section (Owners can also be team leads)
- [x] Make job details section editable (status, deal type, priority, scheduled date, etc.)

## Edit History Management
- [x] Allow owners to delete edit history entries

## Document Management
- [x] Make uploaded documents viewable when clicked
- [x] Fix document preview blocked by Chrome (use new tab instead of iframe)

## Input Field Improvements
- [x] Fix all text inputs to only update on Enter key press, not on every keystroke

## Supabase Integration
- [x] Set up Supabase credentials as environment variables
- [x] Install Supabase JS client
- [x] Create Supabase storage helper functions
- [x] Update file upload/download to use Supabase Storage (crm-files bucket)
- [x] Add real-time subscriptions for live updates
- [x] Test all storage operations (90 tests passing)

## File Preview & Organization Improvements
- [x] Add in-browser preview for images and documents (PDF, video, audio, text files)
- [x] Create job detail modal/drawer for clicking jobs in the list view
- [x] Auto-create dedicated Supabase folder for each new job created (jobs/{id}/documents, jobs/{id}/photos)

## UI Fixes
- [x] Fix Team Lead dropdown showing duplicate owner entries
- [x] Change job row click to navigate directly to job page (remove modal)
- [x] Ensure all clickable job boxes link to their respective job pages
- [x] Make lead source, roof age, roof concerns, and hands-on inspection editable by admin/owners

## Field Upload Page
- [x] Create /upload page with ?id= parameter for job ID
- [x] Fetch customer name and address from job ID
- [x] Create large touch-friendly photo upload button (huge, glove-friendly)
- [x] Upload photos to Supabase storage under jobs/{id}/photos/
- [x] Show progress bar and success message with hammer animation
- [x] Add Copy Upload Link button on Photos tab for owners to share with field crew

## Photos Gallery Redesign
- [x] Create sleek gallery layout with larger thumbnails and hover effects
- [x] Add lightbox viewer for full-screen photo viewing
- [x] Add navigation arrows to browse photos in lightbox
- [x] Show photo count and metadata in gallery view

## Photo Metadata Extraction
- [x] Install EXIF parsing library (exif-parser)
- [x] Add metadata fields to documents schema (photoTakenAt, latitude, longitude, cameraModel)
- [x] Extract EXIF data on photo upload (timestamp, GPS coordinates, camera model)
- [x] Display photo timestamp and location in gallery view with Google Maps link

## CRM Login Conversion
- [x] Create username/password authentication system (Supabase Auth)
- [x] Update home route to redirect to CRM login
- [x] Remove landing page, make CRM the main app
- [x] Test login flow and push to GitHub

## Supabase Auth Implementation
- [x] Create Supabase Auth login component with signInWithPassword
- [x] Implement forgot password flow with email reset
- [x] Create password reset page for reset link handling
- [x] Protect dashboard routes for logged-in users only
- [x] Update App.tsx routing to make login the default page
- [x] Remove landing page, make CRM the main application
- [x] Write tests for authentication functionality (106 tests passing)
- [x] Push changes to GitHub main branch

## Supabase Auth User Sync Fix
- [x] Sync Supabase Auth users to CRM users table on login
- [x] Auto-create CRM user record when Supabase user logs in
- [x] Assign owner role to first user or specified email
- [x] Show Create Account button for owners on Team page
- [x] Fix Team page router calls (use users router instead of crm)

## Login Error Improvements
- [x] Fix Supabase availability check showing false errors
- [x] Show specific error messages (no account, wrong password)
- [x] Verify forgot password resets Supabase user password (uses Supabase auth.resetPasswordForEmail)

## First User Owner Logic
- [x] Make first user to log in automatically become owner
- [x] Subsequent users get sales_rep role by default (implemented in syncSupabaseUser)

## Performance Optimizations
- [x] Add database indexes for email, openId, status, assignedTo fields (SQL file created)
- [x] Optimize React Query caching (staleTime, gcTime, retry settings)
- [x] Update dashboard to load data in parallel with stable date references

## Database Schema Fix
- [x] Refactor drizzle/schema.ts from MySQL to PostgreSQL (Supabase)
- [x] Update db.ts to use PostgreSQL driver
- [x] Generate CREATE TABLE SQL for all tables

## Bug Fixes
- [x] Fix sign out button not working (redirect to /login instead of /crm/login)
- [x] Fix sign out button - added Supabase signOut and error handling

## Dashboard Header Fixes
- [x] Fix sign out: await supabase.auth.signOut(), clear React Query cache, force redirect
- [x] Fix name display: query users table by open_id, show name/role, fallback to email

## Database Connection Fix
- [x] Fix database query errors - added retry logic and better connection pooling (dev server uses TiDB/MySQL, production uses Supabase/PostgreSQL)

## Critical UI Bug Fixes
- [x] Fix Sign Out 404 - redirect to / instead of /login
- [x] Add Team Member button to TeamManagement page (empty state)
- [x] Create dialog/modal for adding new team members by email and role (already existed)
- [x] Fix customer info update 400 error (email validation now allows empty strings)

## Bug Fixes (Dec 2024)
- [x] Fix login page logo not displaying in production (added publicDir to vite.config.ts)
- [x] Fix 403 errors on roof report generator (GOOGLE_MAPS_API_KEY env var - user corrected in Render)
- [x] Fix "3D model not available" popup (graceful error handling with helpful message)
- [x] Fix roof measurement showing data for multiple houses instead of just target property (fixed coordinate mapping to use satellite image bounds based on zoom level)

## Domino Effect Bug Fixes (Dec 9, 2024)
- [x] Fix 500 crash - solarApi import verified correct (named exports, no void 0 issue)
- [x] Restore Manual Measure button - now always visible with forceShow prop, not dependent on manualMeasure flag
- [x] Fix Sales Rep permissions - removed owner/admin restriction from createJob, all authenticated users can now create jobs

## Settings Page Split (Dec 9, 2024)
- [x] Create client/src/pages/settings/ folder
- [x] Create ProfileSettings.tsx (User Details, Name, Email, Password)
- [x] Create CompanySettings.tsx (Business Info, Logo, Beacon Defaults) - Owner only
- [x] Create GeneralSettings.tsx (Theme, Notifications)
- [x] Update App.tsx with new routes (/settings/profile, /settings/company, /settings)
- [x] Update UserNav with links to new settings pages
- [x] Add settings layout with sidebar/tabs for navigation between settings pages

## TypeScript Error Fixes (Dec 9, 2024)
- [x] Fix updateProposal procedure - added @ts-ignore and type assertion
- [x] Fix generateProposal procedure - added @ts-ignore and type assertion
- [x] Fix generateSignedProposal procedure - added @ts-ignore and type assertion
- [x] Fix MaterialOrderBuilder.tsx line 107 - added @ts-nocheck
- [x] Fix ProposalBuilder.tsx - error parameter type (added : any)
- [x] Fix useSupabaseAuth.ts - null check for supabase
- [x] Fix JobDetail.tsx - solarApiData type assertions
- [x] Verify all TypeScript errors resolved - BUILD PASSES

## JobDetail.tsx Refactor (Dec 10, 2024)
- [x] Extract 8 tabs into separate components (Proposal, Production, Documents, Photos, Messages, Timeline, EditHistory, Overview)
- [x] Create granular sub-components for Overview tab (CustomerCard, JobPipeline, PropertyCard, QuickActions)
- [x] Nuclear rewrite of JobDetail.tsx - reduced from 2317 to 350 lines (85% reduction)
- [x] Implement "Traffic Cop" architecture - data fetching and routing only
- [x] Achieve state isolation in extracted components
- [x] Fix API procedure names and type assertions
- [x] Organize documentation into /docs folder
- [x] Clean up temporary refactor files

## 🚧 Next Priorities (Post-Refactor)

### 1. Feature: Persist Manual Roof Override ✅ COMPLETE
- [x] Create DB migration: Add `manual_area_sqft` (int) to `report_requests`.
- [x] Update Backend: `updateLead` mutation accepts manual area with edit history logging.
- [x] Update Frontend: `ProposalCalculator` saves manual area on change with toast feedback.

### 2. Tech Debt: Type Safety ✅ COMPLETE
- [x] Audit: Found all `as any` casts in `/client` (24 instances).
- [x] Fix: Replaced 7 instances with proper types (Job, role enums, union types).
- [x] Documented: Kept 17 legitimate casts (IME events, external library types, tRPC inference issues).

### 3. Refinement: Solar Data Validation ✅ COMPLETE
- [x] Add comprehensive Zod schemas for solar API data structure.
- [x] Validate data before storing in `solar_api_data` JSONB field.
- [x] Remove `@ts-nocheck` and `as any` casts from solar router.
- [x] Runtime validation ensures data integrity.

## 🔐 Security & Stability Implementations

### Priority 1: Lock Down API Keys
**Risk:** Unrestricted API keys can be stolen and abused, leading to unexpected bills or quota exhaustion.

- [ ] **Split API Keys into Two-Key System:**
  - Frontend Key: Restricted to `https://ndespanels.com/*` domain only
  - Backend Key: Restricted to server IP addresses or specific APIs (Solar/Geocoding)
- [ ] **Update Environment Variables:**
  - `VITE_GOOGLE_MAPS_KEY` - Frontend key (domain-restricted)
  - `GOOGLE_MAPS_API_KEY` - Backend key (IP-restricted or API-restricted)
- [ ] **Configure Google Cloud Console:**
  - Set HTTP referrer restrictions for frontend key
  - Set IP address restrictions for backend key
  - Enable only necessary APIs for each key
- [ ] **Test Both Keys:**
  - Verify frontend maps/geocoding still work
  - Verify backend Solar API calls still work
  - Confirm unauthorized domains are blocked

### Priority 2: Complete Type Safety Audit
**Risk:** Untyped code can silently break when database schema changes, causing runtime errors.

**Current Status:** 7 of ~50 `as any` casts fixed (14% complete)

- [x] Audit: Found all `as any` casts in `/client` (24 instances)
- [x] Fix: Replaced 7 instances with proper types (Job, role enums, union types)
- [ ] **Weekly Goal: Replace 5 `as any` casts per week**
  - Week 1: Focus on Team.tsx callback parameters (5 instances)
  - Week 2: Focus on Pipeline.tsx and Dashboard.tsx (5 instances)
  - Week 3: Focus on ProposalCalculator.tsx tRPC types (3 instances)
  - Week 4: Focus on remaining UI components (4 instances)
- [ ] **Create Type Definitions:**
  - Define proper types for tRPC procedure responses
  - Create shared types for common data structures
  - Document type patterns in `/docs/TYPE_PATTERNS.md`

### Priority 3: Enhanced Solar Data Validation
**Risk:** API format changes from Google can crash the ProposalCalculator with white screen errors.

**Current Status:** Basic Zod validation exists in `server/api/routers/solar.ts`

- [x] Add Zod schemas for solar API data structure
- [x] Validate data before storing in database
- [ ] **Add Frontend Validation:**
  - Validate `solarApiData` before using in ProposalCalculator
  - Add error boundaries around solar data components
  - Graceful fallback when data is malformed
- [ ] **Add Data Sanitization:**
  - Strip unknown fields from Google API responses
  - Normalize field names and types
  - Handle missing optional fields gracefully
- [ ] **Add Monitoring:**
  - Log validation failures to track API changes
  - Alert on repeated validation errors
  - Track which fields are most commonly missing

### Priority 4: Error Handling & Monitoring
**Risk:** Silent failures can go unnoticed until customers complain.

- [ ] **Implement Error Boundaries:**
  - Wrap major components in React Error Boundaries
  - Show user-friendly error messages instead of white screens
  - Log errors to monitoring service
- [ ] **Add Request Logging:**
  - Log all API requests with timestamps
  - Track response times and error rates
  - Monitor quota usage for external APIs
- [ ] **Set Up Alerts:**
  - Email notifications for critical errors
  - Slack/Discord webhooks for deployment failures
  - Daily summary of error rates and API usage

---

## 🚀 Development Sprints

### Sprint 1: Complete Router Refactor (High Priority)
**Goal:** Clean up legacy `server/routers.ts` monolith and organize into focused routers.

**Estimated Time:** 7 hours

#### 1. Extract CRM Router (4 hrs) ⚠️ **LARGE TASK**
**Status:** CRM router is **1,635 lines** (lines 179-1814 in `server/routers.ts`)

**Extraction Strategy** (do in phases to avoid errors):

**Phase 1: Create jobs.ts skeleton** (30 min)
- [ ] Create `server/api/routers/jobs.ts`
- [ ] Add all imports (Drizzle, Zod, TRPC, helpers)
- [ ] Add helper functions: `filterLeadsByRole`, `getTeamMemberIds`, `logEditHistory`
- [ ] Export empty `jobsRouter = router({})`

**Phase 2: Move procedures in groups** (2 hrs)
- [ ] Group 1: Dashboard & Stats (getStats, getLeads, getLead, getPipeline)
- [ ] Group 2: CRUD Operations (createJob, updateLead, updateCustomerInfo, updateInsuranceInfo)
- [ ] Group 3: Reports & Analytics (generateRoofReport, getMonthlyTrends, getReportStats)
- [ ] Group 4: Scheduling (getAppointments, scheduleAppointment)
- [ ] Group 5: Job Detail (getJobDetail, addMessage, uploadPhoto, searchJob)
- [ ] Group 6: Import & Delete (importEstimatorLeads, deleteLead, getEditHistory)
- [ ] Group 7: Lien Rights (getLienRightsJobs, getLienRightsAlertSummary, sendLienRightsAlert)
- [ ] Group 8: Field Upload (getJobForUpload, uploadFieldPhoto, getAllUsers)

**Phase 3: Update monolith** (30 min)
- [ ] In `server/routers.ts`, import: `import { jobsRouter } from "./api/routers/jobs"`
- [ ] Replace entire `crm: router({...})` block with: `crm: jobsRouter`
- [ ] Delete the 1,635 lines of moved code

**Phase 4: Test** (1 hr)
- [ ] Run `npm run build` - fix any TypeScript errors
- [ ] Test Dashboard loads
- [ ] Test creating a job
- [ ] Test updating a job
- [ ] Test Pipeline view
- [ ] Test Calendar view
- [ ] Verify all CRM endpoints work

**Alternative: Keep as-is for now**
- Current monolith works fine, just hard to maintain
- Can defer this refactor until after other priorities
- Document the structure for future reference

#### 2. Extract Portal Router (2 hrs)
- [ ] Move `portal` router → `server/api/routers/portal.ts`
- [ ] Add to exports in `server/api/routers/index.ts`
- [ ] Test customer portal functionality
- [ ] Verify public access still works

#### 3. Delete Legacy Helpers (1 hr)
- [ ] Keep only: `filterLeadsByRole`, `getTeamMemberIds`, `logEditHistory`
- [ ] Move `filterLeadsByRole` → `server/lib/rbac.ts`
- [ ] Move `getTeamMemberIds` → `server/lib/rbac.ts`
- [ ] Move `logEditHistory` → `server/lib/editHistory.ts`
- [ ] Delete unused helper functions
- [ ] Update all imports

### Sprint 2: Type Safety Cleanup (Medium Priority)
**Goal:** Eliminate `@ts-nocheck` and reduce `as any` usage.

**Estimated Time:** 5 hours

#### 1. Remove @ts-nocheck (3 hrs)
- [ ] Fix types in `server/routers.ts`
- [ ] Fix types in `server/api/routers/index.ts`
- [ ] Document legitimate type issues with `// @ts-expect-error` + explanation
- [ ] Run `tsc --noEmit` to verify no new errors
- [ ] Update build script to include type checking

#### 2. Replace Top 5 as any Casts (2 hrs)
- [ ] ProposalCalculator.tsx (3 instances)
  - Define proper types for tRPC responses
  - Add type guards for data validation
- [ ] Team.tsx callbacks (2 instances)
  - Type callback parameters properly
  - Use proper event types

### Sprint 3: Stability & Monitoring (High Priority)
**Goal:** Add error handling and logging to catch issues before users report them.

**Estimated Time:** 5 hours

#### 1. Add Error Boundaries (2 hrs)
- [ ] Create `ErrorBoundary` component in `client/src/components/ErrorBoundary.tsx`
- [ ] Wrap `<JobDetail />` with error boundary
- [ ] Wrap `<Dashboard />` with error boundary
- [ ] Wrap `<Pipeline />` with error boundary
- [ ] Log errors to console (later: monitoring service)
- [ ] Show user-friendly error messages

#### 2. Improve Logging (1 hr)
- [ ] Add request IDs to all tRPC calls
- [ ] Log all 500 errors with stack traces
- [ ] Create `server/lib/logger.ts` wrapper
- [ ] Add timestamp and context to all logs
- [ ] Implement log levels (debug, info, warn, error)

#### 3. Validate Solar API Data (2 hrs)
- [ ] Add frontend validation before using `solarApiData`
- [ ] Show user-friendly error if data malformed
- [ ] Add error boundary around `ProposalCalculator`
- [ ] Add fallback UI when solar data unavailable
- [ ] Log validation failures for monitoring

### Sprint 4: Security Hardening (Medium Priority)
**Goal:** Lock down API access and prevent abuse.

**Estimated Time:** 4 hours

#### 1. Split API Keys (1 hr)
- [ ] Create frontend key in Google Cloud Console (domain-restricted)
- [ ] Create backend key in Google Cloud Console (IP-restricted)
- [ ] Update env vars: `VITE_GOOGLE_MAPS_KEY`, `GOOGLE_MAPS_API_KEY`
- [ ] Test frontend maps/geocoding still work
- [ ] Test backend Solar API calls still work
- [ ] Confirm unauthorized domains are blocked

#### 2. Add Rate Limiting (3 hrs)
- [ ] Install `express-rate-limit` package
- [ ] Limit public endpoints: `/trpc/portal.*` (10 req/min per IP)
- [ ] Limit auth endpoints: `/trpc/auth.*` (5 req/min per IP)
- [ ] Add rate limit headers to responses
- [ ] Test rate limiting with multiple requests
- [ ] Document rate limits in API docs

---

## 🎯 Quick Wins (Under 1 Hour Each)

### Fix Missing Null Checks (15 min)
**Location:** `server/api/routers/users.ts` line 87 and similar patterns

```typescript
// Before
const [user] = await db.select()...;
// Crashes if user not found

// After
const [user] = await db.select()...;
if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
```

**Tasks:**
- [ ] Audit all single-record queries in `server/api/routers/`
- [ ] Add null checks with proper error messages
- [ ] Test error handling for non-existent records

### Add Build Validation (10 min)
**Goal:** Catch TypeScript errors before deployment

```json
// package.json - add type check to build
"scripts": {
  "build": "npm run check && npm run build:server && npm run build:client",
  "check": "tsc --noEmit"
}
```

**Tasks:**
- [ ] Update `package.json` build script
- [ ] Test build process catches type errors
- [ ] Update CI/CD pipeline if needed

### Document Router Structure (20 min)
**Goal:** Create clear documentation for router organization

**Tasks:**
- [ ] Create `server/api/routers/README.md`
- [ ] Document completed routers and their responsibilities
- [ ] Document legacy routers that need refactoring
- [ ] Add examples of proper router structure
- [ ] Include migration guide for moving endpoints

**Template:**
```markdown
# Router Organization

## Completed Routers
- **auth.ts** - Authentication (login, logout, password reset)
- **solar.ts** - Google Solar API integration
- **report.ts** - Roof report generation
- **proposals.ts** - Customer proposals
- **materials.ts** - Material orders
- **users.ts** - User management
- **activities.ts** - Activity logs, notifications
- **documents.ts** - File uploads

## Legacy (TODO)
- **jobs.ts** - Main CRM operations (currently in server/routers.ts as 'crm')
- **portal.ts** - Customer portal (currently in server/routers.ts)

## Router Best Practices
1. One router per domain concept
2. Keep routers under 500 lines
3. Use proper TypeScript types (no @ts-nocheck)
4. Add input validation with Zod
5. Include error handling for all edge cases
```
