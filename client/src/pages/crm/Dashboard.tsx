import { Link } from "wouter";
import {
  Users,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  Phone,
  ChevronRight,
  Plus,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import CRMLayout from "@/components/crm/CRMLayout";

// Pipeline stage configuration with AccuLynx-style colors
const pipelineStages = [
  { key: "new_lead", label: "Lead", short: "L", color: "bg-orange-500" },
  { key: "contacted", label: "Contacted", short: "C", color: "bg-yellow-500" },
  { key: "appointment_set", label: "Scheduled", short: "S", color: "bg-blue-500" },
  { key: "inspection_complete", label: "Inspected", short: "I", color: "bg-purple-500" },
  { key: "report_sent", label: "Report Sent", short: "R", color: "bg-teal-500" },
  { key: "closed_won", label: "Closed", short: "W", color: "bg-green-500" },
];

// Action items configuration
const actionItems = [
  { key: "unassigned", label: "Unassigned Leads", icon: Users, color: "text-orange-400" },
  { key: "follow_up", label: "Needs Follow-up", icon: Phone, color: "text-yellow-400" },
  { key: "pending_inspection", label: "Pending Inspection", icon: Calendar, color: "text-blue-400" },
  { key: "report_pending", label: "Reports Pending", icon: FileText, color: "text-purple-400" },
  { key: "watch_list", label: "Watch List", icon: Eye, color: "text-red-400" },
  { key: "overdue", label: "Overdue Tasks", icon: AlertCircle, color: "text-red-500" },
];

export default function CRMDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.crm.getStats.useQuery();
  const { data: recentLeads } = trpc.crm.getLeads.useQuery({ limit: 5 });
  const { data: appointments } = trpc.crm.getAppointments.useQuery({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Calculate pipeline counts from stats
  const getPipelineCount = (stage: string) => {
    if (!stats) return 0;
    // Map stage keys to stats properties
    const stageMap: Record<string, number> = {
      new_lead: stats.newLeads || 0,
      contacted: 0,
      appointment_set: stats.scheduledLeads || 0,
      inspection_complete: 0,
      report_sent: 0,
      closed_won: stats.completedLeads || 0,
    };
    return stageMap[stage] || 0;
  };

  if (statsLoading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="p-6 bg-slate-900 min-h-screen">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link href="/crm/leads?new=true">
              <Button className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Pipeline - AccuLynx Style */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white">Current Pipeline</CardTitle>
                  <span className="text-sm text-slate-300">
                    {stats?.totalLeads || 0} Active Jobs
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-4 py-4">
                  {pipelineStages.map((stage) => {
                    const count = getPipelineCount(stage.key);
                    return (
                      <Link key={stage.key} href={`/crm/leads?status=${stage.key}`}>
                        <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
                          <div
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${stage.color} flex items-center justify-center shadow-lg`}
                          >
                            <span className="text-white text-2xl md:text-3xl font-bold">
                              {stage.short}
                            </span>
                          </div>
                          <span className="mt-2 text-sm font-medium text-slate-300">
                            {stage.label}
                          </span>
                          <span className="text-xl font-bold text-white">{count}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-slate-700 mt-4">
                  <Button variant="outline" className="border-[#00d4aa] text-[#00d4aa] hover:bg-[#00d4aa]/10 bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Link href="/crm/calendar">
                    <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Inspection
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Action Items Grid - AccuLynx Style */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Action Items ({stats?.newLeads || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {actionItems.map((item) => {
                    const count = item.key === "unassigned" ? (stats?.newLeads || 0) : 
                                  item.key === "pending_inspection" ? (stats?.scheduledLeads || 0) : 0;
                    return (
                      <Link key={item.key} href={`/crm/leads?filter=${item.key}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-700 cursor-pointer transition-colors">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300 truncate">{item.label}</p>
                            <p className="text-lg font-bold text-white">{count}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#00d4aa]" />
                    Today
                  </CardTitle>
                  <Link href="/crm/calendar">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                      View Calendar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt: any) => (
                      <div
                        key={apt.id}
                        className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-l-[#00d4aa] bg-slate-700/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#00d4aa]/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#00d4aa]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{apt.title}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(apt.scheduledDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No appointments scheduled for today</p>
                    <Link href="/crm/calendar">
                      <Button variant="link" className="mt-2 text-[#00d4aa]">
                        Schedule an inspection
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed - Right Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">Activity Feed</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {recentLeads && recentLeads.length > 0 ? (
                  <div className="space-y-4">
                    {recentLeads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="flex gap-3 pb-4 border-b border-slate-700 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00b894] flex items-center justify-center flex-shrink-0">
                          <span className="text-black font-semibold text-sm">
                            {lead.name?.charAt(0) || lead.fullName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-[#00d4aa]">New Lead:</span>{" "}
                            <span className="font-medium text-white">{lead.name || lead.fullName}</span>
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {lead.address}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </p>
                          {lead.promoCode && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded">
                              Via: {lead.salesRepCode || lead.promoCode}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
