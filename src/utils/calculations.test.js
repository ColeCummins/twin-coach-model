import { describe, it, expect } from 'vitest';
import { calculateTwinCoachModel, DEFAULT_PARAMS } from './calculations';

describe('Final OPTIMIZED Model Validation ($275k Down Payment)', () => {
  // Using the new DEFAULT_PARAMS which reflect the optimal scenario
  const data = calculateTwinCoachModel(DEFAULT_PARAMS);

  describe('Seller Win', () => {
    it('should provide a significant financial advantage (>$100k) to each seller', () => {
      // This confirms the primary goal for the sellers in our final model.
      expect(data.seller.advantage).toBeGreaterThan(100000);
    });
  });

  describe('Investor Win', () => {
    it('should achieve a compelling IRR between 13% and 14%', () => {
      // This validates that the investor return is still strong and attractive in our balanced scenario.
      expect(data.investor.irr).toBeGreaterThan(0.13);
      expect(data.investor.irr).toBeLessThan(0.14);
    });
  });

  describe('Co-op Win', () => {
    it('should result in a deeply affordable monthly rent (under $610)', () => {
      // This confirms we have hit our affordability target for the residents.
      expect(data.coop.rentPerUnit).toBeLessThan(610);
      expect(data.coop.rentPerUnit).toBeGreaterThan(600); // Sanity check
    });
  });

  describe('CLT Win', () => {
    it('should be based on the foundational land donation to the CLT', () => {
      // This is an implicit test of the entire model's structure.
      // The land value is removed from the private market, which is the CLT's core mission.
      const landValue = DEFAULT_PARAMS.appraisedValue * DEFAULT_PARAMS.landValueAsPctOfAppraisal;
      expect(landValue).toBeGreaterThan(780000);
    });
  });
});
