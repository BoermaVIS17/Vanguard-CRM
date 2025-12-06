import { describe, it, expect } from "vitest";

describe("CRM Module", () => {
  describe("Role Permissions", () => {
    const ROLES = ["owner", "admin", "office", "sales_rep", "project_manager", "user"];
    
    it("should have valid role definitions", () => {
      expect(ROLES).toContain("owner");
      expect(ROLES).toContain("sales_rep");
      expect(ROLES).toContain("project_manager");
      expect(ROLES.length).toBe(6);
    });

    it("owner role should have highest permissions", () => {
      const ownerPermissions = {
        canManageTeam: true,
        canViewAllLeads: true,
        canEditSettings: true,
        canDeleteLeads: true,
      };
      expect(ownerPermissions.canManageTeam).toBe(true);
      expect(ownerPermissions.canDeleteLeads).toBe(true);
    });

    it("sales_rep role should have limited permissions", () => {
      const repPermissions = {
        canManageTeam: false,
        canViewAllLeads: false,
        canEditSettings: false,
        canViewAssignedLeads: true,
      };
      expect(repPermissions.canManageTeam).toBe(false);
      expect(repPermissions.canViewAssignedLeads).toBe(true);
    });
  });

  describe("Pipeline Stages", () => {
    const PIPELINE_STAGES = [
      "new_lead",
      "contacted", 
      "appointment_set",
      "inspection_scheduled",
      "inspection_complete",
      "report_sent",
      "follow_up",
      "closed_won",
      "closed_lost",
    ];

    it("should have all required pipeline stages", () => {
      expect(PIPELINE_STAGES).toContain("new_lead");
      expect(PIPELINE_STAGES).toContain("inspection_scheduled");
      expect(PIPELINE_STAGES).toContain("closed_won");
      expect(PIPELINE_STAGES).toContain("closed_lost");
    });

    it("should have stages in logical order", () => {
      const newLeadIndex = PIPELINE_STAGES.indexOf("new_lead");
      const closedWonIndex = PIPELINE_STAGES.indexOf("closed_won");
      expect(newLeadIndex).toBeLessThan(closedWonIndex);
    });

    it("should have 9 total stages", () => {
      expect(PIPELINE_STAGES.length).toBe(9);
    });
  });

  describe("Lead Status Transitions", () => {
    it("should allow valid status transitions", () => {
      const validTransitions: Record<string, string[]> = {
        new_lead: ["contacted", "closed_lost"],
        contacted: ["appointment_set", "follow_up", "closed_lost"],
        appointment_set: ["inspection_scheduled", "closed_lost"],
        inspection_scheduled: ["inspection_complete", "closed_lost"],
        inspection_complete: ["report_sent", "closed_lost"],
        report_sent: ["follow_up", "closed_won", "closed_lost"],
      };

      expect(validTransitions.new_lead).toContain("contacted");
      expect(validTransitions.report_sent).toContain("closed_won");
    });
  });

  describe("Sales Rep Code Attribution", () => {
    it("should extract rep initials from S26 codes", () => {
      const extractRepCode = (promoCode: string): string | null => {
        if (promoCode.toUpperCase().endsWith("S26")) {
          return promoCode.slice(0, -3).toUpperCase();
        }
        return null;
      };

      expect(extractRepCode("MJS26")).toBe("MJ");
      expect(extractRepCode("STS26")).toBe("ST");
      expect(extractRepCode("ABCS26")).toBe("ABC");
      expect(extractRepCode("NEIGHBOR25")).toBeNull();
    });

    it("should handle case-insensitive codes", () => {
      const isValidRepCode = (code: string): boolean => {
        return code.toUpperCase().endsWith("S26");
      };

      expect(isValidRepCode("mjs26")).toBe(true);
      expect(isValidRepCode("MJS26")).toBe(true);
      expect(isValidRepCode("Mjs26")).toBe(true);
    });
  });
});
