import { z } from "zod";

export const simulationParamsSchema = z.object({
  investorExitYear: z.number().min(1).max(30),
  placedInServiceYear: z.number().min(2020).max(2035),

  numUnits: z.number().min(1).max(500),
  fairMarketValue: z.number().min(0),
  landRatio: z.number().min(0).max(1),
  bargainSalePrice: z.number().min(0),

  capex_5yr: z.number().min(0),
  capex_7yr: z.number().min(0),
  capex_15yr: z.number().min(0),
  capex_27yr: z.number().min(0),
  year1Repairs: z.number().min(0),

  investorDownPayment: z.number().min(0),
  sellerLoanRate: z.number().min(0).max(0.25),
  sellerLoanAmortization: z.number().min(1).max(40),
  interestOnlyPeriod: z.number().min(0).max(10),

  monthlyRent: z.number().min(0),
  vacancyRate: z.number().min(0).max(1),
  rentInflationEnabled: z.boolean(),
  rentInflationRate: z.number().min(0).max(0.10),
  trueCostReservePct: z.number().min(0).max(0.5),
  calculateRentFromCosts: z.boolean(),

  propTax: z.number().min(0),
  propTaxInflation: z.number().min(0).max(0.10),
  insurance: z.number().min(0),
  insuranceInflation: z.number().min(0).max(0.10),

  cltGroundLeaseFee: z.number().min(0),
  professionalManagementFee: z.number().min(0),
  landLeaseInflation: z.number().min(0).max(0.10),
  landLeaseCoopSplitPct: z.number().min(0).max(1),
  turnoverReservePct: z.number().min(0).max(0.25),

  refinanceCostsPct: z.number().min(0).max(0.10),

  useOhioTax: z.boolean(),
  enableOhioBID: z.boolean(),
  isRealEstateProfessional: z.boolean(),
  customStateTaxRate: z.number().min(0).max(0.15),
  localTaxRate: z.number().min(0).max(0.05),
  localTaxAppliesToInterest: z.boolean(),
  investorTaxBracket: z.number().min(0.1).max(0.5),
  useConservativeBonus: z.boolean(),
  useOBBBA: z.boolean(),
  forcePassiveInvestor: z.boolean(),
  passiveIncomeToOffset: z.number().min(0),

  equityKickerPct: z.number().min(0).max(0.5),
  capexBuyoutSplitPct: z.number().min(0).max(1),
  coopRefiRate: z.number().min(0).max(0.15),
  coopRefiTerm: z.number().min(1).max(30),
  coopRefiAmortization: z.number().min(1).max(40),
  enableHomesteadExemption: z.boolean(),

  sellerOriginalPurchasePrice: z.number().min(0),
  sellerOriginalLandValue: z.number().min(0),
  sellerHoldingPeriod: z.number().min(0).max(50),
  sellerOtherIncome: z.number().min(0),
  sellerRecaptureRate: z.number().min(0).max(0.5),

  sellerNumPartners: z.number().min(1).max(10),
  sellerTaxBracket: z.number().min(0.1).max(0.5),
  sellerStateTaxRate: z.number().min(0).max(0.15),
  sellerCapitalGainsRate: z.number().min(0).max(0.25),
  sellerNIITApplies: z.boolean(),
});

export type SimulationParams = z.infer<typeof simulationParamsSchema>;

export interface YearResult {
  year: number;
  label: string;
  noi: number;
  debtService: number;
  cashFlowBeforeTax: number;
  taxableIncome: number;
  paperLoss: number;
  suspendedLossIncurred: number;
  suspendedLossReleased: number;
  taxSavings: number;
  cashFlowAfterTax: number;
  loanBalance: number;
  principalPaydown: number;
  interestPayment: number;
  appreciation: number;
  totalReturn: number;
  depreciation: number;
  calculatedRent: number;
}

export interface TenantYearResult {
  year: number;
  monthlyRent: number;
  monthlyResidentDist: number;
  monthlyReserves: number;
  cumulativePrincipalReduction: number;
  phase: 'Investor' | 'Co-op';
  carryCost: number;
}

export interface SellerYearResult {
  year: number;
  interestIncome: number;
  principalPayment: number;
  totalPayment: number;
  taxOnInterest: number;
  afterTaxIncome: number;
  cumulativeReceived: number;
}

export interface ConventionalSaleAnalysis {
  grossSalePrice: number;
  commissions: number;
  closingCosts: number;
  netSaleProceeds: number;

  originalBasis: number;
  accumulatedDepreciation: number;
  adjustedBasis: number;
  totalGain: number;

  depreciationRecapture: number;
  recaptureRate: number;
  recaptureTax: number;

  capitalGain: number;
  capitalGainsRate: number;
  capitalGainsTax: number;

  niitTax: number;
  stateTax: number;
  totalTaxes: number;

  netAfterTaxProceeds: number;
  perPartnerProceeds: number;
}

export interface TwinCoachSellerAnalysis {
  day1CashReceived: number;
  donationAmount: number;
  day1TaxesDue: number;
  donationTaxSavings: number;
  netDay1Position: number;

