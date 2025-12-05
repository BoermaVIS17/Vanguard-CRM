import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, FileText, BarChart3, Users, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "new_lead", label: "New Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "appointment_set", label: "Appointment Set" },
  { value: "inspection_scheduled", label: "Inspection Scheduled" },
  { value: "inspection_complete", label: "Inspection Complete" },
  { value: "report_sent", label: "Report Sent" },
  { value: "follow_up", label: "Follow Up" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("");

  const { data: stats, isLoading: statsLoading } = trpc.crm.getReportStats.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: leads, isLoading: leadsLoading } = trpc.crm.getLeadsForExport.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    salesRep: repFilter || undefined,
  });

  const { data: team } = trpc.crm.getTeam.useQuery();

  // Export to CSV
  const exportToCSV = () => {
    if (!leads || leads.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "ID", "Name", "Email", "Phone", "Address", "City/State/ZIP",
      "Roof Age", "Status", "Priority", "Promo Code", "Sales Rep",
      "Amount Paid", "Hands-On", "Created Date"
    ];

    const rows = leads.map(lead => [
      lead.id,
      lead.fullName,
      lead.email,
      lead.phone,
      lead.address,
      lead.cityStateZip,
      lead.roofAge || "",
      lead.status,
      lead.priority,
      lead.promoCode || "",
      lead.salesRepCode || "",
      (lead.amountPaid / 100).toFixed(2),
      lead.handsOnInspection ? "Yes" : "No",
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nextdoor_leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  // Export to PDF (simple HTML-based)
  const exportToPDF = () => {
    if (!leads || leads.length === 0) {
      toast.error("No data to export");
      return;
    }

    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : "All Time";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NextDoor Exteriors - Lead Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #00CED1; }
          .stats { display: flex; gap: 20px; margin-bottom: 20px; }
          .stat-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #00CED1; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #00CED1; color: white; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>NextDoor Exterior Solutions</h1>
        <h2>Lead Report - ${dateRange}</h2>
        
        <div class="stats">
          <div class="stat-box">
            <div>Total Leads</div>
            <div class="stat-value">${stats?.totalLeads || 0}</div>
          </div>
          <div class="stat-box">
            <div>Revenue</div>
            <div class="stat-value">$${stats?.totalRevenue?.toFixed(2) || "0.00"}</div>
          </div>
          <div class="stat-box">
            <div>Conversion Rate</div>
            <div class="stat-value">${stats?.conversionRate || "0%"}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Status</th>
              <th>Sales Rep</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(lead => `
              <tr>
                <td>${lead.fullName}</td>
                <td>${lead.phone}</td>
                <td>${lead.address}, ${lead.cityStateZip}</td>
                <td>${lead.status.replace("_", " ")}</td>
                <td>${lead.salesRepCode || "-"}</td>
                <td>$${(lead.amountPaid / 100).toFixed(2)}</td>
                <td>${new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          Generated on ${new Date().toLocaleString()} | NextDoor Exterior Solutions | Lic# CCC-1334600
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }

    toast.success("PDF report generated");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/crm">
                <Button variant="ghost" size="sm">← Back to Dashboard</Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">Reports & Analytics</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sales Rep</Label>
                <Select value={repFilter} onValueChange={setRepFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Reps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Reps</SelectItem>
                    {team?.filter(m => m.role === "sales_rep").map(rep => (
                      <SelectItem key={rep.id} value={rep.repCode || rep.id.toString()}>
                        {rep.name || rep.email} {rep.repCode && `(${rep.repCode})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-3xl font-bold">{stats?.totalLeads || 0}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-500">${stats?.totalRevenue?.toFixed(2) || "0.00"}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold text-primary">{stats?.conversionRate || "0%"}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Reps</p>
                  <p className="text-3xl font-bold">{team?.filter(m => m.role === "sales_rep" && m.isActive).length || 0}</p>
                </div>
                <Users className="w-10 h-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads by Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Leads by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.byStatus?.map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{item.status?.replace("_", " ") || "Unknown"}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min((item.count / (stats?.totalLeads || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads by Sales Rep</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.byRep?.map((item: any) => (
                  <div key={item.salesRepCode || "direct"} className="flex items-center justify-between">
                    <span className="text-sm">{item.salesRepCode || "Direct / No Code"}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min((item.count / (stats?.totalLeads || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Data ({leads?.length || 0} records)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rep</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads?.slice(0, 50).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.fullName}</TableCell>
                      <TableCell>
                        <div className="text-sm">{lead.email}</div>
                        <div className="text-xs text-muted-foreground">{lead.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{lead.address}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lead.status === "closed_won" ? "bg-green-500/20 text-green-400" :
                          lead.status === "closed_lost" ? "bg-red-500/20 text-red-400" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {lead.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>{lead.salesRepCode || "-"}</TableCell>
                      <TableCell>${(lead.amountPaid / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {leads && leads.length > 50 && (
                <div className="text-center text-muted-foreground py-4">
                  Showing 50 of {leads.length} records. Export to see all.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
