import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3 } from "lucide-react";
import { RoofingReportView } from "@/components/RoofingReportView";
import { GoogleMapsLoader } from "@/components/GoogleMapsLoader";
import type { Job } from "@/types";

interface JobProductionTabProps {
  job: Job;
  jobId: number;
  onGenerateReport: () => void;
  isGenerating: boolean;
}

export function JobProductionTab({ job, jobId, onGenerateReport, isGenerating }: JobProductionTabProps) {
  if (job.solarApiData) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            onClick={() => {
              if (confirm("This will re-fetch the Solar API data and may incur API charges. Continue?")) {
                onGenerateReport();
              }
            }}
            disabled={isGenerating}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-[#00d4aa] border-t-transparent rounded-full mr-2" />
                Regenerating...
              </>
            ) : (
              <>
                <Grid3X3 className="w-4 h-4 mr-2" />
                Update Report
              </>
            )}
          </Button>
        </div>
        
        <GoogleMapsLoader>
          <RoofingReportView
            solarApiData={job.solarApiData}
            jobData={{
              fullName: job.fullName,
              address: job.address,
              cityStateZip: job.cityStateZip,
            }}
            isGoogleMapsLoaded={true}
          />
        </GoogleMapsLoader>
      </div>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="py-12">
        <div className="text-center max-w-md mx-auto">
          <Grid3X3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Production Report Not Generated</h3>
          <p className="text-slate-400 mb-4">
            Generate a professional roof measurement report using Google Solar API.
          </p>
          
          {job.latitude && job.longitude ? (
            <>
              <p className="text-sm text-slate-500 mb-6">
                Coordinates: {job.latitude.toFixed(6)}, {job.longitude.toFixed(6)}
              </p>
              <Button
                onClick={onGenerateReport}
                disabled={isGenerating}
                className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2" />
                    Analyzing Roof...
                  </>
                ) : (
                  <>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-500 mt-3">
                Note: This will make a Google Solar API request
              </p>
            </>
          ) : (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-400">
                ⚠️ This job doesn't have valid coordinates. Please update the address with a valid location to generate a report.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
