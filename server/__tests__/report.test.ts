import { describe, it, expect } from "vitest";
import { validatePromoCode, getAllPromoCodes } from "../products";

describe("Promo Code Validation", () => {
  it("should validate NEIGHBOR25 promo code as valid with 100% discount", () => {
    const result = validatePromoCode("NEIGHBOR25");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("General Campaign");
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

describe("Sales Rep Promo Codes", () => {
  it("should validate REP-MIKE with correct sales rep attribution", () => {
    const result = validatePromoCode("REP-MIKE");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("Mike");
  });

  it("should validate REP-SARAH with correct sales rep attribution", () => {
    const result = validatePromoCode("REP-SARAH");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("Sarah");
  });

  it("should validate REP-JOHN with correct sales rep attribution", () => {
    const result = validatePromoCode("rep-john"); // lowercase
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("John");
  });

  it("should validate REP-ALEX with correct sales rep attribution", () => {
    const result = validatePromoCode("REP-ALEX");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("Alex");
  });

  it("should validate REP-CHRIS with correct sales rep attribution", () => {
    const result = validatePromoCode("REP-CHRIS");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("Chris");
  });

  it("should validate regional codes like PINELLAS25", () => {
    const result = validatePromoCode("PINELLAS25");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("Pinellas Team");
  });

  it("should validate regional codes like HILLSBOROUGH25", () => {
    const result = validatePromoCode("HILLSBOROUGH25");
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(100);
    expect(result.salesRep).toBe("Hillsborough Team");
  });
});

describe("Get All Promo Codes", () => {
  it("should return all available promo codes", () => {
    const codes = getAllPromoCodes();
    expect(codes.length).toBeGreaterThan(0);
    expect(codes.some(c => c.code === "NEIGHBOR25")).toBe(true);
    expect(codes.some(c => c.code === "REP-MIKE")).toBe(true);
  });

  it("should include salesRep in each code", () => {
    const codes = getAllPromoCodes();
    codes.forEach(code => {
      expect(code).toHaveProperty("salesRep");
      expect(code).toHaveProperty("code");
      expect(code).toHaveProperty("discountPercent");
    });
  });
});
