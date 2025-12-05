import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { User, Phone, MapPin, GripVertical } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const PIPELINE_STAGES = [
  { key: "new_lead", label: "New Leads", color: "border-green-500" },
  { key: "contacted", label: "Contacted", color: "border-blue-500" },
  { key: "appointment_set", label: "Appointment Set", color: "border-yellow-500" },
  { key: "inspection_scheduled", label: "Scheduled", color: "border-orange-500" },
  { key: "inspection_complete", label: "Inspected", color: "border-purple-500" },
  { key: "report_sent", label: "Report Sent", color: "border-indigo-500" },
  { key: "closed_won", label: "Closed Won", color: "border-primary" },
];

export default function CRMPipeline() {
  const { data: pipeline, isLoading, refetch } = trpc.crm.getPipeline.useQuery();
  const updateLead = trpc.crm.updateLead.useMutation({
    onSuccess: () => {
      toast.success("Lead moved");
      refetch();
    },
  });

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData("leadId", leadId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData("leadId"));
    if (leadId) {
      updateLead.mutate({ id: leadId, status: newStatus });
    }
  };

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
            <Link href="/crm/pipeline" className="text-primary font-medium">Pipeline</Link>
            <Link href="/crm/team" className="text-gray-400 hover:text-white transition">Team</Link>
          </nav>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Sales Pipeline</h2>
        <p className="text-gray-400 mb-6">Drag and drop leads between stages to update their status.</p>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const leads = pipeline?.[stage.key as keyof typeof pipeline] || [];
            return (
              <div
                key={stage.key}
                className="flex-shrink-0 w-72"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                <Card className={`bg-black/40 border-t-4 ${stage.color} border-x-white/10 border-b-white/10`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-white">{stage.label}</CardTitle>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">
                        {leads.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[400px]">
                    {leads.map((lead: any) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing transition border border-white/5"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <p className="font-medium text-white text-sm">{lead.fullName}</p>
                          </div>
                          <GripVertical className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{lead.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                        {lead.promoCode && (
                          <div className="mt-2">
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              {lead.promoCode}
                            </span>
                          </div>
                        )}
                        {lead.handsOnInspection && (
                          <div className="mt-1">
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                              🔧 Hands-On
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No leads in this stage
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