  totalInterestIncome: number;
  totalInterestTax: number;
  netInterestIncome: number;

  balloonPayment: number;
  adjustedBasisAtSale: number;
  gainOnBalloon: number;
  balloonTax: number;
  netBalloonProceeds: number;

  totalCashReceived: number;
  totalTaxesPaid: number;
  netAfterTaxTotal: number;
  perPartnerTotal: number;

  annualSchedule: SellerYearResult[];
}

export interface SellerComparison {
  conventional: ConventionalSaleAnalysis;
  twinCoach: TwinCoachSellerAnalysis;
  advantageAmount: number;
  advantagePercent: number;
  breakEvenYear: number;
  npvAdvantage: number;
}

export interface InvestorExitAnalysis {
  saleProceeds: number;
  originalBasis: number;
  accumulatedDepreciation: number;
  adjustedBasis: number;
  totalGain: number;
  depreciationRecapture: number;
  recaptureTax: number;
  capitalGain: number;
  capitalGainsTax: number;
  stateTax: number;
  suspendedLossOffset: number;
  totalTaxLiability: number;
  netAfterTaxProceeds: number;
}

export interface InvestorMetrics {
  totalInvested: number;
  totalNetProfit: number;
  roiFirstYearTaxAdjusted: number;
  irr: number;
  irrFallback: boolean;
  cashOnCashYear1: number;
  averageAnnualReturn: number;
  totalSuspendedLossesReleased: number;
  totalDepreciation: number;
  totalInterestDeductions: number;
  totalPaperLosses: number;
  effectiveTaxRate: number;
  totalTaxSavings: number;
  exitAnalysis: InvestorExitAnalysis;
}

export interface SellerMetrics {
  donationAmount: number;
  day1NetProceeds: number;
  totalCashReceived: number;
  advantageOverConventional: number;
  monthlyIncome: number;
}

export interface CoopMetrics {
  buyoutPrice: number;
  monthlyMortgageAtExit: number;
  isViable: boolean;
  dscrAtExit: number;
  cltPortionAnnual: number;
  residentDistAnnual: number;
  turnoverReserveAnnual: number;
  shadowEquityPerUnit: number;
  calculatedMonthlyRent: number;
}

export interface SimulationResult {
  annualResults: YearResult[];
  tenantSchedule: TenantYearResult[];
  sellerComparison: SellerComparison;
  metrics: {
    investor: InvestorMetrics;
    seller: SellerMetrics;
    coop: CoopMetrics;
    warnings: string[];
  };
}

export const DEFAULT_PARAMS: SimulationParams = {
  fairMarketValue: 2300000,
  bargainSalePrice: 1600000,
  landRatio: 0.30,
  investorDownPayment: 320000,
  numUnits: 25,

  sellerLoanRate: 0.06,
  sellerLoanAmortization: 30,
  interestOnlyPeriod: 0,

  investorExitYear: 7,
  placedInServiceYear: 2025,
  investorTaxBracket: 0.37,
  useOhioTax: true,
  enableOhioBID: true,
  isRealEstateProfessional: true,
  customStateTaxRate: 0.05,
  localTaxRate: 0.015,
  useOBBBA: true,
  useConservativeBonus: false,
  forcePassiveInvestor: false,
  passiveIncomeToOffset: 100000,

  capex_5yr: 80000,
  capex_7yr: 5000,
  capex_15yr: 60000,
  capex_27yr: 95000,
  year1Repairs: 15000,

  monthlyRent: 850,
  vacancyRate: 0.05,
  rentInflationEnabled: true,
  rentInflationRate: 0.02,
  trueCostReservePct: 0.10,
  calculateRentFromCosts: true,

  propTax: 28344,
  propTaxInflation: 0.02,
  insurance: 9000,
  insuranceInflation: 0.03,
  cltGroundLeaseFee: 30000,
  professionalManagementFee: 15000,
  landLeaseInflation: 0.00,
  landLeaseCoopSplitPct: 0.60,
  turnoverReservePct: 0.05,

  refinanceCostsPct: 0.015,

  equityKickerPct: 0.10,
  capexBuyoutSplitPct: 0.50,
  coopRefiRate: 0.07,
  coopRefiTerm: 10,
  coopRefiAmortization: 25,
  enableHomesteadExemption: true,

  sellerOriginalPurchasePrice: 600000,
  sellerOriginalLandValue: 100000,
  sellerHoldingPeriod: 20,
  sellerOtherIncome: 100000,
  sellerRecaptureRate: 0.25,

  sellerNumPartners: 1,
  sellerTaxBracket: 0.35,
  sellerStateTaxRate: 0.0399,
  sellerCapitalGainsRate: 0.20,
  sellerNIITApplies: true,

  localTaxAppliesToInterest: false,
};

export const TCJA_BONUS_SCHEDULE: Record<number, number> = {
  2023: 0.80, 2024: 0.60, 2025: 0.40, 2026: 0.20, 2027: 0.00
};

export const OBBBA_BONUS_SCHEDULE: Record<number, number> = {
  2023: 0.80, 2024: 0.60, 2025: 1.00, 2026: 1.00, 2027: 1.00, 2028: 1.00
};
