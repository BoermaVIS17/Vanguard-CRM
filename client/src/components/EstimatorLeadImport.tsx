import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Download, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function EstimatorLeadImport() {
  const [estimatorUrl, setEstimatorUrl] = useState("");
  const [sessionCookie, setSessionCookie] = useState("");
  const [importResults, setImportResults] = useState<{
    total: number;
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const importLeads = trpc.crm.importEstimatorLeads.useMutation({
    onSuccess: (data) => {
      setImportResults(data);
      if (data.imported > 0) {
        toast.success(`Successfully imported ${data.imported} leads!`);
      }
      if (data.skipped > 0) {
        toast.info(`Skipped ${data.skipped} duplicate leads`);
      }
      if (data.errors.length > 0) {
        toast.error(`${data.errors.length} leads failed to import`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setImportResults(null);
    },
  });

  const handleImport = () => {
    if (!estimatorUrl) {
      toast.error("Please enter the estimator URL");
      return;
    }

    setImportResults(null);
    importLeads.mutate({
      estimatorUrl,
      sessionCookie: sessionCookie || undefined,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-[#00d4aa]" />
          Import Leads from Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estimator URL
          </label>
          <Input
            type="url"
            placeholder="https://your-domain.manus.space"
            value={estimatorUrl}
            onChange={(e) => setEstimatorUrl(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-500 mt-1">
            Enter the base URL of your NextDoor Exterior Solutions estimator
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Session Cookie (Optional)
          </label>
          <Input
            type="text"
            placeholder="manus_session=..."
            value={sessionCookie}
            onChange={(e) => setSessionCookie(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <div className="mt-2 space-y-1">
            <p className="text-xs text-slate-500">
              Required if the estimator requires authentication
            </p>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-2">
              <p className="text-xs text-yellow-400">
                ⚠️ <strong>Warning:</strong> Session cookies expire (usually after 7-30 days). 
                You'll need to manually update this cookie when it expires. 
                Consider asking your estimator provider for a permanent API key instead.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleImport}
          disabled={importLeads.isPending}
          className="w-full bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold"
        >
          {importLeads.isPending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2" />
              Importing Leads...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Import Leads
            </>
          )}
        </Button>

        {importResults && (
          <div className="mt-6 space-y-3">
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-white font-semibold mb-3">Import Results</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded">
                  <span className="text-slate-300">Total Leads Found</span>
                  <span className="text-white font-semibold">{importResults.total}</span>
                </div>

                {importResults.imported > 0 && (
                  <div className="flex items-center justify-between bg-green-900/20 border border-green-700/50 p-3 rounded">
                    <span className="text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Successfully Imported
                    </span>
                    <span className="text-green-400 font-semibold">{importResults.imported}</span>
                  </div>
                )}

                {importResults.skipped > 0 && (
                  <div className="flex items-center justify-between bg-yellow-900/20 border border-yellow-700/50 p-3 rounded">
                    <span className="text-yellow-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Skipped (Duplicates)
                    </span>
                    <span className="text-yellow-400 font-semibold">{importResults.skipped}</span>
                  </div>
                )}

                {importResults.errors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700/50 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-400 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Failed to Import
                      </span>
                      <span className="text-red-400 font-semibold">{importResults.errors.length}</span>
                    </div>
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-300 bg-red-900/30 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
