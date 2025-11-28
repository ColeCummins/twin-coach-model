import type {
  SimulationParams,
  SimulationResult,
  YearResult,
  TenantYearResult,
  SellerYearResult,
  ConventionalSaleAnalysis,
  TwinCoachSellerAnalysis,
  SellerComparison,
  InvestorExitAnalysis
} from "@shared/schema";
import { TCJA_BONUS_SCHEDULE, OBBBA_BONUS_SCHEDULE } from "@shared/schema";

const calculateDepreciation = (
  params: SimulationParams,
  structureBasis: number,
  yearsToTrack: number
): number[] => {
  const schedule: number[] = [];
  const scheduleMap = params.useOBBBA ? OBBBA_BONUS_SCHEDULE : TCJA_BONUS_SCHEDULE;

  let bonusRate = 0;
  if (params.useConservativeBonus) {
    bonusRate = scheduleMap[params.placedInServiceYear] !== undefined
      ? scheduleMap[params.placedInServiceYear]
      : 0;
  } else {
    bonusRate = params.useOBBBA ? 1.0 : (scheduleMap[params.placedInServiceYear] || 0);
  }

  const capex = {
    c5: params.capex_5yr,
    c7: params.capex_7yr,
    c15: params.capex_15yr,
    c27: structureBasis + params.capex_27yr
  };

  const b5 = capex.c5 * bonusRate;
  const r5 = capex.c5 - b5;
  const b7 = capex.c7 * bonusRate;
  const r7 = capex.c7 - b7;
  const b15 = capex.c15 * bonusRate;
  const r15 = capex.c15 - b15;

  const rates5 = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576];
  const rates7 = [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446];
  const rates15 = [0.05, 0.095, 0.0855, 0.077, 0.0693, 0.0623, 0.059, 0.059, 0.0591, 0.059, 0.0591, 0.059, 0.0591, 0.0295];

  for (let y = 1; y <= yearsToTrack; y++) {
    let total = 0;
    total += (y === 1 ? b5 : 0) + (r5 * (rates5[y - 1] || 0));
    total += (y === 1 ? b7 : 0) + (r7 * (rates7[y - 1] || 0));
    total += (y === 1 ? b15 : 0) + (r15 * (rates15[y - 1] || 0));

    if (y === 1) total += capex.c27 * 0.03485;
    else if (y <= 28) total += capex.c27 * 0.03636;
    else if (y === 29) total += capex.c27 * 0.03636 * 0.5;

    schedule.push(total);
  }
  return schedule;
};

const pmt = (rate: number, nper: number, pv: number): number => {
  if (rate === 0) return pv / nper;
  return pv * (rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
};

const calculateIRR = (cashFlows: number[], guess: number = 0.1): { irr: number; converged: boolean } => {
  const maxIterations = 1000;
  const tolerance = 0.00001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const denom = Math.pow(1 + rate, j);
      if (!isFinite(denom) || denom === 0) {
        return calculateIRRBisection(cashFlows);
      }
      npv += cashFlows[j] / denom;
      dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }

    if (Math.abs(dnpv) < tolerance) {
      return calculateIRRBisection(cashFlows);
    }

    const newRate = rate - npv / dnpv;

    if (!isFinite(newRate) || isNaN(newRate)) {
      return calculateIRRBisection(cashFlows);
    }

    if (Math.abs(newRate - rate) < tolerance) {
      return { irr: newRate, converged: true };
    }
    rate = newRate;
  }

  return calculateIRRBisection(cashFlows);
};

const calculateIRRBisection = (cashFlows: number[]): { irr: number; converged: boolean } => {
  let low = -0.99;
  let high = 5.0;
  const tolerance = 0.0001;
  const maxIterations = 100;

  const npv = (rate: number): number => {
    let sum = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      sum += cashFlows[j] / Math.pow(1 + rate, j);
    }
    return sum;
  };

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid);

    if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) {
      return { irr: mid, converged: true };
    }

    if (npvMid * npv(low) < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const totalCashIn = cashFlows.slice(1).reduce((a, b) => a + Math.max(0, b), 0);
  const totalCashOut = Math.abs(cashFlows[0]);
  const simpleReturn = totalCashOut > 0 ? (totalCashIn - totalCashOut) / totalCashOut : 0;
  const years = cashFlows.length - 1;
  const approxIRR = years > 0 ? Math.pow(1 + simpleReturn, 1 / years) - 1 : 0;

  return { irr: approxIRR, converged: false };
};

const calculateConventionalSale = (params: SimulationParams): ConventionalSaleAnalysis => {
  const commissionRate = 0.06;
  const closingCostRate = 0.02;

  const grossSalePrice = params.fairMarketValue;
  const commissions = grossSalePrice * commissionRate;
  const closingCosts = grossSalePrice * closingCostRate;
  const netSaleProceeds = grossSalePrice - commissions - closingCosts;

  const originalBasis = params.sellerOriginalPurchasePrice;
  const structureBasis = originalBasis - params.sellerOriginalLandValue;
  const annualDepreciation = structureBasis / 27.5;
  const accumulatedDepreciation = Math.min(structureBasis, annualDepreciation * params.sellerHoldingPeriod);
  const adjustedBasis = originalBasis - accumulatedDepreciation;
  const totalGain = netSaleProceeds - adjustedBasis;

  const depreciationRecapture = accumulatedDepreciation;
  const recaptureRate = params.sellerRecaptureRate;
  const recaptureTax = depreciationRecapture * recaptureRate;

  const capitalGain = Math.max(0, totalGain - depreciationRecapture);
  const capitalGainsRate = params.sellerCapitalGainsRate;
  const capitalGainsTax = capitalGain * capitalGainsRate;

  const niitRate = 0.038;
  const niitTax = params.sellerNIITApplies ? (capitalGain + depreciationRecapture) * niitRate : 0;

  const stateTax = totalGain * params.sellerStateTaxRate;
  const totalTaxes = recaptureTax + capitalGainsTax + niitTax + stateTax;

  const netAfterTaxProceeds = netSaleProceeds - totalTaxes;
  const perPartnerProceeds = netAfterTaxProceeds / params.sellerNumPartners;

  return {
    grossSalePrice,
    commissions,
    closingCosts,
    netSaleProceeds,
    originalBasis,
    accumulatedDepreciation,
    adjustedBasis,
    totalGain,
    depreciationRecapture,
    recaptureRate,
    recaptureTax,
    capitalGain,
    capitalGainsRate,
    capitalGainsTax,
    niitTax,
    stateTax,
    totalTaxes,
    netAfterTaxProceeds,
    perPartnerProceeds
  };
};

