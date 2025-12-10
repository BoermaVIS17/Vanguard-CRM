import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Clock } from "lucide-react";

export default function SalesRepCard() {
  const [workingHoursStart, setWorkingHoursStart] = useState("08:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");
  const [timezone, setTimezone] = useState("America/New_York");

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  ];

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#00d4aa]" />
          Sales Rep Settings
        </CardTitle>
        <CardDescription className="text-slate-400">
          Configure your availability and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Working Hours */}
        <div className="space-y-3">
          <Label className="text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Working Hours
          </Label>
          <p className="text-xs text-slate-500">
            Round Robin auto-assigner won't send you leads outside these hours
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-xs text-slate-400">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-xs text-slate-400">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label className="text-slate-300">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {timezones.map((tz) => (
                <SelectItem
                  key={tz.value}
                  value={tz.value}
                  className="text-white hover:bg-slate-700"
                >
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300 font-medium">Current Status</p>
              <p className="text-xs text-slate-500">Available for new leads</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-green-400">Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
