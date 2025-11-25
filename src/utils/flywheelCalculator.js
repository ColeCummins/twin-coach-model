
function calculateSellerAmortization(principal, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  const monthlyPayment = (principal * monthlyRate) / 
                         (1 - Math.pow(1 + monthlyRate, -numPayments));
  const annualPayment = monthlyPayment * 12;

  let balance = principal;
  let cumulativePrincipal = 0;
  const amortizationTable = [];

  for (let year = 1; year <= years; year++) {
    const annualInterest = balance * annualRate;
    const annualPrincipal = annualPayment - annualInterest;

    balance -= annualPrincipal;
    cumulativePrincipal += annualPrincipal;

    amortizationTable.push({
      year: year,
      annualPayment: annualPayment,
      interest: annualInterest,
      principal: annualPrincipal,
      cumulativePrincipal: cumulativePrincipal,
      remainingBalance: Math.max(0, balance)
    });
  }

  return {
    annualPayment: annualPayment,
    amortizationTable: amortizationTable
  };
}

function calculatePhase1Rent(params, annualSellerPayment) {
  const annualOpEx = 
    params.opExTaxes + 
    params.opExInsurance + 
    params.coopMaintAdmin +
    (params.professionalManagementFee * params.coopManagementFeePct) +
    params.cltGroundLease;

  const totalAnnualCost = annualOpEx + annualSellerPayment;
  const grossRevenueRequired = totalAnnualCost / (1 - params.opExVacancy);
  const monthlyRent = grossRevenueRequired / 12 / params.numUnits;

  return monthlyRent;
}

function calculateShadowEquity(amortizationTable, buyoutYear) {
  if (buyoutYear < 1 || buyoutYear > amortizationTable.length) {
    return {
      shadowEquity: 0,
      remainingBalance: 0
    };
  }

  const yearData = amortizationTable[buyoutYear - 1];

  return {
    shadowEquity: yearData.cumulativePrincipal,
    remainingBalance: yearData.remainingBalance
  };
}

function calculateYear7Refinance(remainingBalance, params) {
  const refinanceRate = params.coopBuyoutRate;
  const refinanceTerm = params.coopLoanAmortization;

  const monthlyRate = refinanceRate / 12;
  const numPayments = refinanceTerm * 12;
  const monthlyPayment = (remainingBalance * monthlyRate) / 
                         (1 - Math.pow(1 + monthlyRate, -numPayments));
  const annualPayment = monthlyPayment * 12;

  return {
    refinancePrincipal: remainingBalance,
    refinanceRate: refinanceRate,
    refinanceTerm: refinanceTerm,
    annualPayment: annualPayment,
    monthlyPayment: monthlyPayment
  };
}

function calculatePhase2Rent(params, refinanceAnnualPayment) {
  const annualOpEx = 
    params.opExTaxes + 
    params.opExInsurance + 
    params.coopMaintAdmin +
    (params.professionalManagementFee * params.coopManagementFeePct) +
    params.cltGroundLease;

  const totalAnnualCost = annualOpEx + refinanceAnnualPayment;
  const grossRevenueRequired = totalAnnualCost / (1 - params.opExVacancy);
  const monthlyRent = grossRevenueRequired / 12 / params.numUnits;

  return monthlyRent;
}

function calculateSellerAdvantage(params) {
  const FMV = params.fairMarketValue;
  const BSP = params.bargainSalePrice;
  const downPayment = BSP * params.investorDownPaymentPct;

  const conventionalGross = FMV * (1 - 0.06 - 0.02);
  const conventionalGain = FMV - params.sellerOriginalPurchasePrice;
  const conventionalTax = conventionalGain * 
    (params.federalCapGainsRate + params.stateIncomeTaxRate + 0.038);
  const conventionalNet = conventionalGross - conventionalTax;
  const conventionalPerPartner = conventionalNet / params.sellerPartners;

  const buildingGain = BSP - (params.sellerOriginalPurchasePrice * 0.60);
  const day1Tax = buildingGain * 
    (params.federalCapGainsRate + params.stateIncomeTaxRate);
  const day1Net = downPayment - day1Tax;
  const day1PerPartner = day1Net / params.sellerPartners;

  const incomeSmoothingBenefit = (conventionalGain * 0.038) / 2;
  const charityDeduction = FMV * params.charitableDeductionPct;
  const charityBenefit = charityDeduction * params.sellerFederalTaxBracket;

  const totalTaxAdvantage = incomeSmoothingBenefit + charityBenefit;
  const taxAdvantagePerPartner = totalTaxAdvantage / params.sellerPartners;

  const bargainSaleTotal = day1PerPartner + taxAdvantagePerPartner;
  const advantagePct = ((bargainSaleTotal - conventionalPerPartner) / 
                        conventionalPerPartner) * 100;

  return {
    conventionalNet: conventionalNet,
    conventionalGross: conventionalGross,
    conventionalPerPartner: conventionalPerPartner,
    bargainSaleTotal: bargainSaleTotal,
    advantagePct: advantagePct,
    incomeSmoothingBenefit: incomeSmoothingBenefit,
    charityBenefit: charityBenefit
  };
}

