import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TeamLeadCardProps {
  userId: number;
}

export default function TeamLeadCard({ userId }: TeamLeadCardProps) {
  const { data: team } = trpc.users.getTeam.useQuery();

  // Filter team members assigned to this team lead
  const myTeamMembers = team?.filter(member => member.teamLeadId === userId) || [];

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00D4FF]" />
          Team Lead Dashboard
        </CardTitle>
        <CardDescription className="text-slate-400">
          Your team overview and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">My Team</h4>
            <span className="text-xs text-slate-500">{myTeamMembers.length} members</span>
          </div>

          {myTeamMembers.length > 0 ? (
            <div className="space-y-2">
              {myTeamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-300">
                        {member.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.roleDisplayName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {member.repCode && (
                      <p className="text-xs font-mono text-slate-400">{member.repCode}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No team members assigned yet</p>
            </div>
          )}
        </div>

        {/* Override Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
            <div>
              <p className="text-sm text-slate-300 font-medium">Override Commission</p>
              <p className="text-xs text-slate-500">Your override percentage (Read-Only)</p>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#00D4FF]">2.5%</span>
            <span className="text-xs text-slate-500">on team sales</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
