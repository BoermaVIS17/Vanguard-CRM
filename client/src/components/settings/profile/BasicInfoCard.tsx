import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BasicInfoCardProps {
  user: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  onUpdate: () => void;
}

export default function BasicInfoCard({ user, onUpdate }: BasicInfoCardProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(""); // TODO: Add bio field to schema

  const updateUser = trpc.users.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    updateUser.mutate({
      targetUserId: user.id,
      data: {
        name: name.trim(),
        email: email.trim() || "",
        phone: phone.trim() || "",
      },
    });
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#00d4aa]" />
          Basic Information
        </CardTitle>
        <CardDescription className="text-slate-400">
          Update your personal details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="bg-slate-800 border-slate-600 text-white pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="bg-slate-800 border-slate-600 text-white pl-10"
            />
          </div>
          <p className="text-xs text-slate-500">For SMS notifications via Twilio</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-slate-300">Bio / About</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A brief introduction that appears in proposal PDFs..."
              className="bg-slate-800 border-slate-600 text-white pl-10 min-h-[100px]"
            />
          </div>
          <p className="text-xs text-slate-500">Appears in the "Meet Your Rep" section of proposals</p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={updateUser.isPending}
            className="bg-[#00d4aa] hover:bg-[#00b894] text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateUser.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
