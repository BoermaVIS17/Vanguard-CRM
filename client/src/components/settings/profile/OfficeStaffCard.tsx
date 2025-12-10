import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, Save } from "lucide-react";
import { toast } from "sonner";

export default function OfficeStaffCard() {
  const [extension, setExtension] = useState("");
  const [department, setDepartment] = useState("general");

  const departments = [
    { value: "general", label: "General" },
    { value: "permitting", label: "Permitting" },
    { value: "billing", label: "Billing" },
    { value: "scheduling", label: "Scheduling" },
    { value: "customer_service", label: "Customer Service" },
    { value: "dispatch", label: "Dispatch" },
  ];

  const handleSave = () => {
    // TODO: Save office staff settings
    toast.success("Settings saved successfully!");
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#00d4aa]" />
          Office Staff Settings
        </CardTitle>
        <CardDescription className="text-slate-400">
          Configure your office role and contact info
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Office Extension */}
        <div className="space-y-2">
          <Label htmlFor="extension" className="text-slate-300 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Office Extension
          </Label>
          <Input
            id="extension"
            value={extension}
            onChange={(e) => setExtension(e.target.value)}
            placeholder="e.g., 101"
            className="bg-slate-800 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-500">
            Internal extension number for office phone system
          </p>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label className="text-slate-300">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {departments.map((dept) => (
                <SelectItem
                  key={dept.value}
                  value={dept.value}
                  className="text-white hover:bg-slate-700"
                >
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            Helps with auto-tagging in notes and routing inquiries
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400">
            <strong className="text-slate-300">Note:</strong> Your department setting helps the system 
            automatically route customer inquiries and tag you in relevant notes. For example, permitting 
            staff will be notified of permit-related updates.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            className="bg-[#00d4aa] hover:bg-[#00b894] text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
