/**
 * NextDoor Exterior Solutions Roofing Estimator API Client
 * Integrates lead data from the estimator into the CRM
 */

export interface EstimatorLead {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  notes: string;
  createdAt: string;
  estimate: {
    totalRoofArea: number;
    adjustedArea: number;
    averagePitch: number;
    goodPrice: number;
    betterPrice: number;
    bestPrice: number;
    hasPitchSurcharge: boolean;
    eaveLength: number;
    ridgeValleyLength: number;
  };
}

export interface EstimatorApiResponse {
  result: {
    data: EstimatorLead[];
  };
}

/**
 * Fetch leads from the estimator API
 * @param baseUrl - The estimator API base URL (e.g., https://your-domain.manus.space)
 * @param sessionCookie - Session cookie for authentication (OPTIONAL)
 * 
 * WARNING: Session cookies expire (typically 7-30 days). This means:
 * - You'll need to manually update the cookie when it expires
 * - Imports will fail silently when the cookie is invalid
 * - Consider requesting a permanent API key from your estimator provider
 * 
 * @returns Array of estimator leads
 */
export async function fetchEstimatorLeads(
  baseUrl: string,
  sessionCookie?: string
): Promise<EstimatorLead[]> {
  try {
    const url = `${baseUrl}/api/trpc/admin.getLeadsWithEstimates`;
    
    console.log(`[EstimatorAPI] Fetching leads from: ${url}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add session cookie if provided
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EstimatorAPI] Request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Estimator API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: EstimatorApiResponse = await response.json();
    console.log(`[EstimatorAPI] Successfully fetched ${data.result.data.length} leads`);
    
    return data.result.data;
  } catch (error) {
    console.error('[EstimatorAPI] Error fetching leads:', error);
    throw error;
  }
}

/**
 * Parse address from estimator format to CRM format
 * @param address - Full address string (e.g., "123 Main St, Tampa, FL 33601")
 * @returns Object with street address and city/state/zip
 */
export function parseEstimatorAddress(address: string): {
  streetAddress: string;
  cityStateZip: string;
} {
  // Split by comma
  const parts = address.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    const streetAddress = parts[0];
    const cityStateZip = parts.slice(1).join(', ');
    return { streetAddress, cityStateZip };
  }
  
  // Fallback if format is unexpected
  return {
    streetAddress: address,
    cityStateZip: '',
  };
}

/**
 * Format estimate data for storage in CRM
 * @param estimate - Estimate data from estimator API
 * @returns Formatted estimate object for database
 */
export function formatEstimateData(estimate: EstimatorLead['estimate']) {
  return {
    totalRoofArea: estimate.totalRoofArea,
    adjustedArea: estimate.adjustedArea,
    averagePitch: estimate.averagePitch,
    goodPrice: estimate.goodPrice,
    betterPrice: estimate.betterPrice,
    bestPrice: estimate.bestPrice,
    hasPitchSurcharge: estimate.hasPitchSurcharge,
    eaveLength: estimate.eaveLength,
    ridgeValleyLength: estimate.ridgeValleyLength,
    importedAt: new Date().toISOString(),
  };
}
