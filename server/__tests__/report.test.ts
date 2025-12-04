import { describe, it, expect } from "vitest";
import { validatePromoCode } from "../products";

describe("Promo Code Validation", () => {
  it("should validate NEIGHBOR25 promo code as valid with 100% discount", () => {
    const result = validatePromoCode("NEIGHBOR25");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
  });

  it("should validate lowercase neighbor25 as valid (case insensitive)", () => {
    const result = validatePromoCode("neighbor25");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
  });

  it("should validate mixed case Neighbor25 as valid", () => {
    const result = validatePromoCode("Neighbor25");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
  });

  it("should return invalid for unknown promo codes", () => {
    const result = validatePromoCode("INVALIDCODE");
    expect(result.valid).toBe(false);
    expect(result.discountPercent).toBe(0);
  });

  it("should return invalid for empty string", () => {
    const result = validatePromoCode("");
    expect(result.valid).toBe(false);
    expect(result.discountPercent).toBe(0);
  });

  it("should handle whitespace in promo codes", () => {
    const result = validatePromoCode("  NEIGHBOR25  ");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
  });
});
