
import { describe, it, expect } from 'vitest';
import { flywheelCalculator } from './flywheelCalculator';

// These are the locked, audited parameters from the v33 model.
const DEFAULT_PARAMS = {
  fairMarketValue: 2300000,
  landValuePct: 0.40,
  bargainSalePrice: 1550000,
  investorDownPaymentPct: 0.20,
  sellerLoanRate: 0.075,
  sellerLoanAmortization: 30,
  coopBuyoutYear: 7,
  coopBuyoutRate: 0.06,
  coopLoanAmortization: 25,
  opExTaxes: 28344,
  opExInsurance: 9000,
  coopMaintAdmin: 10000,
  professionalManagementFee: 15000,
  coopManagementFeePct: 0.60,
  cltManagementFeePct: 0.40,
  cltGroundLease: 48000,
  numUnits: 25,
  opExVacancy: 0.05,
  bonusDepreciationRate: 1.0,
  depreciableAssetPct: 0.42,
  sellerFederalTaxBracket: 0.22,
  investorFederalTaxBracket: 0.35,
  stateIncomeTaxRate: 0.03688,
  federalCapGainsRate: 0.15,
  charitableDeductionPct: 0.40,
  sellerOriginalPurchasePrice: 500000,
  sellerHoldingPeriod: 30,
  sellerPartners: 2,
};

describe('flywheelCalculator', () => {
  let results;

  // Run the calculation once before all tests
  if (!results) {
    results = flywheelCalculator(DEFAULT_PARAMS);
  }

  describe('Seller Calculations', () => {
    it('should correctly calculate the seller\'s advantage vs. a conventional sale', () => {
      // These values are derived from the audited peer-review-package.md
      const expectedNetConventional = 1711216;
      const expectedNetBargainSale = 313000; // Simplified total net from downpayment + tax benefits
      const expectedAdvantage = ((expectedNetBargainSale / 2) - (expectedNetConventional / 2)) / (expectedNetConventional / 2) * 100;

      // Test Net Conventional Sale (After-Tax)
      expect(results.seller.NetConventionalSale).toBeCloseTo(expectedNetConventional, 0);

      // Test Net Bargain Sale (After-Tax)
      // This is the value that was previously calculated incorrectly.
      // It represents the seller's total net proceeds in the bargain sale model.
      expect(results.seller.NetBargainSale).toBeCloseTo(expectedNetBargainSale, 0);
      
      // Test Advantage Percentage
      expect(results.seller.advantagePct).toBeCloseTo(expectedAdvantage, 1);
    });

    it('should produce a valid amortization table', () => {
      expect(results.seller.amortizationTable).toBeInstanceOf(Array);
      expect(results.seller.amortizationTable.length).toBe(30);
      // From peer-review-package.md, the annual payment is $104,043
      expect(results.seller.NetAnnualPayment).toBeCloseTo(104043, 0);
    });
  });

  describe('Co-op Calculations', () => {
    it('should calculate Phase 1 and Phase 2 rents', () => {
      // Values from peer-review-package.md
      expect(results.coop.phase1MonthlyRent).toBeCloseTo(977, 0);
      expect(results.coop.phase2MonthlyRent).toBeCloseTo(941, 0);
      expect(results.coop.rentDecreasePct).toBeGreaterThan(0);
    });

    it('should determine the correct Year 7 buyout details', () => {
      expect(results.coop.residualPaymentYear7).toBeCloseTo(1116129, 0);
      expect(results.coop.shadowEquityYear7).toBeCloseTo(123871, 0);
    });
  });

  describe('Investor Calculations', () => {
    it('should calculate investor down payment and tax savings', () => {
        // Note: The number of investors is assumed to be 5 in the original model
        const expectedTaxSavingsPerInvestor = 64653;

        expect(results.investor.GrossDownPayment).toBe(310000);
        expect(results.investor.NetTaxSavingsYear1).toBeCloseTo(expectedTaxSavingsPerInvestor, 0);
    });
  });
});
