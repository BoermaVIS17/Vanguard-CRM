import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, FileText, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";

export default function CRMDashboard() {
  const { data: stats, isLoading } = trpc.crm.getStats.useQuery();
  const { data: recentLeads } = trpc.crm.getLeads.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/logo.jpg" alt="NextDoor" className="h-10 w-10 rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-white">NextDoor CRM</h1>
              <p className="text-xs text-gray-400">Storm Documentation Management</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/crm" className="text-primary font-medium">Dashboard</Link>
            <Link href="/crm/leads" className="text-gray-400 hover:text-white transition">Leads</Link>
            <Link href="/crm/pipeline" className="text-gray-400 hover:text-white transition">Pipeline</Link>
            <Link href="/crm/team" className="text-gray-400 hover:text-white transition">Team</Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Leads</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.totalLeads || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All time submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">New Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.newLeads || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting contact</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.scheduledLeads || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Inspections pending</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${stats?.totalRevenue?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-gray-500 mt-1">Total collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Leads</CardTitle>
              <Link href="/crm/leads" className="text-primary text-sm hover:underline">View All →</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads?.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{lead.fullName}</p>
                      <p className="text-sm text-gray-400">{lead.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lead.status === "new_lead" ? "bg-green-500/20 text-green-400" :
                      lead.status === "contacted" ? "bg-blue-500/20 text-blue-400" :
                      lead.status === "closed_won" ? "bg-primary/20 text-primary" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {lead.status?.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentLeads || recentLeads.length === 0) && (
                <p className="text-center text-gray-500 py-8">No leads yet. They'll appear here when customers submit requests.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
