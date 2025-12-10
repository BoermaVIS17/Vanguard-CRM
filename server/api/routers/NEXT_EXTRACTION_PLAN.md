# Next Extraction Plan

## Remaining CRM Router: ~2416 lines

### Proposed Extraction Strategy:

#### 1. **jobs.ts** (~800 lines)
Core job/lead CRUD operations:
- getLeads
- getLead  
- createJob
- updateLead
- updateCustomerInfo
- updateInsuranceInfo
- deleteLead
- generateRoofReport
- importEstimatorLeads

#### 2. **team.ts** (~400 lines)
Team & user management:
- getMyPermissions
- getTeam
- getTeamLeads
- updateTeamMember
- createTeamAccount
- updateUser

#### 3. **activities.ts** (~300 lines)
Activities, notes, and messaging:
- addNote
- getActivities (if exists)
- Job messaging/communication features

#### 4. **documents.ts** (~200 lines)
Document management:
- uploadDocument
- getDocuments
- deleteDocument

#### 5. **analytics.ts** (~400 lines)
Dashboard & reporting:
- getStats
- getPipeline
- getMonthlyTrends
- getLeadsByCategory
- getReportStats
- getLeadsForExport

#### 6. **scheduling.ts** (~200 lines)
Calendar & appointments:
- getAppointments
- scheduleAppointment

#### 7. **history.ts** (~100 lines)
Edit history & audit trail:
- getEditHistory
- deleteEditHistory

### Benefits:
- Each file < 800 lines (easy to navigate)
- Clear domain boundaries
- Easier to find specific functionality
- Better for AI and human developers

### Next Steps:
1. Extract jobs.ts (most critical, highest usage)
2. Extract team.ts (user management)
3. Extract analytics.ts (dashboard)
4. Extract remaining smaller routers
5. Update appRouter to use all new routers
