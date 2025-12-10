import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import SettingsLayout from "./SettingsLayout";
import BasicInfoCard from "@/components/settings/profile/BasicInfoCard";
import SecurityCard from "@/components/settings/profile/SecurityCard";
import BrandingCard from "@/components/settings/profile/BrandingCard";
import SignatureCard from "@/components/settings/profile/SignatureCard";
import NotificationPreferencesCard from "@/components/settings/profile/NotificationPreferencesCard";
import SalesRepCard from "@/components/settings/profile/SalesRepCard";
import TeamLeadCard from "@/components/settings/profile/TeamLeadCard";
import OfficeStaffCard from "@/components/settings/profile/OfficeStaffCard";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function ProfileSettings() {
  const { data: currentUser, refetch } = trpc.auth.me.useQuery();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser !== undefined) {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleUpdate = () => {
    refetch();
  };

  if (isLoading || !currentUser) {
    return (
      <SettingsLayout title="My Profile" description="Loading...">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full" />
        </div>
      </SettingsLayout>
    );
  }

  const isOwner = currentUser.role === "owner";
  const isTeamLead = currentUser.role === "team_lead";
  const isSalesRep = currentUser.role === "sales_rep";
  const isOfficeStaff = currentUser.role === "admin" || currentUser.role === "office";

  return (
    <SettingsLayout 
      title="My Profile" 
      description="Manage your personal information and account settings"
    >
      {/* Owner Quick Link to Company Settings */}
      {isOwner && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-300 font-medium">Owner Access</h3>
              <p className="text-sm text-purple-400/70">Manage company-wide settings and integrations</p>
            </div>
            <Button
              onClick={() => window.location.href = "/settings/company"}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Company Settings
            </Button>
          </div>
        </div>
      )}

      {/* Component Shell Pattern: Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <BasicInfoCard user={currentUser} onUpdate={handleUpdate} />
          <BrandingCard user={currentUser} onUpdate={handleUpdate} />
          {isSalesRep && <SalesRepCard />}
          {isTeamLead && <TeamLeadCard userId={currentUser.id} />}
          {isOfficeStaff && <OfficeStaffCard />}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <SecurityCard />
          <SignatureCard />
          <NotificationPreferencesCard />
        </div>
      </div>
    </SettingsLayout>
  );
}
