import { Link } from "wouter";

type PipelineStatus = 
  | "Lead" 
  | "Appointment Set" 
  | "Prospect" 
  | "Approved" 
  | "Project Scheduled" 
  | "Completed" 
  | "Invoiced" 
  | "Closed Deal";

type ExceptionStatus = "Lien Legal" | "Closed Lost";

interface Stage {
  key: string;
  label: string;
  count: number;
  color: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
}

interface PipelineOverviewProps {
  stats?: {
    leadCount?: number;
    appointmentSetCount?: number;
    prospectCount?: number;
    approvedCount?: number;
    projectScheduledCount?: number;
    completedCount?: number;
    invoicedCount?: number;
    closedDealCount?: number;
    lienLegalCount?: number;
    closedLostCount?: number;
  };
}

export function PipelineOverview({ stats }: PipelineOverviewProps) {
  // Main pipeline stages (left to right flow)
  const mainStages: Stage[] = [
    {
      key: "lead",
      label: "Lead",
      count: stats?.leadCount || 0,
      color: "bg-slate-600/30",
      textColor: "text-slate-300",
      borderColor: "border-slate-500",
      hoverColor: "hover:bg-slate-600/50",
    },
    {
      key: "appointment_set",
      label: "Appointment Set",
      count: stats?.appointmentSetCount || 0,
      color: "bg-cyan-500/20",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-400/50",
      hoverColor: "hover:bg-cyan-500/30",
    },
    {
      key: "prospect",
      label: "Prospect",
      count: stats?.prospectCount || 0,
      color: "bg-teal-500/20",
      textColor: "text-teal-400",
      borderColor: "border-teal-400/50",
      hoverColor: "hover:bg-teal-500/30",
    },
    {
      key: "approved",
      label: "Approved",
      count: stats?.approvedCount || 0,
      color: "bg-emerald-500/20",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-400/50",
      hoverColor: "hover:bg-emerald-500/30",
    },
    {
      key: "project_scheduled",
      label: "Project Scheduled",
      count: stats?.projectScheduledCount || 0,
      color: "bg-green-500/20",
      textColor: "text-green-400",
      borderColor: "border-green-400/50",
      hoverColor: "hover:bg-green-500/30",
    },
    {
      key: "completed",
      label: "Completed",
      count: stats?.completedCount || 0,
      color: "bg-green-400/20",
      textColor: "text-green-300",
      borderColor: "border-green-300/50",
      hoverColor: "hover:bg-green-400/30",
    },
    {
      key: "invoiced",
      label: "Invoiced",
      count: stats?.invoicedCount || 0,
      color: "bg-lime-500/20",
      textColor: "text-lime-400",
      borderColor: "border-lime-400/50",
      hoverColor: "hover:bg-lime-500/30",
    },
    {
      key: "closed_deal",
      label: "💰 Closed Deal",
      count: stats?.closedDealCount || 0,
      color: "bg-gradient-to-r from-yellow-500/20 to-green-500/20",
      textColor: "text-yellow-300",
      borderColor: "border-yellow-400/50",
      hoverColor: "hover:from-yellow-500/30 hover:to-green-500/30",
    },
  ];

  // Exception stages (below main flow)
  const exceptionStages: Stage[] = [
    {
      key: "lien_legal",
      label: "Lien Legal",
      count: stats?.lienLegalCount || 0,
      color: "bg-red-600/20",
      textColor: "text-red-400",
      borderColor: "border-red-500/50",
      hoverColor: "hover:bg-red-600/30",
    },
    {
      key: "closed_lost",
      label: "Closed Lost",
      count: stats?.closedLostCount || 0,
      color: "bg-slate-700/30",
      textColor: "text-slate-400",
      borderColor: "border-slate-600",
      hoverColor: "hover:bg-slate-700/50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Pipeline Flow */}
      <div className="flex flex-wrap gap-3 items-center">
        {mainStages.map((stage, index) => (
          <div key={stage.key} className="flex items-center gap-3">
            <Link href={`/crm/leads?status=${stage.key}`}>
              <div
                className={`
                  px-4 py-3 rounded-xl border-2 backdrop-blur-sm
                  ${stage.color} ${stage.borderColor} ${stage.hoverColor}
                  cursor-pointer transition-all duration-200
                  transform hover:scale-105 hover:shadow-lg
                  flex items-center gap-3 min-w-[140px]
                `}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${stage.textColor}`}>
                    {stage.label}
                  </span>
                  <span className={`text-2xl font-bold ${stage.textColor}`}>
                    {stage.count}
                  </span>
                </div>
              </div>
            </Link>
            {index < mainStages.length - 1 && (
              <div className="hidden md:block">
                <svg width="20" height="20" viewBox="0 0 20 20" className="text-slate-600">
                  <path
                    d="M7 4 L13 10 L7 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exception States */}
      {(exceptionStages[0].count > 0 || exceptionStages[1].count > 0) && (
        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Exception States
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {exceptionStages.map((stage) => (
              <Link key={stage.key} href={`/crm/leads?status=${stage.key}`}>
                <div
                  className={`
                    px-4 py-3 rounded-xl border-2 backdrop-blur-sm
                    ${stage.color} ${stage.borderColor} ${stage.hoverColor}
                    cursor-pointer transition-all duration-200
                    transform hover:scale-105 hover:shadow-lg
                    flex items-center gap-3 min-w-[140px]
                  `}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${stage.textColor}`}>
                      {stage.label}
                    </span>
                    <span className={`text-2xl font-bold ${stage.textColor}`}>
                      {stage.count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
