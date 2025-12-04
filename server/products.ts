/**
 * Product configuration for Storm Documentation Report
 */

export const PRODUCTS = {
  STORM_REPORT: {
    name: "Premium Storm Documentation Report",
    description: "Comprehensive storm documentation package including drone imagery, NOAA data, and certified contractor condition summary.",
    priceInCents: 19900, // $199.00
    currency: "usd",
  }
} as const;

// Valid promo codes that waive the fee
// Each sales rep gets their own code for tracking attribution
export const PROMO_CODES: Record<string, {
  code: string;
  discountPercent: number;
  description: string;
  salesRep?: string;
}> = {
  // Default/General promo code
  NEIGHBOR25: {
    code: "NEIGHBOR25",
    discountPercent: 100,
    description: "Neighborhood Survey Promo - Fee Waived",
    salesRep: "General Campaign",
  },
  
  // Sales Rep specific codes - Add your reps here
  // Format: REP-[NAME] or custom codes
  "REP-MIKE": {
    code: "REP-MIKE",
    discountPercent: 100,
    description: "Sales Rep Promo - Fee Waived",
    salesRep: "Mike",
  },
  "REP-SARAH": {
    code: "REP-SARAH",
    discountPercent: 100,
    description: "Sales Rep Promo - Fee Waived",
    salesRep: "Sarah",
  },
  "REP-JOHN": {
    code: "REP-JOHN",
    discountPercent: 100,
    description: "Sales Rep Promo - Fee Waived",
    salesRep: "John",
  },
  "REP-ALEX": {
    code: "REP-ALEX",
    discountPercent: 100,
    description: "Sales Rep Promo - Fee Waived",
    salesRep: "Alex",
  },
  "REP-CHRIS": {
    code: "REP-CHRIS",
    discountPercent: 100,
    description: "Sales Rep Promo - Fee Waived",
    salesRep: "Chris",
  },
  
  // You can also create neighborhood-specific codes
  "PINELLAS25": {
    code: "PINELLAS25",
    discountPercent: 100,
    description: "Pinellas County Campaign - Fee Waived",
    salesRep: "Pinellas Team",
  },
  "HILLSBOROUGH25": {
    code: "HILLSBOROUGH25",
    discountPercent: 100,
    description: "Hillsborough County Campaign - Fee Waived",
    salesRep: "Hillsborough Team",
  },
};

export type PromoCodeKey = keyof typeof PROMO_CODES;

/**
 * Validate a promo code and return discount info with sales rep attribution
 */
export function validatePromoCode(code: string): { 
  valid: boolean; 
  discountPercent: number; 
  description?: string;
  salesRep?: string;
} {
  const normalizedCode = code.toUpperCase().trim();
  const promoEntry = Object.values(PROMO_CODES).find(p => p.code === normalizedCode);
  
  if (promoEntry) {
    return {
      valid: true,
      discountPercent: promoEntry.discountPercent,
      description: promoEntry.description,
      salesRep: promoEntry.salesRep,
    };
  }
  
  return { valid: false, discountPercent: 0 };
}

/**
 * Get all available promo codes (for admin reference)
 */
export function getAllPromoCodes() {
  return Object.values(PROMO_CODES).map(p => ({
    code: p.code,
    salesRep: p.salesRep,
    discountPercent: p.discountPercent,
  }));
}
