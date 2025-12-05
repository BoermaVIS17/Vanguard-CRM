import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { User, Mail, Shield, Edit2, UserCheck, UserX } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner", description: "Full access to all features" },
  { value: "admin", label: "Admin", description: "Full access except billing" },
  { value: "office", label: "Office Staff", description: "Lead management & reports" },
  { value: "sales_rep", label: "Sales Rep", description: "View & update assigned leads" },
  { value: "project_manager", label: "Project Manager", description: "Production & scheduling" },
  { value: "user", label: "User", description: "Basic access" },
];

export default function CRMTeam() {
  const { data: team, isLoading, refetch } = trpc.crm.getTeam.useQuery();
  const { data: currentUser } = trpc.auth.me.useQuery();
  const updateMember = trpc.crm.updateTeamMember.useMutation({
    onSuccess: () => {
      toast.success("Team member updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [editingMember, setEditingMember] = useState<any>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-primary/20 text-primary";
      case "admin": return "bg-purple-500/20 text-purple-400";
      case "office": return "bg-blue-500/20 text-blue-400";
      case "sales_rep": return "bg-green-500/20 text-green-400";
      case "project_manager": return "bg-orange-500/20 text-orange-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const canEditRoles = currentUser?.role === "owner" || currentUser?.role === "admin";

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
            <Link href="/crm" className="text-gray-400 hover:text-white transition">Dashboard</Link>
            <Link href="/crm/leads" className="text-gray-400 hover:text-white transition">Leads</Link>
            <Link href="/crm/pipeline" className="text-gray-400 hover:text-white transition">Pipeline</Link>
            <Link href="/crm/team" className="text-primary font-medium">Team</Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Team Management</h2>
            <p className="text-gray-400 mt-1">Manage team members and their roles</p>
          </div>
          <div className="text-sm text-gray-400">
            <Shield className="w-4 h-4 inline mr-1" />
            {team?.length || 0} team members
          </div>
        </div>

        {/* Role Legend */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ROLE_OPTIONS.map((role) => (
                <div key={role.value} className="text-center">
                  <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getRoleColor(role.value)}`}>
                    {role.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team?.map((member: any) => (
            <Card key={member.id} className="bg-black/40 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  {member.isActive !== false ? (
                    <UserCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <UserX className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
                    {ROLE_OPTIONS.find(r => r.value === member.role)?.label || member.role}
                  </span>
                  
                  {canEditRoles && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingMember(member)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#111] border-white/10 text-white">
                        <DialogHeader>
                          <DialogTitle>Edit Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Name</p>
                            <p className="text-white">{member.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Email</p>
                            <p className="text-white">{member.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Role</p>
                            <Select 
                              defaultValue={member.role}
                              onValueChange={(value) => {
                                updateMember.mutate({ userId: member.id, role: value as any });
                              }}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Rep Code (for sales attribution)</p>
                            <Input 
                              defaultValue={member.repCode || ""}
                              placeholder="e.g., MJ, ST"
                              className="bg-black/40 border-white/10"
                              onChange={(e) => {
                                // Debounce this in production
                              }}
                              onBlur={(e) => {
                                if (e.target.value !== member.repCode) {
                                  updateMember.mutate({ userId: member.id, role: member.role, repCode: e.target.value });
                                }
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for promo code tracking (e.g., MJS26)</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {member.repCode && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      Rep Code: <span className="text-primary font-mono">{member.repCode}S26</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {(!team || team.length === 0) && (
          <Card className="bg-black/40 border-white/10">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">No team members yet</p>
              <p className="text-sm text-gray-500 mt-1">Team members will appear here when they log in</p>
            </CardContent>
          </Card>
        )}

        {/* How to Add Team Members */}
        <Card className="bg-black/40 border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-white">How to Add Team Members</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400">
            <ol className="list-decimal list-inside space-y-2">
              <li>Share the CRM login URL with your team member</li>
              <li>They will log in using their email (OAuth authentication)</li>
              <li>Once they log in, they'll appear in this list as a "User"</li>
              <li>You can then update their role to match their position</li>
              <li>For sales reps, assign a Rep Code for promo tracking</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