const calculateTwinCoachSellerAnalysis = (
  params: SimulationParams,
  finalLoanBalance: number,
  sellerInterestSchedule: { year: number; interest: number; principal: number }[],
  accumulatedDepreciation: number
): TwinCoachSellerAnalysis => {
  const day1CashReceived = params.investorDownPayment;
  const donationAmount = params.fairMarketValue - params.bargainSalePrice;

  const originalBasis = params.sellerOriginalPurchasePrice;
  const adjustedBasis = originalBasis - accumulatedDepreciation;

  const saleRatio = params.bargainSalePrice / params.fairMarketValue;
  const allocatedBasisToSale = adjustedBasis * saleRatio;
  const allocatedDepreciationToSale = accumulatedDepreciation * saleRatio;

  const gainOnSale = Math.max(0, params.bargainSalePrice - allocatedBasisToSale);
  const depreciationRecapture = Math.min(allocatedDepreciationToSale, gainOnSale);
  const capitalGain = Math.max(0, gainOnSale - depreciationRecapture);

  const recaptureRate = params.sellerRecaptureRate;
  const recaptureTax = depreciationRecapture * recaptureRate;
  const capitalGainsTax = capitalGain * params.sellerCapitalGainsRate;
  const niitTax = params.sellerNIITApplies ? (capitalGain + depreciationRecapture) * 0.038 : 0;
  const stateTaxOnSale = gainOnSale * params.sellerStateTaxRate;

  const totalDay1TaxesOwed = recaptureTax + capitalGainsTax + niitTax + stateTaxOnSale;

  // Donation tax savings: The CPA/Lawyer requirement is to apply this annually against interest.
  // So we do NOT treat it as a Day 1 lump sum offset for the "Net Day 1 Position" to be conservative/accurate.
  // However, we still calculate the *total potential* savings for comparison metrics.
  const charitableDeductionRate = Math.min(params.sellerTaxBracket + params.sellerStateTaxRate, 0.50);
  const totalPotentialDonationSavings = donationAmount * charitableDeductionRate;

  // Day 1 Position is now strictly: Cash Received - Taxes Owed.
  // The "Benefit" comes later as tax-free interest.
  const day1TaxesAfterDonation = totalDay1TaxesOwed; // No offset Day 1
  const netDay1Position = day1CashReceived - day1TaxesAfterDonation;

  // Track remaining charitable deduction carryforward
  let remainingDeduction = donationAmount;

  const sellerEffectiveTaxRate = params.sellerTaxBracket + params.sellerStateTaxRate;

  const annualSchedule: SellerYearResult[] = [];
  let cumulativeReceived = day1CashReceived;
  let totalInterestIncome = 0;
  let totalInterestTax = 0;
  let realizedDonationSavings = 0;

  for (const yearData of sellerInterestSchedule) {
    const interestIncome = yearData.interest;
    const deductionUsed = Math.min(interestIncome, remainingDeduction);
    remainingDeduction -= deductionUsed;

    const taxableInterest = interestIncome - deductionUsed;
    // Calculate what tax WOULD have been without deduction
    const taxWithoutDeduction = interestIncome * sellerEffectiveTaxRate;
    // Calculate actual tax
    const taxOnInterest = taxableInterest * sellerEffectiveTaxRate;

    realizedDonationSavings += (taxWithoutDeduction - taxOnInterest);

    const afterTaxIncome = yearData.interest - taxOnInterest + yearData.principal;
    cumulativeReceived += yearData.interest + yearData.principal;
    totalInterestIncome += yearData.interest;
    totalInterestTax += taxOnInterest;

    annualSchedule.push({
      year: yearData.year,
      interestIncome: yearData.interest,
      principalPayment: yearData.principal,
      totalPayment: yearData.interest + yearData.principal,
      taxOnInterest,
      afterTaxIncome,
      cumulativeReceived
    });
  }

  const netInterestIncome = totalInterestIncome - totalInterestTax;

  const balloonPayment = finalLoanBalance;
  const adjustedBasisAtSale = originalBasis;
  const notePrincipal = params.bargainSalePrice - params.investorDownPayment;
  const principalRepaid = notePrincipal - finalLoanBalance;
  const remainingBasis = adjustedBasisAtSale - principalRepaid;
  const gainOnBalloon = Math.max(0, balloonPayment - remainingBasis);

  const balloonTax = gainOnBalloon * params.sellerCapitalGainsRate +
                     (params.sellerNIITApplies ? gainOnBalloon * 0.038 : 0);
  const netBalloonProceeds = balloonPayment - balloonTax;

  const totalCashReceived = day1CashReceived + totalInterestIncome +
                            sellerInterestSchedule.reduce((sum, y) => sum + y.principal, 0) +
                            balloonPayment;

  // Total taxes paid is Sum of Interest Tax + Balloon Tax.
  // The "Savings" are implicitly handled because totalInterestTax is lower.
  const totalTaxesPaid = totalInterestTax + balloonTax;

  // We use the "realized" savings for the metric display if needed, or total potential.
  // But for the calculation of net proceeds, we just subtract the actual taxes paid.
  const netAfterTaxTotal = totalCashReceived - totalTaxesPaid - totalDay1TaxesOwed;
  const perPartnerTotal = netAfterTaxTotal / params.sellerNumPartners;

  return {
    day1CashReceived,
    donationAmount,
    day1TaxesDue: totalDay1TaxesOwed,
    donationTaxSavings: realizedDonationSavings, // Show what was actually used
    netDay1Position,
    totalInterestIncome,
    totalInterestTax,
    netInterestIncome,
    balloonPayment,
    adjustedBasisAtSale,
    gainOnBalloon,
    balloonTax,
    netBalloonProceeds,
    totalCashReceived,
    totalTaxesPaid,
    netAfterTaxTotal,
    perPartnerTotal,
    annualSchedule
  };
};

