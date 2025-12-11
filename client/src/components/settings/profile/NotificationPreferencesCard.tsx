import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  sms: boolean;
  email: boolean;
}

export default function NotificationPreferencesCard() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "new_lead",
      label: "New Lead Assigned",
      description: "When a new lead is assigned to you",
      sms: true,
      email: true,
    },
    {
      id: "job_completed",
      label: "Job Completed",
      description: "When a job you're assigned to is marked complete",
      sms: false,
      email: true,
    },
    {
      id: "mentioned",
      label: "Mentioned in Note",
      description: "When someone mentions you in a job note",
      sms: true,
      email: false,
    },
    {
      id: "status_change",
      label: "Status Changes",
      description: "When a job status changes on your assigned jobs",
      sms: false,
      email: true,
    },
    {
      id: "payment_received",
      label: "Payment Received",
      description: "When payment is received for your jobs",
      sms: false,
      email: true,
    },
  ]);

  const togglePreference = (id: string, type: 'sms' | 'email') => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === id
          ? { ...pref, [type]: !pref[type] }
          : pref
      )
    );
    toast.success("Preference updated");
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00D4FF]" />
          Notification Preferences
        </CardTitle>
        <CardDescription className="text-slate-400">
          Choose how you want to be notified
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {preferences.map((pref) => (
            <div
              key={pref.id}
              className="flex items-start justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
            >
              <div className="flex-1">
                <Label className="text-slate-200 font-medium">{pref.label}</Label>
                <p className="text-xs text-slate-400 mt-1">{pref.description}</p>
              </div>
              <div className="flex gap-4 ml-4">
                {/* SMS Toggle */}
                <button
                  onClick={() => togglePreference(pref.id, 'sms')}
                  className="flex flex-col items-center gap-1 group"
                  title="SMS Notifications"
                >
                  <MessageSquare
                    className={`w-5 h-5 transition-colors ${
                      pref.sms
                        ? "text-[#00D4FF]"
                        : "text-slate-600 group-hover:text-slate-500"
                    }`}
                  />
                  <span className="text-[10px] text-slate-500">SMS</span>
                </button>

                {/* Email Toggle */}
                <button
                  onClick={() => togglePreference(pref.id, 'email')}
                  className="flex flex-col items-center gap-1 group"
                  title="Email Notifications"
                >
                  <Mail
                    className={`w-5 h-5 transition-colors ${
                      pref.email
                        ? "text-[#00D4FF]"
                        : "text-slate-600 group-hover:text-slate-500"
                    }`}
                  />
                  <span className="text-[10px] text-slate-500">Email</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> SMS notifications require a valid phone number in your profile. 
            Standard messaging rates may apply.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
