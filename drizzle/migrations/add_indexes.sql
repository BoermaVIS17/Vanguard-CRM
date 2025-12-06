-- Performance indexes for CRM tables
-- Run this in your Supabase SQL Editor

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_openId ON users(openId);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_isActive ON users(isActive);
CREATE INDEX IF NOT EXISTS idx_users_teamLeadId ON users(teamLeadId);

-- Report requests (leads/jobs) table indexes
CREATE INDEX IF NOT EXISTS idx_report_requests_status ON report_requests(status);
CREATE INDEX IF NOT EXISTS idx_report_requests_assignedTo ON report_requests(assignedTo);
CREATE INDEX IF NOT EXISTS idx_report_requests_teamLeadId ON report_requests(teamLeadId);
CREATE INDEX IF NOT EXISTS idx_report_requests_createdAt ON report_requests(createdAt);
CREATE INDEX IF NOT EXISTS idx_report_requests_email ON report_requests(email);
CREATE INDEX IF NOT EXISTS idx_report_requests_dealType ON report_requests(dealType);
CREATE INDEX IF NOT EXISTS idx_report_requests_lienRightsStatus ON report_requests(lienRightsStatus);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_report_requests_status_assignedTo ON report_requests(status, assignedTo);
CREATE INDEX IF NOT EXISTS idx_report_requests_assignedTo_status ON report_requests(assignedTo, status);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_reportRequestId ON activities(reportRequestId);
CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities(userId);
CREATE INDEX IF NOT EXISTS idx_activities_createdAt ON activities(createdAt);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_reportRequestId ON documents(reportRequestId);
CREATE INDEX IF NOT EXISTS idx_documents_uploadedBy ON documents(uploadedBy);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- Edit history table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_edit_history_reportRequestId ON edit_history(reportRequestId);
CREATE INDEX IF NOT EXISTS idx_edit_history_userId ON edit_history(userId);
