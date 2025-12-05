import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Search, Phone, Mail, MapPin, Clock, FileText, ChevronRight, Upload, File, Image, Trash2, Download, Calendar, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "new_lead", label: "New Lead", color: "bg-green-500/20 text-green-400" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500/20 text-blue-400" },
  { value: "appointment_set", label: "Appointment Set", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "inspection_scheduled", label: "Inspection Scheduled", color: "bg-orange-500/20 text-orange-400" },
  { value: "inspection_complete", label: "Inspection Complete", color: "bg-purple-500/20 text-purple-400" },
  { value: "report_sent", label: "Report Sent", color: "bg-indigo-500/20 text-indigo-400" },
  { value: "follow_up", label: "Follow Up", color: "bg-pink-500/20 text-pink-400" },
  { value: "closed_won", label: "Closed Won", color: "bg-primary/20 text-primary" },
  { value: "closed_lost", label: "Closed Lost", color: "bg-red-500/20 text-red-400" },
];

export default function CRMLeads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: leads, isLoading, refetch } = trpc.crm.getLeads.useQuery({});
  const { data: leadDetail, refetch: refetchLead } = trpc.crm.getLead.useQuery(
    { id: selectedLead! },
    { enabled: !!selectedLead }
  );
  const updateLead = trpc.crm.updateLead.useMutation({
    onSuccess: () => {
      toast.success("Lead updated successfully");
      refetch();
    },
  });
  const addNote = trpc.crm.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note added");
      refetchLead();
    },
  });
  const uploadDocument = trpc.crm.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      refetchLead();
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setUploading(false);
    },
  });
  const deleteDocument = trpc.crm.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      refetchLead();
    },
  });

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = search === "" || 
      lead.fullName.toLowerCase().includes(search.toLowerCase()) ||
      lead.address.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-500/20 text-gray-400";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLead) return;

    setUploading(true);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadDocument.mutate({
        leadId: selectedLead,
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
        category: "other",
      });
    };
    reader.readAsDataURL(file);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

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
            <Link href="/crm/leads" className="text-primary font-medium">Leads</Link>
            <Link href="/crm/pipeline" className="text-gray-400 hover:text-white transition">Pipeline</Link>
            <Link href="/crm/calendar" className="text-gray-400 hover:text-white transition flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Calendar
            </Link>
            <Link href="/crm/reports" className="text-gray-400 hover:text-white transition flex items-center gap-1">
              <BarChart3 className="w-4 h-4" /> Reports
            </Link>
            <Link href="/crm/team" className="text-gray-400 hover:text-white transition">Team</Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">All Leads</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-black/40 border-white/10 text-white w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-black/40 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Leads Table */}
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Property</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Source</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads?.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{lead.fullName}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-1 text-gray-300">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                          <div>
                            <p>{lead.address}</p>
                            <p className="text-sm text-gray-500">{lead.cityStateZip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status?.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-gray-300">{lead.promoCode || "Direct"}</p>
                          {lead.salesRepCode && (
                            <p className="text-xs text-primary">Rep: {lead.salesRepCode}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary"
                              onClick={() => setSelectedLead(lead.id)}
                            >
                              View <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#111] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl">{leadDetail?.fullName || lead.fullName}</DialogTitle>
                            </DialogHeader>
                            {leadDetail && (
                              <Tabs defaultValue="details" className="w-full">
                                <TabsList className="bg-black/40 border-white/10">
                                  <TabsTrigger value="details">Details</TabsTrigger>
                                  <TabsTrigger value="documents">Documents ({leadDetail.documents?.length || 0})</TabsTrigger>
                                  <TabsTrigger value="activity">Activity</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-6 mt-4">
                                  {/* Contact Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-400 mb-1">Email</p>
                                      <p className="text-white">{leadDetail.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-400 mb-1">Phone</p>
                                      <a href={`tel:${leadDetail.phone}`} className="text-primary hover:underline">{leadDetail.phone}</a>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-400 mb-1">Address</p>
                                      <p className="text-white">{leadDetail.address}, {leadDetail.cityStateZip}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-400 mb-1">Roof Age</p>
                                      <p className="text-white">{leadDetail.roofAge || "Not specified"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-400 mb-1">Payment</p>
                                      <p className="text-white">${(leadDetail.amountPaid / 100).toFixed(2)}</p>
                                    </div>
                                  </div>

                                  {/* Status Update */}
                                  <div>
                                    <p className="text-sm text-gray-400 mb-2">Update Status</p>
                                    <Select 
                                      value={leadDetail.status} 
                                      onValueChange={(value) => updateLead.mutate({ id: leadDetail.id, status: value })}
                                    >
                                      <SelectTrigger className="bg-black/40 border-white/10">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {STATUS_OPTIONS.map((status) => (
                                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Roof Concerns */}
                                  {leadDetail.roofConcerns && (
                                    <div>
                                      <p className="text-sm text-gray-400 mb-1">Roof Concerns</p>
                                      <p className="text-white bg-white/5 p-3 rounded">{leadDetail.roofConcerns}</p>
                                    </div>
                                  )}

                                  {/* Hands-on Inspection */}
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      leadDetail.handsOnInspection ? "bg-primary/20 text-primary" : "bg-gray-500/20 text-gray-400"
                                    }`}>
                                      {leadDetail.handsOnInspection ? "✓ Hands-On Inspection Requested" : "Drone Only"}
                                    </span>
                                  </div>
                                </TabsContent>

                                <TabsContent value="documents" className="mt-4">
                                  {/* Upload Button */}
                                  <div className="mb-4">
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleFileUpload}
                                      className="hidden"
                                      accept="image/*,.pdf,.doc,.docx"
                                    />
                                    <Button 
                                      onClick={() => fileInputRef.current?.click()}
                                      disabled={uploading}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      {uploading ? "Uploading..." : "Upload Document"}
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">
                                      Supported: Images, PDFs, Word documents
                                    </p>
                                  </div>

                                  {/* Documents List */}
                                  <div className="space-y-2">
                                    {leadDetail.documents?.map((doc: any) => (
                                      <div key={doc.id} className="flex items-center justify-between bg-white/5 p-3 rounded">
                                        <div className="flex items-center gap-3">
                                          {getFileIcon(doc.fileType)}
                                          <div>
                                            <p className="text-sm text-white">{doc.fileName}</p>
                                            <p className="text-xs text-gray-500">
                                              {new Date(doc.createdAt).toLocaleDateString()} • {doc.uploadedBy?.name || "System"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm">
                                              <Download className="w-4 h-4" />
                                            </Button>
                                          </a>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-400 hover:text-red-300"
                                            onClick={() => deleteDocument.mutate({ documentId: doc.id })}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                    {(!leadDetail.documents || leadDetail.documents.length === 0) && (
                                      <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No documents uploaded yet</p>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>

                                <TabsContent value="activity" className="mt-4">
                                  {/* Activity Log */}
                                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                                    {leadDetail.activities?.map((activity: any) => (
                                      <div key={activity.id} className="text-sm bg-white/5 p-3 rounded">
                                        <p className="text-gray-300">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(activity.createdAt).toLocaleString()}
                                          {activity.user && ` • ${activity.user.name || activity.user.email}`}
                                        </p>
                                      </div>
                                    ))}
                                    {(!leadDetail.activities || leadDetail.activities.length === 0) && (
                                      <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>
                                    )}
                                  </div>

                                  {/* Add Note */}
                                  <div>
                                    <p className="text-sm text-gray-400 mb-2">Add Note</p>
                                    <form onSubmit={(e) => {
                                      e.preventDefault();
                                      const form = e.target as HTMLFormElement;
                                      const note = (form.elements.namedItem("note") as HTMLTextAreaElement).value;
                                      if (note.trim()) {
                                        addNote.mutate({ leadId: leadDetail.id, note });
                                        form.reset();
                                      }
                                    }}>
                                      <Textarea name="note" placeholder="Add a note..." className="bg-black/40 border-white/10 mb-2" />
                                      <Button type="submit" size="sm" className="bg-primary">Add Note</Button>
                                    </form>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!filteredLeads || filteredLeads.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No leads found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
