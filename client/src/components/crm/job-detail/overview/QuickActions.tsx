import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare } from "lucide-react";
import type { Job } from "@/types";

interface QuickActionsProps {
  job: Job;
}

export function QuickActions({ job }: QuickActionsProps) {
  return (
    <div className="flex gap-3">
      {job.phone && (
        <Button
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          onClick={() => window.location.href = `tel:${job.phone}`}
        >
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
      )}
      {job.email && (
        <Button
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          onClick={() => window.location.href = `mailto:${job.email}`}
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
      )}
      <Button
        variant="outline"
        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        onClick={() => {
          // Scroll to messages tab
          const messagesTab = document.querySelector('[value="messages"]');
          if (messagesTab) {
            (messagesTab as HTMLElement).click();
          }
        }}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Message
      </Button>
    </div>
  );
}
