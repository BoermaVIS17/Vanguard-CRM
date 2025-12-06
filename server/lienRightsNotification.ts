import { ENV } from "./_core/env";
import { getDb } from "./db";
import { reportRequests, users } from "../drizzle/schema";
import { eq, and, isNotNull, lte, gte, inArray } from "drizzle-orm";

interface LienRightsJob {
  id: number;
  fullName: string;
  address: string;
  cityStateZip: string;
  projectCompletedAt: Date;
  lienRightsExpiresAt: Date;
  daysRemaining: number;
  urgencyLevel: "warning" | "critical";
}

interface LienRightsNotificationResult {
  success: boolean;
  warningCount: number;
  criticalCount: number;
  notifiedAdmins: string[];
  error?: string;
}

/**
 * Calculate days remaining until lien rights expire
 */
function calculateDaysRemaining(expiresAt: Date): number {
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get urgency level based on days remaining
 */
function getUrgencyLevel(daysRemaining: number): "warning" | "critical" | "active" | "expired" {
  if (daysRemaining <= 0) return "expired";
  if (daysRemaining <= 14) return "critical";
  if (daysRemaining <= 30) return "warning";
  return "active";
}

/**
 * Build HTML email template for lien rights alert
 */
function buildLienRightsEmailHtml(
  warningJobs: LienRightsJob[],
  criticalJobs: LienRightsJob[],
  crmUrl: string
): string {
  const totalJobs = warningJobs.length + criticalJobs.length;
  
  const buildJobRow = (job: LienRightsJob) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
        <strong style="color: #1e293b;">${job.fullName}</strong><br>
        <span style="color: #64748b; font-size: 13px;">${job.address}, ${job.cityStateZip}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; ${
          job.urgencyLevel === "critical" 
            ? "background-color: #fef2f2; color: #dc2626;" 
            : "background-color: #fefce8; color: #ca8a04;"
        }">
          ${job.daysRemaining} days
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        <a href="${crmUrl}/crm/job/${job.id}" style="color: #2dd4bf; text-decoration: none; font-weight: 500;">
          View Job →
        </a>
      </td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lien Rights Alert - Action Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ⚠️ Lien Rights Alert - Action Required
              </h1>
              <p style="margin: 10px 0 0; color: #fecaca; font-size: 16px;">
                ${totalJobs} job${totalJobs !== 1 ? "s" : ""} require${totalJobs === 1 ? "s" : ""} immediate attention
              </p>
            </td>
          </tr>
          
          <!-- Summary -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; padding: 16px; background-color: #fef2f2; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #dc2626;">${criticalJobs.length}</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #991b1b;">Critical (≤14 days)</p>
                  </td>
                  <td style="width: 16px;"></td>
                  <td style="width: 50%; padding: 16px; background-color: #fefce8; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #ca8a04;">${warningJobs.length}</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #a16207;">Warning (15-30 days)</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Critical Jobs -->
          ${criticalJobs.length > 0 ? `
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 16px; color: #dc2626; font-size: 18px; font-weight: 600;">
                🚨 Critical - Immediate Action Required
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #fecaca;">
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase;">Job</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase;">Days Left</th>
                  <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase;">Action</th>
                </tr>
                ${criticalJobs.map(buildJobRow).join("")}
              </table>
            </td>
          </tr>
          ` : ""}
          
          <!-- Warning Jobs -->
          ${warningJobs.length > 0 ? `
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 16px; color: #ca8a04; font-size: 18px; font-weight: 600;">
                ⚡ Warning - Review Soon
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fefce8; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #fef08a;">
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #a16207; text-transform: uppercase;">Job</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #a16207; text-transform: uppercase;">Days Left</th>
                  <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #a16207; text-transform: uppercase;">Action</th>
                </tr>
                ${warningJobs.map(buildJobRow).join("")}
              </table>
            </td>
          </tr>
          ` : ""}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 20px 40px 30px; text-align: center;">
              <a href="${crmUrl}/crm/pipeline" style="display: inline-block; padding: 14px 28px; background-color: #2dd4bf; color: #0f172a; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
                View Pipeline Dashboard →
              </a>
            </td>
          </tr>
          
          <!-- Info Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px 20px;">
                <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">
                  <strong>What are Lien Rights?</strong><br>
                  In Florida, contractors have 90 days from project completion to file a lien if payment is not received. 
                  Jobs approaching this deadline require immediate follow-up to ensure payment or initiate legal proceedings.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                This is an automated weekly lien rights alert from NextDoor Exterior Solutions CRM.<br>
                You're receiving this because you have admin or owner access.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Build plain text version of lien rights alert email
 */
function buildLienRightsEmailText(
  warningJobs: LienRightsJob[],
  criticalJobs: LienRightsJob[],
  crmUrl: string
): string {
  const totalJobs = warningJobs.length + criticalJobs.length;
  
  let text = `
⚠️ LIEN RIGHTS ALERT - ACTION REQUIRED
=======================================

${totalJobs} job${totalJobs !== 1 ? "s" : ""} require${totalJobs === 1 ? "s" : ""} immediate attention.

Summary:
- Critical (≤14 days): ${criticalJobs.length}
- Warning (15-30 days): ${warningJobs.length}

`;

  if (criticalJobs.length > 0) {
    text += `
🚨 CRITICAL - IMMEDIATE ACTION REQUIRED
----------------------------------------
`;
    criticalJobs.forEach(job => {
      text += `
• ${job.fullName}
  ${job.address}, ${job.cityStateZip}
  Days Remaining: ${job.daysRemaining}
  View: ${crmUrl}/crm/job/${job.id}
`;
    });
  }

  if (warningJobs.length > 0) {
    text += `
⚡ WARNING - REVIEW SOON
------------------------
`;
    warningJobs.forEach(job => {
      text += `
• ${job.fullName}
  ${job.address}, ${job.cityStateZip}
  Days Remaining: ${job.daysRemaining}
  View: ${crmUrl}/crm/job/${job.id}
`;
    });
  }

  text += `
---
View Pipeline Dashboard: ${crmUrl}/crm/pipeline

This is an automated weekly lien rights alert from NextDoor Exterior Solutions CRM.
You're receiving this because you have admin or owner access.
`;

  return text.trim();
}

/**
 * Get all jobs that are in warning or critical lien rights status
 */
export async function getLienRightsAlertJobs(): Promise<{
  warningJobs: LienRightsJob[];
  criticalJobs: LienRightsJob[];
}> {
  const db = await getDb();
  if (!db) {
    console.warn("[LienRights] Database not available");
    return { warningJobs: [], criticalJobs: [] };
  }
  
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // Get jobs that have lien rights expiring within 30 days
  const jobs = await db
    .select()
    .from(reportRequests)
    .where(
      and(
        isNotNull(reportRequests.lienRightsExpiresAt),
        lte(reportRequests.lienRightsExpiresAt, thirtyDaysFromNow),
        gte(reportRequests.lienRightsExpiresAt, now),
        eq(reportRequests.status, "invoiced")
      )
    );

  const warningJobs: LienRightsJob[] = [];
  const criticalJobs: LienRightsJob[] = [];

  for (const job of jobs) {
    if (!job.lienRightsExpiresAt) continue;
    
    const daysRemaining = calculateDaysRemaining(new Date(job.lienRightsExpiresAt));
    const urgencyLevel = getUrgencyLevel(daysRemaining);
    
    if (urgencyLevel !== "warning" && urgencyLevel !== "critical") continue;

    const lienJob: LienRightsJob = {
      id: job.id,
      fullName: job.fullName,
      address: job.address,
      cityStateZip: job.cityStateZip,
      projectCompletedAt: new Date(job.projectCompletedAt!),
      lienRightsExpiresAt: new Date(job.lienRightsExpiresAt),
      daysRemaining,
      urgencyLevel: urgencyLevel as "warning" | "critical",
    };

    if (urgencyLevel === "critical") {
      criticalJobs.push(lienJob);
    } else {
      warningJobs.push(lienJob);
    }
  }

  // Sort by days remaining (most urgent first)
  criticalJobs.sort((a, b) => a.daysRemaining - b.daysRemaining);
  warningJobs.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return { warningJobs, criticalJobs };
}

/**
 * Get all admin and owner users to notify
 */
async function getAdminUsers(): Promise<{ id: number; name: string | null; email: string | null }[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[LienRights] Database not available for admin users");
    return [];
  }
  
  const adminUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(
      and(
        isNotNull(users.email),
        isNotNull(users.name),
        inArray(users.role, ["owner", "admin"])
      )
    );

  return adminUsers;
}

/**
 * Send lien rights alert notification to all admins and owners
 */
export async function sendLienRightsAlertNotification(
  crmUrl: string = "https://nextdoor-landing.manus.space"
): Promise<LienRightsNotificationResult> {
  try {
    // Get jobs that need alerts
    const { warningJobs, criticalJobs } = await getLienRightsAlertJobs();
    
    // If no jobs need alerts, return early
    if (warningJobs.length === 0 && criticalJobs.length === 0) {
      console.log("[LienRights] No jobs require lien rights alerts");
      return {
        success: true,
        warningCount: 0,
        criticalCount: 0,
        notifiedAdmins: [],
      };
    }

    // Get admin users to notify
    const adminUsers = await getAdminUsers();
    
    if (adminUsers.length === 0) {
      console.log("[LienRights] No admin users found to notify");
      return {
        success: true,
        warningCount: warningJobs.length,
        criticalCount: criticalJobs.length,
        notifiedAdmins: [],
      };
    }

    // Check if notification service is configured
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      console.log("[LienRights] Notification service not configured, skipping alerts");
      return {
        success: false,
        warningCount: warningJobs.length,
        criticalCount: criticalJobs.length,
        notifiedAdmins: [],
        error: "Notification service not configured",
      };
    }

    const endpoint = `${ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : ENV.forgeApiUrl + "/"}webdevtoken.v1.WebDevService/SendNotification`;

    // Build notification content
    const totalJobs = warningJobs.length + criticalJobs.length;
    const title = `🚨 Lien Rights Alert: ${criticalJobs.length} Critical, ${warningJobs.length} Warning`;
    
    let content = `${totalJobs} job${totalJobs !== 1 ? "s" : ""} require attention for lien rights.\n\n`;
    
    if (criticalJobs.length > 0) {
      content += `🚨 CRITICAL (≤14 days):\n`;
      criticalJobs.slice(0, 5).forEach(job => {
        content += `• ${job.fullName} - ${job.daysRemaining} days left\n`;
      });
      if (criticalJobs.length > 5) {
        content += `  ... and ${criticalJobs.length - 5} more\n`;
      }
      content += `\n`;
    }
    
    if (warningJobs.length > 0) {
      content += `⚠️ WARNING (15-30 days):\n`;
      warningJobs.slice(0, 5).forEach(job => {
        content += `• ${job.fullName} - ${job.daysRemaining} days left\n`;
      });
      if (warningJobs.length > 5) {
        content += `  ... and ${warningJobs.length - 5} more\n`;
      }
    }
    
    content += `\nView Pipeline: ${crmUrl}/crm/pipeline`;

    // Send notification
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[LienRights] Failed to send notification (${response.status})${detail ? `: ${detail}` : ""}`);
      return {
        success: false,
        warningCount: warningJobs.length,
        criticalCount: criticalJobs.length,
        notifiedAdmins: [],
        error: `Notification failed: ${response.status}`,
      };
    }

    const notifiedAdmins = adminUsers.map(u => u.email!).filter(Boolean);
    console.log(`[LienRights] Alert notification sent - ${criticalJobs.length} critical, ${warningJobs.length} warning jobs`);
    
    return {
      success: true,
      warningCount: warningJobs.length,
      criticalCount: criticalJobs.length,
      notifiedAdmins,
    };
  } catch (error) {
    console.error("[LienRights] Error sending alert notification:", error);
    return {
      success: false,
      warningCount: 0,
      criticalCount: 0,
      notifiedAdmins: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get HTML content for lien rights alert email (for preview/testing)
 */
export function getLienRightsEmailHtml(
  warningJobs: LienRightsJob[],
  criticalJobs: LienRightsJob[],
  crmUrl: string = "https://nextdoor-landing.manus.space"
): string {
  return buildLienRightsEmailHtml(warningJobs, criticalJobs, crmUrl);
}

/**
 * Get plain text content for lien rights alert email (for preview/testing)
 */
export function getLienRightsEmailText(
  warningJobs: LienRightsJob[],
  criticalJobs: LienRightsJob[],
  crmUrl: string = "https://nextdoor-landing.manus.space"
): string {
  return buildLienRightsEmailText(warningJobs, criticalJobs, crmUrl);
}
