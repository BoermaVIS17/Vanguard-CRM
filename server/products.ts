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
export const PROMO_CODES = {
  NEIGHBOR25: {
    code: "NEIGHBOR25",
    discountPercent: 100, // 100% off = free
    description: "Neighborhood Survey Promo - Fee Waived",
  },
  // Add more promo codes as needed
} as const;

export type PromoCodeKey = keyof typeof PROMO_CODES;

/**
 * Validate a promo code and return discount info
 */
export function validatePromoCode(code: string): { valid: boolean; discountPercent: number; description?: string } {
  const normalizedCode = code.toUpperCase().trim();
  const promoEntry = Object.values(PROMO_CODES).find(p => p.code === normalizedCode);
  
  if (promoEntry) {
    return {
      valid: true,
      discountPercent: promoEntry.discountPercent,
      description: promoEntry.description,
    };
  }
  
  return { valid: false, discountPercent: 0 };
}