function calculateInvestorTaxBenefits(params, annualSellerPayment) {
  const buildingBasis = params.bargainSalePrice;
  const depreciableBasis = buildingBasis * params.depreciableAssetPct;
  const bonusDepreciation = depreciableBasis * params.bonusDepreciationRate;
  const sellerNotePrincipal = buildingBasis - 
    (buildingBasis * params.investorDownPaymentPct);
  const year1Interest = sellerNotePrincipal * params.sellerLoanRate;
  const regularDepreciation = (buildingBasis * 0.02) / 27.5;
  const totalDeductions = bonusDepreciation + year1Interest + regularDepreciation;
  const taxSavings = totalDeductions * params.investorFederalTaxBracket;
  const numInvestors = 5;
  const taxSavingsPerInvestor = taxSavings / numInvestors;

  return {
    bonusDepreciation: bonusDepreciation,
    year1Interest: year1Interest,
    totalDeductions: totalDeductions,
    taxSavingsGroup: taxSavings,
    taxSavingsPerInvestor: taxSavingsPerInvestor
  };
}

export function flywheelCalculator(params) {
  // Prioritize absolute down payment if present (from UI), otherwise use percentage
  const downPayment = params.investorDownPayment !== undefined
    ? params.investorDownPayment
    : params.bargainSalePrice * params.investorDownPaymentPct;

  const sellerNotePrincipal = params.bargainSalePrice - downPayment;

  const sellerAmort = calculateSellerAmortization(
    sellerNotePrincipal,
    params.sellerLoanRate,
    params.sellerLoanAmortization
  );

  const shadowEquity = calculateShadowEquity(
    sellerAmort.amortizationTable,
    params.coopBuyoutYear
  );

  const sellerAdvantage = calculateSellerAdvantage(params);
  const phase1Rent = calculatePhase1Rent(params, sellerAmort.annualPayment);
  const year7Refinance = calculateYear7Refinance(
    shadowEquity.remainingBalance,
    params
  );
  const phase2Rent = calculatePhase2Rent(params, year7Refinance.annualPayment);
  const investorBenefits = calculateInvestorTaxBenefits(
    params,
    sellerAmort.annualPayment
  );

  // --- Warning Checks ---
  const warnings = [];

  // Day 1 Solvency Check
  // We reuse day1Net from sellerAdvantage calculation (DownPayment - Day1Tax)
  // and subtract closing costs to see the actual cash in hand.
  // Note: We assume day1Net in sellerAdvantage is strictly (DownPayment - Taxes).
  // sellerAdvantage.day1Net isn't returned explicitly, but we can infer or recalculate.
  // Let's recalculate for clarity and safety.

  const buildingGain = params.bargainSalePrice - (params.sellerOriginalPurchasePrice * 0.60);
  const day1Tax = buildingGain * (params.federalCapGainsRate + params.stateIncomeTaxRate);
  const closingCosts = params.bargainSaleClosingCosts || 0;
  const sellerNetCashDay1 = downPayment - (day1Tax + closingCosts);

  const minSellerCash = 20000; // Safety buffer

  if (sellerNetCashDay1 < minSellerCash) {
      warnings.push({
          title: 'Day 1 Cash Insolvency Risk',
          message: `CRITICAL: The Seller's Day 1 Net Cash ($${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(sellerNetCashDay1)}) is insufficient to cover taxes and closing costs with a safety buffer. Increase the Investor Down Payment.`
      });
  }

  return {
    params: params,
    warnings: warnings,
    seller: {
      GrossNotePrincipal: sellerNotePrincipal,
      NetAnnualPayment: sellerAmort.annualPayment,
      amortizationTable: sellerAmort.amortizationTable,
      advantagePct: sellerAdvantage.advantagePct,
      GrossConventionalSale: sellerAdvantage.conventionalGross,
      NetConventionalSale: sellerAdvantage.conventionalNet,
      GrossBargainSale: (sellerAdvantage.bargainSaleTotal * params.sellerPartners) + sellerAdvantage.conventionalTax, // Approximate Total
      NetBargainSale: sellerAdvantage.bargainSaleTotal * params.sellerPartners // Converted to Total
    },
    coop: {
      phase1MonthlyRent: phase1Rent,
      phase2MonthlyRent: phase2Rent,
      rentDecreasePct: ((phase1Rent - phase2Rent) / phase1Rent) * 100,
      shadowEquityYear7: shadowEquity.shadowEquity,
      residualPaymentYear7: shadowEquity.remainingBalance,
      refinanceDetails: year7Refinance
    },
    investor: {
      GrossDownPayment: downPayment,
      bonusDepreciationYear1: investorBenefits.bonusDepreciation,
      GrossTotalDeductionsYear1: investorBenefits.totalDeductions,
      NetTaxSavingsYear1: investorBenefits.taxSavingsPerInvestor,
      holdPeriod: params.coopBuyoutYear
    },
    clt: {
      landValue: params.fairMarketValue * params.landValuePct,
      annualGroundLease: params.cltGroundLease,
      annualPMFee: params.professionalManagementFee * params.cltManagementFeePct
    }
  };
}
