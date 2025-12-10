import { useState, useEffect } from "react";
import { ProposalCalculator } from "../ProposalCalculator";
import { ProductSelector } from "../proposal/ProductSelector";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Job } from "@/types";

interface JobProposalTabProps {
  jobId: number;
  job: Job;
  userRole: string;
  onUpdate: () => void;
}

export function JobProposalTab({ jobId, job, userRole, onUpdate }: JobProposalTabProps) {
  const [selectedShingleId, setSelectedShingleId] = useState<number | null>(null);
  
  // Initialize from job data
  useEffect(() => {
    if (job.selectedProductId) {
      setSelectedShingleId(job.selectedProductId);
    }
  }, [job.selectedProductId]);
  
  // Mutation to save product selection
  const updateProduct = trpc.crm.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Product saved");
      onUpdate(); // Refresh job data
    },
    onError: (error) => {
      toast.error(`Failed to save product: ${error.message}`);
    }
  });
  
  const handleProductChange = (productId: number) => {
    setSelectedShingleId(productId);
    // Auto-save to database
    updateProduct.mutate({
      id: jobId,
      selectedProductId: productId
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Shingle Product</h3>
        <ProductSelector 
          selectedProductId={selectedShingleId} 
          onChange={handleProductChange} 
        />
      </div>

      {/* Proposal Calculator */}
      <ProposalCalculator
        jobId={jobId}
        roofArea={job.solarApiData?.totalArea}
        manualAreaSqFt={job.manualAreaSqFt || undefined}
        solarCoverage={job.solarApiData?.solarCoverage || false}
        currentPricePerSq={job.pricePerSq}
        currentTotalPrice={job.totalPrice}
        currentCounterPrice={job.counterPrice}
        currentPriceStatus={job.priceStatus || undefined}
        userRole={userRole}
        onUpdate={onUpdate}
      />
    </div>
  );
}