export const runSimulation = (params: SimulationParams): SimulationResult => {
  const warnings: string[] = [];
  const annualResults: YearResult[] = [];
  const tenantSchedule: TenantYearResult[] = [];
  const sellerInterestSchedule: { year: number; interest: number; principal: number }[] = [];

  // Compute bargain sale price from land donation/land ratio percentage
  const computedBargainSalePrice = params.fairMarketValue - (params.fairMarketValue * params.landRatio);
  const updatedParams: SimulationParams = {
    ...params,
    bargainSalePrice: computedBargainSalePrice
  };

  const landValue = params.fairMarketValue * params.landRatio;
  const structureBasis = computedBargainSalePrice - landValue;
  const totalCapex = params.capex_5yr + params.capex_7yr + params.capex_15yr + params.capex_27yr;
  const closingCosts = 20000;
  const totalInitialInvestment = params.investorDownPayment + totalCapex + closingCosts;

  const notePrincipal = computedBargainSalePrice - params.investorDownPayment;
  const monthlyRate = params.sellerLoanRate / 12;
  const monthlyPmt1 = pmt(monthlyRate, params.sellerLoanAmortization * 12, notePrincipal);
  const annualDebtService = monthlyPmt1 * 12;

  const depSchedule = calculateDepreciation(updatedParams, structureBasis, params.investorExitYear + 5);

  let loanBalance = notePrincipal;
  let suspendedLossesAccumulated = 0;
  let currentAssetValue = params.fairMarketValue;

  const yearsToSimulate = params.investorExitYear + 5;
  let coopLoanBalance = 0;
  let coopStartPrincipal = 0;
  const irrCashFlows: number[] = [-totalInitialInvestment];

  let totalCashFlowAfterTax = 0;
  let year1CashFlow = 0;
  let year1TaxSavings = 0;
  let totalSuspendedLossesReleased = 0;
  let sellerTotalInterest = 0;
  let totalDepreciation = 0;
  let totalInterestDeductions = 0;
  let totalPaperLosses = 0;

  let tempLoanBalance = notePrincipal;

  for (let year = 1; year <= yearsToSimulate; year++) {
    const isPostExit = year > params.investorExitYear;

    const propTaxInflationFactor = year === 1 ? 1 : Math.pow(1 + params.propTaxInflation, year - 1);
    const insuranceInflationFactor = year === 1 ? 1 : Math.pow(1 + params.insuranceInflation, year - 1);
    const landLeaseInflationFactor = year === 1 ? 1 : Math.pow(1 + params.landLeaseInflation, year - 1);

    currentAssetValue = currentAssetValue * 1.02;

    const taxMultiplier = (isPostExit && params.enableHomesteadExemption) ? 0.75 : 1.0;
    const currentPropTax = params.propTax * taxMultiplier * propTaxInflationFactor;
    const currentInsurance = params.insurance * insuranceInflationFactor;
    const currentCltFee = params.cltGroundLeaseFee * landLeaseInflationFactor;
    const currentMgmtFee = params.professionalManagementFee * landLeaseInflationFactor;
    const currentLandLease = currentCltFee + currentMgmtFee;

    const expenses = currentPropTax + currentInsurance + currentLandLease;
    const repairs = (year === 1) ? params.year1Repairs : 0;

    let yearDebtService: number;
    if (!isPostExit) {
      const yearInterest = tempLoanBalance * params.sellerLoanRate;
      if (year <= params.interestOnlyPeriod) {
        yearDebtService = yearInterest;
      } else {
        yearDebtService = annualDebtService;
      }
      const yearPrincipal = year <= params.interestOnlyPeriod ? 0 : (annualDebtService - yearInterest);
      tempLoanBalance -= yearPrincipal;
    } else {
      yearDebtService = 0;
    }

    const yearReserves = yearDebtService * params.trueCostReservePct;
    // MBA Perspective: Vacancy Ramp (Higher in Year 1)
    // Let's assume Year 1 vacancy is +5% higher than stabilized rate, or just double?
    // The prompt says "Allow vacancyRate to be higher in Year 1... A flat rate understates Year 1 risk."
    // I will add a multiplier for Year 1 (e.g. 1.5x) or just add 5%.
    // Let's add 5% to the base rate for Year 1.
    const effectiveVacancyRate = (year === 1) ? Math.min(1.0, params.vacancyRate + 0.05) : params.vacancyRate;
    const occupancyRate = 1 - effectiveVacancyRate;
    const totalYearCosts = expenses + repairs + yearDebtService + yearReserves;

    let effectiveMonthlyRent: number;
    // For Phase 2 (Co-op/PostExit) OR if calculateRentFromCosts is true, use cost-based formula
    if (isPostExit || params.calculateRentFromCosts) {
      effectiveMonthlyRent = totalYearCosts / (params.numUnits * 12 * occupancyRate);
    } else {
      const rentFactor = params.rentInflationEnabled ? Math.pow(1 + params.rentInflationRate, year - 1) : 1;
      effectiveMonthlyRent = params.monthlyRent * rentFactor;
    }

    const annualRentBase = effectiveMonthlyRent * params.numUnits * 12;
    const effectiveGrossIncome = annualRentBase * occupancyRate;

    const noi = effectiveGrossIncome - expenses - repairs;

    let interestPayment = 0;
    let principalPayment = 0;
    let currentDebtService = 0;

    if (!isPostExit) {
      interestPayment = loanBalance * params.sellerLoanRate;
      currentDebtService = annualDebtService;
      principalPayment = annualDebtService - interestPayment;

      if (year <= params.interestOnlyPeriod) {
        principalPayment = 0;
        currentDebtService = interestPayment;
      }
      loanBalance -= principalPayment;
      sellerTotalInterest += interestPayment;
      totalInterestDeductions += interestPayment;

      sellerInterestSchedule.push({
        year,
        interest: interestPayment,
        principal: principalPayment
      });
    }

    let coopDebtService = 0;
    let coopPrincipalPaydown = 0;

    if (isPostExit) {
      if (year === params.investorExitYear + 1) {
        const equityKickerAmount = totalCapex * params.capexBuyoutSplitPct;
        coopStartPrincipal = loanBalance - equityKickerAmount;
        coopLoanBalance = coopStartPrincipal;
      }

      const coopMonthlyRate = params.coopRefiRate / 12;
      const coopMonthlyPmt = pmt(coopMonthlyRate, params.coopRefiAmortization * 12, coopStartPrincipal);

      coopDebtService = coopMonthlyPmt * 12;
      const coopInterest = coopLoanBalance * params.coopRefiRate;
      coopPrincipalPaydown = coopDebtService - coopInterest;
      coopLoanBalance -= coopPrincipalPaydown;
    }

    const currentDepreciation = isPostExit ? 0 : (depSchedule[year - 1] || 0);
    if (!isPostExit) {
      totalDepreciation += currentDepreciation;
    }

    const paperLoss = interestPayment + currentDepreciation;
    if (!isPostExit) {
      totalPaperLosses += paperLoss;
    }

    const taxableIncome = noi - interestPayment - currentDepreciation;
    const localTaxBase = Math.max(0, noi - interestPayment);
    const localTax = (isPostExit || !params.localTaxAppliesToInterest) ? 0 : localTaxBase * params.localTaxRate;

    let stateTaxRate = 0;
    if (params.useOhioTax) {
      if (params.enableOhioBID) {
        stateTaxRate = taxableIncome > 250000 ? 0.03 : 0.00;
      } else {
        stateTaxRate = 0.0399;
      }
    } else {
      stateTaxRate = params.customStateTaxRate;
    }
    const effectiveTaxRate = params.investorTaxBracket + stateTaxRate;

    let realizedTaxSavings = 0;
    let suspendedLossIncurred = 0;
    let suspendedLossReleased = 0;

    if (!isPostExit) {
      if (taxableIncome < 0) {
        const canDeductAgainstOrdinaryIncome = params.isRealEstateProfessional || !params.forcePassiveInvestor;

        if (canDeductAgainstOrdinaryIncome) {
          realizedTaxSavings = Math.abs(taxableIncome) * effectiveTaxRate;
        } else {
          const maxDeduction = params.passiveIncomeToOffset;
          const totalLoss = Math.abs(taxableIncome);
          if (totalLoss > maxDeduction) {
            const allowedLoss = maxDeduction;
            suspendedLossIncurred = totalLoss - allowedLoss;
            realizedTaxSavings = allowedLoss * effectiveTaxRate;
            suspendedLossesAccumulated += suspendedLossIncurred;
          } else {
            realizedTaxSavings = totalLoss * effectiveTaxRate;
          }
        }
      } else {
        realizedTaxSavings = -(taxableIncome * effectiveTaxRate);
      }
    }

    if (year === params.investorExitYear && suspendedLossesAccumulated > 0) {
      suspendedLossReleased = suspendedLossesAccumulated;
      realizedTaxSavings += suspendedLossReleased * effectiveTaxRate;
      totalSuspendedLossesReleased = suspendedLossReleased;
      suspendedLossesAccumulated = 0;
    }

    const totalTaxImpact = realizedTaxSavings - localTax;
    const cashFlowBeforeTax = isPostExit ? 0 : (noi - currentDebtService);
    const cashFlowAfterTax = isPostExit ? 0 : (cashFlowBeforeTax + totalTaxImpact);

    if (!isPostExit) {
      totalCashFlowAfterTax += cashFlowAfterTax;
      if (year <= params.investorExitYear) {
        irrCashFlows.push(cashFlowAfterTax + (year === params.investorExitYear ? loanBalance : 0));
      }
    }

    if (year === 1) {
      year1CashFlow = cashFlowBeforeTax;
      year1TaxSavings = totalTaxImpact;
    }

    // MBA Perspective: Vacancy Ramp
    // "Allow vacancyRate to be higher in Year 1... stabilize in Year 2."
    // We already used `params.vacancyRate` for all years above.
    // We need to adjust Year 1 to be higher.
    // However, the loop above has already run for this iteration using `params.vacancyRate`.
    // I should have modified the loop start.
    // Instead of complex refactoring, I will just note that I should update the loop in a separate step or
    // acknowledge that I missed inserting it inside the loop in the previous thought.
    // To fix this cleanly, I should update the `vacancyRate` usage inside the loop.
    // I will do that in the next step or patch it here if I can find the line.

    annualResults.push({
      year,
      label: `Year ${year}`,
      noi,
      debtService: isPostExit ? 0 : currentDebtService,
      cashFlowBeforeTax,
      taxableIncome,
      taxSavings: totalTaxImpact,
      paperLoss: isPostExit ? 0 : paperLoss,
      suspendedLossIncurred,
      suspendedLossReleased,
      cashFlowAfterTax,
      loanBalance: isPostExit ? 0 : loanBalance,
      principalPaydown: principalPayment,
      interestPayment,
      appreciation: currentAssetValue,
      totalReturn: isPostExit ? 0 : (cashFlowAfterTax + principalPayment),
      depreciation: currentDepreciation,
      calculatedRent: effectiveMonthlyRent
    });

    let cumulativePrinc = 0;
    if (isPostExit) {
      const phase1Equity = notePrincipal - (coopStartPrincipal + (totalCapex * params.capexBuyoutSplitPct));
      const phase2Equity = coopStartPrincipal - coopLoanBalance;
      cumulativePrinc = phase1Equity + phase2Equity;
    } else {
      cumulativePrinc = notePrincipal - loanBalance;
    }

    const coopPortionOfLease = currentLandLease * params.landLeaseCoopSplitPct;
    const reserveHoldback = coopPortionOfLease * params.turnoverReservePct;
    const netDistribution = coopPortionOfLease - reserveHoldback;
    const phase2AnnualCost = coopDebtService + expenses;

    tenantSchedule.push({
      year,
      phase: isPostExit ? 'Co-op' : 'Investor',
      monthlyRent: Math.round(effectiveMonthlyRent),
      monthlyResidentDist: Math.round(netDistribution / 12 / params.numUnits),
      monthlyReserves: Math.round(reserveHoldback / 12 / params.numUnits),
      cumulativePrincipalReduction: Math.round(cumulativePrinc / params.numUnits),
      carryCost: Math.round(phase2AnnualCost / 12 / params.numUnits)
    });
  }

  const finalLoanBalance = annualResults[params.investorExitYear - 1]?.loanBalance || 0;
  // MBA Perspective: Add Refinance Costs (e.g. 1.5%) to the loan amount the Co-op must take on.
  // The buyoutPrice is the amount sent to the seller/investors.
  // The Co-op Loan Amount = Buyout Price + Refi Costs.
  // The prompt says: "Add refinanceCostsPct... applied to the buyoutPrice... This increases the loan amount the Co-op must take on."

  const buyoutPrice = finalLoanBalance - (totalCapex * params.capexBuyoutSplitPct);
  const refiCosts = buyoutPrice * params.refinanceCostsPct;
  const coopLoanAmount = buyoutPrice + refiCosts;

  const coopMonthlyMortgage = pmt(params.coopRefiRate / 12, params.coopRefiAmortization * 12, coopLoanAmount);

  // DSCR Stress Test: Year 7 Market Rents vs Year 7 Expenses.
  // Currently exitYearNOI is based on "Actual" rents.
  // If rents are restricted (calculated), market rents might be higher.
  // We need to calculate what Market NOI would be.
  // Let's assume Market Rent = params.monthlyRent inflated by rentInflationRate?
  // Or if params.monthlyRent IS the restricted rent...
  // The schema has `monthlyRent` which might be the market baseline if `calculateRentFromCosts` is false.
  // But if `calculateRentFromCosts` is true, we don't track "Market Rent".
  // However, `getRentBand` implies we know market.
  // For simplicity, let's assume the "NOI" used for DSCR should be the projected NOI at that year,
  // but if rent is restricted, banks might underwrite to the restricted rent?
  // The prompt says: "Calculate DSCR based on Year 7 Expenses and Year 7 Market Rents... Lenders size loans based on market feasibility".
  // I need a way to track "Market Rent" separately if `calculateRentFromCosts` is on.
  // Let's re-calculate Market Rent purely for this metric.
  const marketRentBase = params.monthlyRent; // This is the input
  const marketRentYearExit = marketRentBase * Math.pow(1 + params.rentInflationRate, params.investorExitYear);
  const marketGrossIncome = marketRentYearExit * params.numUnits * 12 * (1 - params.vacancyRate);

  // We need Year 7 Expenses (Exit Year).
  // We can get expenses from annualResults[params.investorExitYear-1] or re-calc.
  // Let's re-calc to be safe or pull from results.
  // Actually, `annualResults` stores `noi`. We need `expenses`.
  // NOI = Revenue - Expenses.
  // Expenses = Revenue - NOI.
  // But Revenue in annualResults might be the restricted revenue.
  // Let's reconstruct Exit Year Expenses.
  const exitYearIndex = params.investorExitYear; // 1-based index means index is ExitYear-1? No, Year 1 is index 0.
  // Actually annualResults has `year` property.
  const exitYearResult = annualResults.find(r => r.year === params.investorExitYear);
  // Re-calculate expenses for exit year
  const propTaxInf = Math.pow(1 + params.propTaxInflation, params.investorExitYear - 1);
  const insInf = Math.pow(1 + params.insuranceInflation, params.investorExitYear - 1);
  const landInf = Math.pow(1 + params.landLeaseInflation, params.investorExitYear - 1);
  const exitExpenses = (params.propTax * propTaxInf) + (params.insurance * insInf) + ((params.cltGroundLeaseFee + params.professionalManagementFee) * landInf);

  const marketNOI = marketGrossIncome - exitExpenses;

  const exitYearNOI = marketNOI; // Use Market NOI for DSCR per MBA request
  const exitYearDebtService = coopMonthlyMortgage * 12;
  const dscrAtExit = exitYearDebtService > 0 ? exitYearNOI / exitYearDebtService : 0;

  const irrResult = calculateIRR(irrCashFlows);
  const totalNetProfit = totalCashFlowAfterTax + (notePrincipal - finalLoanBalance);

  const donationAmount = params.fairMarketValue - params.bargainSalePrice;
  const sellerDay1Proceeds = params.investorDownPayment;
  const sellerBalloon = finalLoanBalance;
  const sellerTotalReceived = sellerDay1Proceeds + sellerTotalInterest + sellerBalloon;

  const conventionalAnalysis = calculateConventionalSale(updatedParams);
  const accumulatedDepAtExit = depSchedule.reduce((sum, val) => sum + val, 0);
  const twinCoachAnalysis = calculateTwinCoachSellerAnalysis(updatedParams, finalLoanBalance, sellerInterestSchedule, accumulatedDepAtExit);

  const advantageAmount = twinCoachAnalysis.netAfterTaxTotal - conventionalAnalysis.netAfterTaxProceeds;
  const advantagePercent = conventionalAnalysis.netAfterTaxProceeds > 0
    ? (advantageAmount / conventionalAnalysis.netAfterTaxProceeds) * 100
    : 0;

  let breakEvenYear = 0;
  let cumulativeTwinCoach = twinCoachAnalysis.netDay1Position;
  for (const yearResult of twinCoachAnalysis.annualSchedule) {
    cumulativeTwinCoach += yearResult.afterTaxIncome;
    if (cumulativeTwinCoach >= conventionalAnalysis.netAfterTaxProceeds && breakEvenYear === 0) {
      breakEvenYear = yearResult.year;
    }
  }

  const discountRate = 0.05;
  let npvTwinCoach = twinCoachAnalysis.netDay1Position;
  for (let i = 0; i < twinCoachAnalysis.annualSchedule.length; i++) {
    npvTwinCoach += twinCoachAnalysis.annualSchedule[i].afterTaxIncome / Math.pow(1 + discountRate, i + 1);
  }
  npvTwinCoach += twinCoachAnalysis.netBalloonProceeds / Math.pow(1 + discountRate, params.investorExitYear);
  const npvAdvantage = npvTwinCoach - conventionalAnalysis.netAfterTaxProceeds;

  const sellerComparison: SellerComparison = {
    conventional: conventionalAnalysis,
    twinCoach: twinCoachAnalysis,
    advantageAmount,
    advantagePercent,
    breakEvenYear,
    npvAdvantage
  };

  const coopPortionAnnual = (params.cltGroundLeaseFee + params.professionalManagementFee) * params.landLeaseCoopSplitPct;
  const residentDistAnnual = coopPortionAnnual * (1 - params.turnoverReservePct);
  const turnoverReserveAnnual = coopPortionAnnual * params.turnoverReservePct;

  if (dscrAtExit < 1.2) {
    warnings.push("Co-op DSCR is below 1.2 - may have difficulty securing financing");
  }
  if (year1CashFlow < 0 && !params.calculateRentFromCosts) {
    warnings.push("Negative cash flow in Year 1 - review rent or expense assumptions");
  }
  if (params.bargainSalePrice > params.fairMarketValue * 0.8) {
    warnings.push("Bargain sale price is relatively high - increase land donation percentage for better tax benefits");
  }
  if (irrResult.irr * 100 < 8) {
    warnings.push("IRR is below 8% - may not be attractive to investors");
  }
  if (!irrResult.converged) {
    warnings.push("IRR calculation used fallback method - verify cash flow assumptions");
  }
  if (advantagePercent < 0) {
    warnings.push("Twin Coach model shows lower returns than conventional sale for seller");
  }
  if (!params.isRealEstateProfessional && totalPaperLosses > 0) {
    warnings.push("Passive investor limitations may defer tax benefits - consider REP status");
  }

  const avgTaxRate = totalInitialInvestment > 0
    ? ((year1TaxSavings + totalCashFlowAfterTax - totalNetProfit + totalSuspendedLossesReleased) / totalInitialInvestment)
    : 0;

  const totalTaxSavings = annualResults
    .filter(r => r.year <= params.investorExitYear && r.taxSavings > 0)
    .reduce((sum, r) => sum + r.taxSavings, 0);

  const investorExitSaleProceeds = buyoutPrice;
  const investorOriginalBasis = totalInitialInvestment;
  const investorAccumulatedDep = totalDepreciation;
  const investorAdjustedBasis = Math.max(0, investorOriginalBasis - investorAccumulatedDep);
  const investorTotalGain = investorExitSaleProceeds - investorAdjustedBasis;
  const investorDepreciationRecapture = Math.min(investorAccumulatedDep, Math.max(0, investorTotalGain));
  const investorRecaptureTax = investorDepreciationRecapture * 0.25;
  const investorCapitalGain = Math.max(0, investorTotalGain - investorDepreciationRecapture);
  const investorCapitalGainsTax = investorCapitalGain * params.sellerCapitalGainsRate +
    (params.sellerNIITApplies ? investorCapitalGain * 0.038 : 0);

  let investorStateTaxRate = 0;
  if (params.useOhioTax) {
    investorStateTaxRate = params.enableOhioBID ? 0.03 : 0.0399;
  } else {
    investorStateTaxRate = params.customStateTaxRate;
  }
  const investorStateTax = investorTotalGain * investorStateTaxRate;

  const suspendedLossOffset = totalSuspendedLossesReleased * (params.investorTaxBracket + investorStateTaxRate);
  const investorGrossTaxLiability = investorRecaptureTax + investorCapitalGainsTax + investorStateTax;
  const investorNetTaxLiability = Math.max(0, investorGrossTaxLiability - suspendedLossOffset);
  const investorNetAfterTaxProceeds = investorExitSaleProceeds - investorNetTaxLiability;

  const investorExitAnalysis: InvestorExitAnalysis = {
    saleProceeds: investorExitSaleProceeds,
    originalBasis: investorOriginalBasis,
    accumulatedDepreciation: investorAccumulatedDep,
    adjustedBasis: investorAdjustedBasis,
    totalGain: investorTotalGain,
    depreciationRecapture: investorDepreciationRecapture,
    recaptureTax: investorRecaptureTax,
    capitalGain: investorCapitalGain,
    capitalGainsTax: investorCapitalGainsTax,
    stateTax: investorStateTax,
    suspendedLossOffset,
    totalTaxLiability: investorNetTaxLiability,
    netAfterTaxProceeds: investorNetAfterTaxProceeds
  };

  return {
    annualResults,
    tenantSchedule,
    sellerComparison,
    metrics: {
      investor: {
        totalInvested: totalInitialInvestment,
        totalNetProfit,
        roiFirstYearTaxAdjusted: ((year1CashFlow + year1TaxSavings) / totalInitialInvestment) * 100,
        irr: irrResult.irr * 100,
        irrFallback: !irrResult.converged,
        cashOnCashYear1: (year1CashFlow / totalInitialInvestment) * 100,
        averageAnnualReturn: (totalNetProfit / params.investorExitYear / totalInitialInvestment) * 100,
        totalSuspendedLossesReleased,
        totalDepreciation,
        totalInterestDeductions,
        totalPaperLosses,
        effectiveTaxRate: avgTaxRate,
        totalTaxSavings,
        exitAnalysis: investorExitAnalysis
      },
      seller: {
        donationAmount,
        day1NetProceeds: sellerDay1Proceeds,
        totalCashReceived: sellerTotalReceived,
        advantageOverConventional: advantagePercent,
        monthlyIncome: monthlyPmt1
      },
      coop: {
        buyoutPrice,
        monthlyMortgageAtExit: coopMonthlyMortgage,
        isViable: dscrAtExit >= 1.2,
        dscrAtExit,
        cltPortionAnnual: (params.cltGroundLeaseFee + params.professionalManagementFee) * (1 - params.landLeaseCoopSplitPct),
        residentDistAnnual,
        turnoverReserveAnnual,
        shadowEquityPerUnit: Math.round((notePrincipal - finalLoanBalance) / params.numUnits),
        calculatedMonthlyRent: Math.round(annualResults[0]?.calculatedRent || 0)
      },
      warnings
    }
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
};

export const generateCSVData = (result: SimulationResult): string => {
  const headers = [
    'Year', 'Phase', 'NOI', 'Debt Service', 'Cash Flow Before Tax',
    'Depreciation', 'Interest', 'Paper Loss', 'Taxable Income',
    'Tax Savings', 'Cash Flow After Tax', 'Loan Balance',
    'Principal Paydown', 'Total Return', 'Monthly Rent'
  ];

  const rows = result.annualResults.map((r, i) => [
    r.year,
    result.tenantSchedule[i]?.phase || 'N/A',
    r.noi.toFixed(0),
    r.debtService.toFixed(0),
    r.cashFlowBeforeTax.toFixed(0),
    r.depreciation.toFixed(0),
    r.interestPayment.toFixed(0),
    r.paperLoss.toFixed(0),
    r.taxableIncome.toFixed(0),
    r.taxSavings.toFixed(0),
    r.cashFlowAfterTax.toFixed(0),
    r.loanBalance.toFixed(0),
    r.principalPaydown.toFixed(0),
    r.totalReturn.toFixed(0),
    r.calculatedRent.toFixed(0)
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

export const generateSellerCSV = (comparison: SellerComparison): string => {
  const lines: string[] = [];

  lines.push('SELLER COMPARISON ANALYSIS');
  lines.push('');
  lines.push('CONVENTIONAL SALE');
  lines.push(`Gross Sale Price,${comparison.conventional.grossSalePrice}`);
  lines.push(`Less: Commissions,${comparison.conventional.commissions}`);
  lines.push(`Less: Closing Costs,${comparison.conventional.closingCosts}`);
  lines.push(`Net Sale Proceeds,${comparison.conventional.netSaleProceeds}`);
  lines.push('');
  lines.push(`Original Basis,${comparison.conventional.originalBasis}`);
  lines.push(`Accumulated Depreciation,${comparison.conventional.accumulatedDepreciation}`);
  lines.push(`Adjusted Basis,${comparison.conventional.adjustedBasis}`);
  lines.push(`Total Gain,${comparison.conventional.totalGain}`);
  lines.push('');
  lines.push(`Depreciation Recapture Tax,${comparison.conventional.recaptureTax}`);
  lines.push(`Capital Gains Tax,${comparison.conventional.capitalGainsTax}`);
  lines.push(`NIIT Tax,${comparison.conventional.niitTax}`);
  lines.push(`State Tax,${comparison.conventional.stateTax}`);
  lines.push(`Total Taxes,${comparison.conventional.totalTaxes}`);
  lines.push('');
  lines.push(`Net After-Tax Proceeds,${comparison.conventional.netAfterTaxProceeds}`);
  lines.push('');
  lines.push('TWIN COACH MODEL');
  lines.push(`Day 1 Cash Received,${comparison.twinCoach.day1CashReceived}`);
  lines.push(`Donation Tax Savings,${comparison.twinCoach.donationTaxSavings}`);
  lines.push(`Net Day 1 Position,${comparison.twinCoach.netDay1Position}`);
  lines.push('');
  lines.push(`Total Interest Income,${comparison.twinCoach.totalInterestIncome}`);
  lines.push(`Less: Interest Tax,${comparison.twinCoach.totalInterestTax}`);
  lines.push(`Net Interest Income,${comparison.twinCoach.netInterestIncome}`);
  lines.push('');
  lines.push(`Balloon Payment,${comparison.twinCoach.balloonPayment}`);
  lines.push(`Less: Balloon Tax,${comparison.twinCoach.balloonTax}`);
  lines.push(`Net Balloon Proceeds,${comparison.twinCoach.netBalloonProceeds}`);
  lines.push('');
  lines.push(`Total Cash Received,${comparison.twinCoach.totalCashReceived}`);
  lines.push(`Net After-Tax Total,${comparison.twinCoach.netAfterTaxTotal}`);
  lines.push('');
  lines.push('COMPARISON');
  lines.push(`Advantage Amount,${comparison.advantageAmount}`);
  lines.push(`Advantage Percent,${comparison.advantagePercent.toFixed(2)}%`);
  lines.push(`Break-Even Year,${comparison.breakEvenYear}`);
  lines.push(`NPV Advantage (5%),${comparison.npvAdvantage}`);
  lines.push('');
  lines.push('ANNUAL SELLER SCHEDULE');
  lines.push('Year,Interest Income,Principal Payment,Total Payment,Tax on Interest,After-Tax Income,Cumulative Received');

  for (const yr of comparison.twinCoach.annualSchedule) {
    lines.push(`${yr.year},${yr.interestIncome.toFixed(0)},${yr.principalPayment.toFixed(0)},${yr.totalPayment.toFixed(0)},${yr.taxOnInterest.toFixed(0)},${yr.afterTaxIncome.toFixed(0)},${yr.cumulativeReceived.toFixed(0)}`);
  }

  return lines.join('\n');
};

export const generatePDFReport = async (
  params: SimulationParams,
  result: SimulationResult
): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  const colors = {
    primary: [37, 99, 235] as [number, number, number],
    success: [22, 163, 74] as [number, number, number],
    warning: [234, 179, 8] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    dark: [15, 23, 42] as [number, number, number],
    light: [248, 250, 252] as [number, number, number]
  };

  const addHeader = (text: string, size: number = 14, color: [number, number, number] = colors.dark) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(text, margin, yPos);
    yPos += size + 8;
  };

  const addText = (text: string, size: number = 10, color: [number, number, number] = colors.dark) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(text, margin, yPos);
    yPos += size + 4;
  };

  const addMetricRow = (label: string, value: string, highlight: boolean = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...colors.muted);
    doc.text(label, margin, yPos);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(highlight ? colors.success : colors.dark));
    doc.text(value, pageWidth - margin, yPos, { align: 'right' });
    yPos += 16;
  };

  const addDivider = () => {
    doc.setDrawColor(...colors.light);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 12;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('Twin Coach Deal Analysis', margin, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Affordable Housing Co-op Conversion Financial Model', margin, 58);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, pageWidth - margin, 40, { align: 'right' });

  yPos = 110;

  addHeader('Executive Summary', 16, colors.primary);
  yPos += 4;

  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yPos, contentWidth, 80, 4, 4, 'F');
  yPos += 16;

  const col1 = margin + 16;
  const col2 = margin + contentWidth / 3 + 16;
  const col3 = margin + (contentWidth / 3) * 2 + 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text('Total Investment', col1, yPos);
  doc.text('IRR', col2, yPos);
  doc.text('Seller Advantage', col3, yPos);
  yPos += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colors.dark);
  doc.text(formatCurrency(result.metrics.investor.totalInvested), col1, yPos);
  doc.text(formatPercent(result.metrics.investor.irr), col2, yPos);
  doc.setTextColor(...(result.sellerComparison.advantagePercent > 0 ? colors.success : colors.warning));
  doc.text(`${result.sellerComparison.advantagePercent > 0 ? '+' : ''}${formatPercent(result.sellerComparison.advantagePercent)}`, col3, yPos);

  yPos += 52;
  addDivider();

  addHeader('Deal Parameters', 14, colors.primary);
  yPos += 4;

  addMetricRow('Fair Market Value', formatCurrency(params.fairMarketValue));
  addMetricRow('Bargain Sale Price', formatCurrency(params.bargainSalePrice));
  addMetricRow('Donation Amount', formatCurrency(params.fairMarketValue - params.bargainSalePrice));
  addMetricRow('Investor Down Payment', formatCurrency(params.investorDownPayment));
  addMetricRow('Number of Units', params.numUnits.toString());
  addMetricRow('Monthly Rent per Unit', formatCurrency(params.monthlyRent));
  addMetricRow('Seller Loan Rate', formatPercent(params.sellerLoanRate * 100));
  addMetricRow('Investor Exit Year', `Year ${params.investorExitYear}`);

  yPos += 8;
  addDivider();

  addHeader('Investor Returns', 14, colors.primary);
  yPos += 4;

  addMetricRow('Total Investment', formatCurrency(result.metrics.investor.totalInvested));
  addMetricRow('Net Profit', formatCurrency(result.metrics.investor.totalNetProfit), true);
  addMetricRow('Year 1 Tax-Adjusted ROI', formatPercent(result.metrics.investor.roiFirstYearTaxAdjusted), true);
  addMetricRow('Internal Rate of Return (IRR)', formatPercent(result.metrics.investor.irr), true);
  addMetricRow('Cash-on-Cash Year 1', formatPercent(result.metrics.investor.cashOnCashYear1));
  addMetricRow('Total Depreciation', formatCurrency(result.metrics.investor.totalDepreciation));
  addMetricRow('Total Interest Deductions', formatCurrency(result.metrics.investor.totalInterestDeductions));
  addMetricRow('Total Paper Losses', formatCurrency(result.metrics.investor.totalPaperLosses), true);

  yPos += 8;
  checkPageBreak(200);
  addDivider();

  addHeader('Seller Analysis', 14, colors.primary);
  yPos += 4;

  addText('Conventional Sale:', 11, colors.dark);
  yPos += 4;
  addMetricRow('Gross Sale Price', formatCurrency(result.sellerComparison.conventional.grossSalePrice));
  addMetricRow('Total Taxes', formatCurrency(result.sellerComparison.conventional.totalTaxes));
  addMetricRow('Net After-Tax Proceeds', formatCurrency(result.sellerComparison.conventional.netAfterTaxProceeds));

  yPos += 8;
  addText('Twin Coach Model:', 11, colors.dark);
  yPos += 4;
  addMetricRow('Day 1 Cash Received', formatCurrency(result.sellerComparison.twinCoach.day1CashReceived));
  addMetricRow('Donation Tax Savings', formatCurrency(result.sellerComparison.twinCoach.donationTaxSavings), true);
  addMetricRow('Total Interest Income', formatCurrency(result.sellerComparison.twinCoach.totalInterestIncome));
  addMetricRow('Net After-Tax Total', formatCurrency(result.sellerComparison.twinCoach.netAfterTaxTotal), true);

  yPos += 8;
  addText('Comparison:', 11, colors.primary);
  yPos += 4;
  addMetricRow('Net Advantage', formatCurrency(result.sellerComparison.advantageAmount), result.sellerComparison.advantageAmount > 0);
  addMetricRow('Advantage %', formatPercent(result.sellerComparison.advantagePercent), result.sellerComparison.advantagePercent > 0);
  addMetricRow('Break-Even Year', result.sellerComparison.breakEvenYear > 0 ? `Year ${result.sellerComparison.breakEvenYear}` : 'N/A');
  addMetricRow('NPV Advantage (5%)', formatCurrency(result.sellerComparison.npvAdvantage));

  yPos += 8;
  checkPageBreak(200);
  addDivider();

  addHeader('Co-op / Resident Metrics', 14, colors.primary);
  yPos += 4;

  addMetricRow('Buyout Price', formatCurrency(result.metrics.coop.buyoutPrice));
  addMetricRow('Monthly Mortgage at Exit', formatCurrency(result.metrics.coop.monthlyMortgageAtExit));
  addMetricRow('DSCR at Exit', result.metrics.coop.dscrAtExit.toFixed(2) + 'x');
  addMetricRow('Calculated Monthly Rent', formatCurrency(result.metrics.coop.calculatedMonthlyRent));
  addMetricRow('Shadow Equity per Unit', formatCurrency(result.metrics.coop.shadowEquityPerUnit));
  addMetricRow('Annual Resident Distribution', formatCurrency(result.metrics.coop.residentDistAnnual));

  doc.addPage();
  yPos = margin;

  addHeader('Annual Investor Schedule', 16, colors.primary);
  yPos += 8;

  const investorYears = result.annualResults.slice(0, params.investorExitYear);
  const investorTableData = investorYears.map(yr => [
    yr.year.toString(),
    formatCurrency(yr.noi),
    formatCurrency(yr.debtService),
    formatCurrency(yr.cashFlowBeforeTax),
    formatCurrency(yr.depreciation),
    formatCurrency(yr.paperLoss),
    formatCurrency(yr.taxSavings),
    formatCurrency(yr.cashFlowAfterTax),
    formatCurrency(yr.loanBalance)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Year', 'NOI', 'Debt Svc', 'Pre-Tax CF', 'Deprec.', 'Paper Loss', 'Tax Impact', 'After-Tax CF', 'Loan Bal']],
    body: investorTableData,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      halign: 'right'
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: colors.light
    },
    margin: { left: margin, right: margin }
  });

  yPos = (doc as any).lastAutoTable.finalY + 24;
  checkPageBreak(200);

  addHeader('Seller Annual Schedule', 16, colors.primary);
  yPos += 8;

  const sellerTableData = result.sellerComparison.twinCoach.annualSchedule.map(yr => [
    yr.year.toString(),
    formatCurrency(yr.interestIncome),
    formatCurrency(yr.principalPayment),
    formatCurrency(yr.totalPayment),
    formatCurrency(yr.taxOnInterest),
    formatCurrency(yr.afterTaxIncome),
    formatCurrency(yr.cumulativeReceived)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Year', 'Interest', 'Principal', 'Total Pmt', 'Tax', 'After-Tax', 'Cumulative']],
    body: sellerTableData,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      halign: 'right'
    },
    headStyles: {
      fillColor: colors.success,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: colors.light
    },
    margin: { left: margin, right: margin }
  });

  if (result.metrics.warnings.length > 0) {
    yPos = (doc as any).lastAutoTable.finalY + 24;
    checkPageBreak(100);

    addHeader('Warnings & Considerations', 14, colors.warning);
    yPos += 4;

    result.metrics.warnings.forEach(warning => {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(margin, yPos - 10, contentWidth, 20, 2, 2, 'F');
      addText(`• ${warning}`, 9, colors.dark);
      yPos += 8;
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
    doc.text(
      'Twin Coach Deal Configurator',
      margin,
      pageHeight - 20
    );
  }

  doc.save(`twin-coach-analysis-${Date.now()}.pdf`);
};

export type { SimulationParams, SimulationResult } from "@shared/schema";
