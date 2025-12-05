import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Phone, User, Wrench } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [assignedRep, setAssignedRep] = useState<string>("");

  // Get first and last day of current month view (including overflow days)
  const { startDate, endDate } = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Extend to include full weeks
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());
    
    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - end.getDay()));
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [currentDate]);

  const { data: appointments, refetch } = trpc.crm.getAppointments.useQuery({
    startDate,
    endDate,
  });

  const { data: team } = trpc.crm.getTeam.useQuery();
  const { data: leads } = trpc.crm.getLeads.useQuery({ status: "new_lead" });

  const scheduleMutation = trpc.crm.scheduleAppointment.useMutation({
    onSuccess: () => {
      toast.success("Appointment scheduled successfully");
      setShowScheduleDialog(false);
      setSelectedLead(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  }, [startDate, endDate]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, typeof appointments> = {};
    appointments?.forEach(apt => {
      if (apt.scheduledDate) {
        const dateKey = new Date(apt.scheduledDate).toDateString();
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey]!.push(apt);
      }
    });
    return grouped;
  }, [appointments]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSchedule = () => {
    if (!selectedLead || !selectedDate) return;
    
    const scheduledDateTime = new Date(selectedDate);
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    scheduleMutation.mutate({
      leadId: selectedLead,
      scheduledDate: scheduledDateTime.toISOString(),
      assignedTo: assignedRep ? parseInt(assignedRep) : undefined,
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
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
              <h1 className="text-2xl font-bold text-primary">Scheduling Calendar</h1>
            </div>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule Inspection
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Schedule New Inspection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Select Lead</Label>
                    <Select value={selectedLead?.toString() || ""} onValueChange={(v) => setSelectedLead(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a lead..." />
                      </SelectTrigger>
                      <SelectContent>
                        {leads?.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id.toString()}>
                            {lead.fullName} - {lead.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input 
                      type="date" 
                      value={selectedDate?.toISOString().split("T")[0] || ""} 
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input 
                      type="time" 
                      value={scheduleTime} 
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Assign To</Label>
                    <Select value={assignedRep} onValueChange={setAssignedRep}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {team?.filter(m => m.role === "sales_rep" || m.role === "project_manager").map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name || member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full bg-primary" 
                    onClick={handleSchedule}
                    disabled={!selectedLead || !selectedDate || scheduleMutation.isPending}
                  >
                    {scheduleMutation.isPending ? "Scheduling..." : "Schedule Inspection"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Calendar Navigation */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-xl">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                const dateKey = date.toDateString();
                const dayAppointments = appointmentsByDate[dateKey] || [];
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-1 border rounded-md ${
                      isCurrentMonthDay ? "bg-card" : "bg-muted/30"
                    } ${isTodayDate ? "border-primary border-2" : "border-border"}`}
                    onClick={() => {
                      setSelectedDate(date);
                      if (dayAppointments.length === 0) {
                        setShowScheduleDialog(true);
                      }
                    }}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonthDay ? "text-foreground" : "text-muted-foreground"
                    } ${isTodayDate ? "text-primary" : ""}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <Link key={apt.id} href={`/crm/leads?id=${apt.id}`}>
                          <div className={`text-xs p-1 rounded truncate cursor-pointer ${
                            apt.handsOnInspection 
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                              : "bg-primary/20 text-primary border border-primary/30"
                          }`}>
                            <span className="font-medium">
                              {apt.scheduledDate && new Date(apt.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {" "}{apt.fullName.split(" ")[0]}
                          </div>
                        </Link>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsByDate[new Date().toDateString()]?.length ? (
              <div className="space-y-3">
                {appointmentsByDate[new Date().toDateString()]?.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold text-primary">
                        {apt.scheduledDate && new Date(apt.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {apt.fullName}
                          {apt.handsOnInspection && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                              <Wrench className="w-3 h-3 inline mr-1" />
                              Hands-On
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {apt.address}, {apt.cityStateZip}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {apt.phone}
                        </div>
                      </div>
                    </div>
                    <Link href={`/crm/leads?id=${apt.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No appointments scheduled for today
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
